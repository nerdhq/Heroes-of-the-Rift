import type { StateCreator } from "zustand";
import type { GameStore } from "../types";
import { isSupabaseConfigured, getSupabase } from "../../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

let gameStateChannel: RealtimeChannel | null = null;

// Debounce timer for coalescing rapid syncs
let syncDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 100;

// ============================================
// MULTIPLAYER STATE & ACTIONS
// ============================================

export interface MultiplayerState {
  isOnline: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedVersion: number;
  syncError: string | null;
  localPlayerIndex: number; // Which player index this client controls
}

export interface MultiplayerActions {
  setOnlineMode: (online: boolean) => void;
  setConnected: (connected: boolean) => void;
  syncState: () => Promise<void>;
  syncGameStateToSupabase: () => Promise<void>;
  debouncedSyncGameState: () => void;
  subscribeToGameState: () => void;
  unsubscribeFromGameState: () => void;
  submitAction: (actionType: string, actionData: Record<string, unknown>) => Promise<boolean>;
  handleStateUpdate: (newState: Record<string, unknown>) => void;
  clearSyncError: () => void;
}

// Initial multiplayer state
export const initialMultiplayerState: MultiplayerState = {
  isOnline: false,
  isConnected: false,
  isSyncing: false,
  lastSyncedVersion: 0,
  syncError: null,
  localPlayerIndex: 0,
};

// ============================================
// CREATE MULTIPLAYER SLICE
// ============================================

export const createMultiplayerSlice: StateCreator<
  GameStore,
  [],
  [],
  MultiplayerState & MultiplayerActions
> = (set, get) => ({
  ...initialMultiplayerState,

  // Set online mode
  setOnlineMode: (online: boolean) => {
    set({ isOnline: online });
  },

  // Set connection status
  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  // Sync full state from server
  syncState: async () => {
    const { currentGameId, isOnline } = get();
    if (!isSupabaseConfigured() || !isOnline || !currentGameId) {
      return;
    }

    const client = getSupabase();
    set({ isSyncing: true, syncError: null });

    try {
      // Fetch game state
      const { data: gameState, error: stateError } = await client
        .from("game_state")
        .select("*")
        .eq("game_id", currentGameId)
        .single();

      if (stateError) {
        set({ syncError: stateError.message, isSyncing: false });
        return;
      }

      if (gameState) {
        // Update local state with server state
        set({
          phase: gameState.phase,
          currentPlayerIndex: gameState.current_player_index,
          turn: gameState.turn,
          round: gameState.round,
          maxRounds: gameState.max_rounds,
          environment: gameState.environment,
          monsters: gameState.monsters || [],
          selectedCardId: gameState.selected_card_id,
          selectedTargetId: gameState.selected_target_id,
          drawnCards: gameState.drawn_cards || [],
          log: gameState.log || [],
          lastSyncedVersion: gameState.version,
          isSyncing: false,
        });
      }

      // Fetch player states
      const { data: playerStates } = await client
        .from("player_state")
        .select("*, game_players(*)")
        .eq("game_id", currentGameId);

      if (playerStates) {
        // Map player states to local Player format
        const players = playerStates.map((ps) => ({
          id: ps.game_player_id,
          name: ps.game_players?.hero_name || `Player ${ps.game_players?.player_index + 1}`,
          class: ps.game_players?.class_type || "warrior",
          hp: ps.hp,
          maxHp: ps.max_hp,
          shield: ps.shield,
          baseAggro: ps.base_aggro,
          diceAggro: ps.dice_aggro,
          buffs: ps.buffs || [],
          debuffs: ps.debuffs || [],
          deck: ps.deck || [],
          discard: ps.discard || [],
          hand: ps.hand || [],
          resource: ps.resource,
          maxResource: ps.max_resource,
          gold: ps.gold,
          isAlive: ps.is_alive,
          isStealth: ps.is_stealth,
          hasTaunt: ps.has_taunt,
          isStunned: ps.is_stunned,
          accuracyPenalty: ps.accuracy_penalty,
        }));

        set({ players });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      set({ syncError: message, isSyncing: false });
    }
  },

  // Submit an action to the server
  submitAction: async (actionType: string, actionData: Record<string, unknown>) => {
    const { currentGameId, isOnline, lastSyncedVersion } = get();
    if (!isSupabaseConfigured() || !isOnline || !currentGameId) {
      return true; // Allow action in offline mode
    }

    const client = getSupabase();

    try {
      const { data, error } = await client.rpc("submit_game_action", {
        p_game_id: currentGameId,
        p_action_type: actionType,
        p_action_data: actionData,
        p_expected_version: lastSyncedVersion,
      });

      if (error) {
        set({ syncError: error.message });
        return false;
      }

      const result = data as { success: boolean; error?: string; new_version?: number };

      if (!result.success) {
        if (result.error === "State has changed") {
          // State has changed, need to resync
          await get().syncState();
        } else {
          set({ syncError: result.error || "Action failed" });
        }
        return false;
      }

      if (result.new_version) {
        set({ lastSyncedVersion: result.new_version });
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action failed";
      set({ syncError: message });
      return false;
    }
  },

  // Push current game state to Supabase (called after actions)
  syncGameStateToSupabase: async () => {
    const { currentGameId, isOnline, players, monsters, phase, currentPlayerIndex, turn, round, maxRounds, environment, selectedCardId, selectedTargetId, drawnCards, playerSelections, log, animation, lastSyncedVersion } = get();
    if (!isSupabaseConfigured() || !isOnline || !currentGameId) {
      return;
    }

    const client = getSupabase();

    // Set syncing flag to avoid processing our own realtime updates
    set({ isSyncing: true });

    // Only sync recent action messages (last 10, less than 10 seconds old)
    const now = Date.now();
    const recentMessages = animation.actionMessages
      .filter((msg) => now - msg.timestamp < 10000)
      .slice(-10);

    try {
      // Update game_state table (includes players for real-time sync)
      const { error } = await client
        .from("game_state")
        .update({
          phase,
          current_player_index: currentPlayerIndex,
          turn,
          round,
          max_rounds: maxRounds,
          environment,
          monsters,
          players, // Sync player state (HP, buffs, hand, etc.)
          selected_card_id: selectedCardId,
          selected_target_id: selectedTargetId,
          drawn_cards: drawnCards,
          player_selections: playerSelections, // Sync player selections for simultaneous play
          action_messages: recentMessages, // Sync action messages for all players to see
          log,
          version: lastSyncedVersion + 1,
          updated_at: new Date().toISOString(),
          last_action_at: new Date().toISOString(),
        })
        .eq("game_id", currentGameId);

      if (error) {
        console.error("Failed to sync game state:", error);
        set({ isSyncing: false });
        return;
      }

      set({ lastSyncedVersion: lastSyncedVersion + 1, isSyncing: false });
    } catch (error) {
      console.error("Failed to sync game state:", error);
      set({ isSyncing: false });
    }
  },

  // Debounced sync - coalesces rapid syncs to reduce race conditions
  debouncedSyncGameState: () => {
    if (syncDebounceTimeout) {
      clearTimeout(syncDebounceTimeout);
    }
    syncDebounceTimeout = setTimeout(() => {
      syncDebounceTimeout = null;
      get().syncGameStateToSupabase();
    }, SYNC_DEBOUNCE_MS);
  },

  // Subscribe to game state changes
  subscribeToGameState: () => {
    const { currentGameId } = get();
    if (!isSupabaseConfigured() || !currentGameId) return;

    const client = getSupabase();

    // Unsubscribe from existing channel
    if (gameStateChannel) {
      client.removeChannel(gameStateChannel);
    }

    gameStateChannel = client
      .channel(`game_state:${currentGameId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_state",
          filter: `game_id=eq.${currentGameId}`,
        },
        (payload) => {
          const newState = payload.new;
          const { lastSyncedVersion, isSyncing } = get();

          // Skip if we're currently syncing (avoid applying our own updates mid-sync)
          if (isSyncing) return;

          // Always apply updates - handleStateUpdate will merge appropriately
          // The version is still tracked for conflict resolution
          const newVersion = newState.version as number;
          if (newVersion >= lastSyncedVersion) {
            get().handleStateUpdate(newState);
          }
        }
      )
      .subscribe();

    set({ isConnected: true });
  },

  // Unsubscribe from game state changes
  unsubscribeFromGameState: () => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabase();
    if (gameStateChannel) {
      client.removeChannel(gameStateChannel);
      gameStateChannel = null;
    }

    set({ isConnected: false });
  },

  // Handle state updates from realtime subscription
  handleStateUpdate: (newState: Record<string, unknown>) => {
    // Update local state with changes from server
    const updates: Partial<GameStore> = {};
    const currentState = get();

    if (newState.phase !== undefined && newState.phase !== null) {
      updates.phase = newState.phase as GameStore["phase"];
    }
    if (newState.current_player_index !== undefined && newState.current_player_index !== null) {
      updates.currentPlayerIndex = newState.current_player_index as number;
    }
    if (newState.turn !== undefined && newState.turn !== null) {
      updates.turn = newState.turn as number;
    }
    if (newState.round !== undefined && newState.round !== null) {
      updates.round = newState.round as number;
    }
    if (newState.environment !== undefined) {
      updates.environment = newState.environment as GameStore["environment"];
    }
    if (newState.monsters !== undefined && Array.isArray(newState.monsters)) {
      updates.monsters = newState.monsters as GameStore["monsters"];
    }
    // Validate players array - ensure it's an array and each player has required properties
    // Also preserve hands during SELECT phase to avoid race condition overwrites
    if (newState.players !== undefined && Array.isArray(newState.players) && newState.players.length > 0) {
      const incomingPhase = (newState.phase as string) || currentState.phase;
      const validPlayers = (newState.players as GameStore["players"]).map((p, index) => {
        const existingPlayer = currentState.players[index];

        // Preserve hand if: incoming hand is empty, we're in SELECT phase,
        // and existing hand has cards (prevents race condition where stale sync overwrites valid cards)
        const incomingHandEmpty = !Array.isArray(p.hand) || p.hand.length === 0;
        const existingHandHasCards = existingPlayer?.hand?.length > 0;
        const shouldPreserveHand = incomingHandEmpty && incomingPhase === "SELECT" && existingHandHasCards;

        return {
          ...p,
          hand: shouldPreserveHand ? existingPlayer.hand : (Array.isArray(p.hand) ? p.hand : []),
          deck: Array.isArray(p.deck) ? p.deck : [],
          discard: Array.isArray(p.discard) ? p.discard : [],
          buffs: Array.isArray(p.buffs) ? p.buffs : [],
          debuffs: Array.isArray(p.debuffs) ? p.debuffs : [],
        };
      });
      updates.players = validPlayers;
    }
    if (newState.selected_card_id !== undefined) {
      updates.selectedCardId = newState.selected_card_id as string | null;
    }
    if (newState.selected_target_id !== undefined) {
      updates.selectedTargetId = newState.selected_target_id as string | null;
    }
    if (newState.drawn_cards !== undefined && Array.isArray(newState.drawn_cards)) {
      updates.drawnCards = newState.drawn_cards as GameStore["drawnCards"];
    }
    // Merge player selections - combine local and remote state to handle concurrent updates
    if (newState.player_selections !== undefined && Array.isArray(newState.player_selections)) {
      const remoteSelections = newState.player_selections as GameStore["playerSelections"];
      const localSelections = currentState.playerSelections;

      // Merge: use remote data but preserve local ready/selection state if more recent
      const mergedSelections = remoteSelections.map((remoteSel) => {
        const localSel = localSelections.find((l) => l.playerId === remoteSel.playerId);
        if (!localSel) return remoteSel;

        // If local has more data (card selected or ready), prefer local for our own player
        // For other players, always use remote
        if (localSel.playerId === currentState.players[currentState.localPlayerIndex]?.id) {
          // This is our selection - keep our local state if we have more info
          return {
            ...remoteSel,
            cardId: localSel.cardId || remoteSel.cardId,
            targetId: localSel.targetId || remoteSel.targetId,
            isReady: localSel.isReady || remoteSel.isReady,
            enhanceMode: localSel.enhanceMode || remoteSel.enhanceMode,
          };
        }
        // For other players, use remote state
        return remoteSel;
      });
      updates.playerSelections = mergedSelections;
    }
    if (newState.log !== undefined && Array.isArray(newState.log)) {
      updates.log = newState.log as GameStore["log"];
    }
    // Merge action messages - add new ones from server that we don't have locally
    if (newState.action_messages !== undefined && Array.isArray(newState.action_messages)) {
      const remoteMessages = newState.action_messages as GameStore["animation"]["actionMessages"];
      const localMessages = currentState.animation.actionMessages;

      // Find messages from server that aren't in local state (by timestamp + text combo)
      const localKeys = new Set(localMessages.map((m) => `${m.timestamp}-${m.text}`));
      const newMessages = remoteMessages.filter((m) => !localKeys.has(`${m.timestamp}-${m.text}`));

      if (newMessages.length > 0) {
        // Merge and keep only recent messages
        const now = Date.now();
        const mergedMessages = [...localMessages, ...newMessages]
          .filter((m) => now - m.timestamp < 10000)
          .slice(-15);

        updates.animation = {
          ...currentState.animation,
          actionMessages: mergedMessages,
        };
      }
    }
    if (newState.version !== undefined && typeof newState.version === "number") {
      updates.lastSyncedVersion = newState.version;
    }

    set(updates);

    // Check if all players are ready after update (triggers resolve)
    // Only check if we're still in SELECT phase
    const { playerSelections, phase, isHost } = get();
    if (phase === "SELECT" && playerSelections.length > 0 && playerSelections.every((sel) => sel.isReady && sel.cardId)) {
      // Only the host triggers the resolve to avoid duplicate execution
      if (isHost) {
        // Small delay to ensure all concurrent updates are processed
        setTimeout(() => {
          const { playerSelections: latestSelections, phase: latestPhase } = get();
          if (latestPhase === "SELECT" && latestSelections.every((sel) => sel.isReady && sel.cardId)) {
            get().resolveAllActions();
          }
        }, 300);
      }
    }

    // Auto-resync fallback: if transitioning to SELECT phase with empty hands, request full resync
    // This catches edge cases where rapid syncs caused the card draw update to be missed
    const finalPhase = updates.phase || currentState.phase;
    if (finalPhase === "SELECT" && !currentState.isHost) {
      setTimeout(() => {
        const { players, localPlayerIndex, phase: currentPhase } = get();
        const localPlayer = players[localPlayerIndex];
        if (currentPhase === "SELECT" && (!localPlayer?.hand || localPlayer.hand.length === 0)) {
          console.warn("[Sync] Empty hand detected in SELECT phase, requesting full resync");
          get().syncState();
        }
      }, 500);
    }
  },

  // Clear sync error
  clearSyncError: () => {
    set({ syncError: null });
  },
});
