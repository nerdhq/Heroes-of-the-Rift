import type { StateCreator } from "zustand";
import type { GameStore } from "../types";
import { isSupabaseConfigured, getSupabase } from "../../lib/supabase";
import type { GamePlayer } from "../../lib/database.types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ClassType, Card } from "../../types";
import { getAllCards } from "../../data/cards";
import { createPlayer, generateId, seededShuffleArray } from "../utils";

// ============================================
// LOBBY STATE & ACTIONS
// ============================================

export interface LobbyState {
  currentGameId: string | null;
  gameCode: string | null;
  isHost: boolean;
  lobbyPlayers: GamePlayer[];
  lobbyError: string | null;
  isInLobby: boolean;
}

export interface LobbyActions {
  createGame: (maxPlayers?: number) => Promise<boolean>;
  joinGame: (code: string) => Promise<boolean>;
  leaveGame: () => Promise<void>;
  startOnlineGame: () => Promise<boolean>;
  kickPlayer: (playerId: string) => Promise<void>;
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: () => void;
  clearLobbyError: () => void;
  setLobbyPlayers: (players: GamePlayer[]) => void;
  initializeOnlineGame: () => Promise<void>;
}

// Initial lobby state
export const initialLobbyState: LobbyState = {
  currentGameId: null,
  gameCode: null,
  isHost: false,
  lobbyPlayers: [],
  lobbyError: null,
  isInLobby: false,
};

// Store the realtime channel reference
let gameChannel: RealtimeChannel | null = null;

// ============================================
// CREATE LOBBY SLICE
// ============================================

export const createLobbySlice: StateCreator<
  GameStore,
  [],
  [],
  LobbyState & LobbyActions
> = (set, get) => ({
  ...initialLobbyState,

  // Create a new game
  createGame: async (maxPlayers = 4) => {
    if (!isSupabaseConfigured()) {
      set({ lobbyError: "Online play not available" });
      return false;
    }

    const client = getSupabase();
    const { user, profile } = get();

    if (!user) {
      set({ lobbyError: "Not authenticated" });
      return false;
    }

    try {
      // Call the create_game RPC
      const { data: gameId, error } = await client.rpc("create_game", {
        p_max_players: maxPlayers,
      });

      if (error) {
        set({ lobbyError: error.message });
        return false;
      }

      // Set the host's hero_name from their profile
      await client
        .from("game_players")
        .update({ hero_name: profile?.username || null })
        .eq("game_id", gameId)
        .eq("user_id", user.id);

      // Fetch the game to get the code
      const { data: game, error: gameError } = await client
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError || !game) {
        set({ lobbyError: "Failed to fetch game details" });
        return false;
      }

      // Fetch players
      const { data: players } = await client
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .order("player_index");

      // Clear cached local game state and set online mode
      set({
        currentGameId: gameId,
        gameCode: game.code,
        isHost: true,
        lobbyPlayers: players || [],
        isInLobby: true,
        lobbyError: null,
        isOnline: true,
        // Clear cached local state
        selectedClasses: [],
        heroNames: [],
        players: [],
        selectedDeckCards: [],
        availableCards: [],
        deckBuildingPlayerIndex: 0,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ lobbyError: message });
      return false;
    }
  },

  // Join an existing game
  joinGame: async (code: string) => {
    if (!isSupabaseConfigured()) {
      set({ lobbyError: "Online play not available" });
      return false;
    }

    const client = getSupabase();
    const { user, profile } = get();

    if (!user) {
      set({ lobbyError: "Not authenticated" });
      return false;
    }

    try {
      // Call the join_game RPC
      const { data: gameId, error } = await client.rpc("join_game", {
        p_code: code.toUpperCase(),
      });

      if (error) {
        set({ lobbyError: error.message });
        return false;
      }

      // Update player's hero name
      await client
        .from("game_players")
        .update({ hero_name: profile?.username || null })
        .eq("game_id", gameId)
        .eq("user_id", user.id);

      // Fetch the game
      const { data: game, error: gameError } = await client
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError || !game) {
        set({ lobbyError: "Failed to fetch game details" });
        return false;
      }

      // Fetch players
      const { data: players } = await client
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .order("player_index");

      // Clear cached local game state and set online mode
      set({
        currentGameId: gameId,
        gameCode: game.code,
        isHost: game.host_id === user.id,
        lobbyPlayers: players || [],
        isInLobby: true,
        lobbyError: null,
        isOnline: true,
        // Clear cached local state
        selectedClasses: [],
        heroNames: [],
        players: [],
        selectedDeckCards: [],
        availableCards: [],
        deckBuildingPlayerIndex: 0,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ lobbyError: message });
      return false;
    }
  },

  // Leave the current game
  leaveGame: async () => {
    const { currentGameId, user } = get();
    if (!isSupabaseConfigured() || !currentGameId || !user) {
      set({ ...initialLobbyState });
      return;
    }

    const client = getSupabase();

    try {
      // Remove player from game
      await client
        .from("game_players")
        .delete()
        .eq("game_id", currentGameId)
        .eq("user_id", user.id);

      // Unsubscribe from realtime
      get().unsubscribeFromGame();

      set({ ...initialLobbyState });
    } catch (error) {
      console.error("Error leaving game:", error);
      set({ ...initialLobbyState });
    }
  },

  // Start the game (host only)
  startOnlineGame: async () => {
    const { currentGameId, isHost, user } = get();
    if (!isSupabaseConfigured() || !currentGameId || !isHost || !user) {
      return false;
    }

    const client = getSupabase();

    try {
      // Clear any cached local game state before starting online game
      set({
        selectedClasses: [],
        heroNames: [],
        players: [],
        selectedDeckCards: [],
        availableCards: [],
        deckBuildingPlayerIndex: 0,
        isOnline: true,
      });

      // Update game status
      const { error } = await client
        .from("games")
        .update({
          status: "class_select",
          started_at: new Date().toISOString(),
        })
        .eq("id", currentGameId)
        .eq("host_id", user.id);

      if (error) {
        set({ lobbyError: error.message });
        return false;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ lobbyError: message });
      return false;
    }
  },

  // Kick a player (host only)
  kickPlayer: async (playerId: string) => {
    const { currentGameId, isHost, user } = get();
    if (!isSupabaseConfigured() || !currentGameId || !isHost || !user) {
      return;
    }

    const client = getSupabase();

    try {
      await client
        .from("game_players")
        .delete()
        .eq("id", playerId)
        .eq("game_id", currentGameId);
    } catch (error) {
      console.error("Error kicking player:", error);
    }
  },

  // Subscribe to game updates
  subscribeToGame: (gameId: string) => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabase();

    // Unsubscribe from any existing channel
    if (gameChannel) {
      client.removeChannel(gameChannel);
    }

    // Create new subscription
    gameChannel = client
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          // Refetch players on any change
          const { data: players } = await client
            .from("game_players")
            .select("*")
            .eq("game_id", gameId)
            .order("player_index");

          set({ lobbyPlayers: players || [] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const game = payload.new as { status: string };
          // If game status changes to class_select, transition all players
          if (game.status === "class_select") {
            // Clear cached local state for non-host players too
            set({
              selectedClasses: [],
              heroNames: [],
              players: [],
              selectedDeckCards: [],
              availableCards: [],
              deckBuildingPlayerIndex: 0,
              isOnline: true,
            });
            const { setScreen } = get();
            setScreen("classSelect");
          }
        }
      )
      .subscribe();
  },

  // Unsubscribe from game updates
  unsubscribeFromGame: () => {
    if (!isSupabaseConfigured() || !gameChannel) return;

    const client = getSupabase();
    client.removeChannel(gameChannel);
    gameChannel = null;
  },

  // Clear lobby error
  clearLobbyError: () => {
    set({ lobbyError: null });
  },

  // Set lobby players (for realtime updates)
  setLobbyPlayers: (players: GamePlayer[]) => {
    set({ lobbyPlayers: players });
  },

  // Initialize the online game with all player data from Supabase
  initializeOnlineGame: async () => {
    const { currentGameId, user } = get();
    if (!isSupabaseConfigured() || !currentGameId || !user) return;

    const client = getSupabase();
    const allCards = getAllCards();

    try {
      // Fetch player data
      const { data: players } = await client
        .from("game_players")
        .select("*")
        .eq("game_id", currentGameId)
        .order("player_index");

      if (!players || players.length === 0) {
        console.error("No players found for game");
        return;
      }

      // Find the local player's index (which player this client controls)
      const localPlayerIndex = players.findIndex((p) => p.user_id === user.id);
      if (localPlayerIndex === -1) {
        console.error("Current user not found in game players");
        return;
      }

      // Fetch game state (monsters, environment) created by the host
      const { data: gameState } = await client
        .from("game_state")
        .select("*")
        .eq("game_id", currentGameId)
        .single();

      if (!gameState) {
        console.error("No game state found for game");
        return;
      }

      // Convert each player's deck card IDs to actual Card objects
      const gamePlayers = players.map((gp, index) => {
        const classType = gp.class_type as ClassType;
        const heroName = gp.hero_name || `Hero ${index + 1}`;

        // Convert deck card IDs to Card objects
        const deckCardIds = (gp.deck as string[]) || [];
        const deck: Card[] = deckCardIds
          .map((cardId) => {
            const baseCard = allCards.find((c: Card) => c.id === cardId);
            if (!baseCard) return null;
            return {
              ...baseCard,
              id: `${cardId}-${index}-${generateId()}`,
            };
          })
          .filter((card): card is Card => card !== null);

        return createPlayer(`player-${index}`, heroName, classType, deck);
      });

      // Shuffle each player's deck using seeded random (same seed = same shuffle on all clients)
      const shuffledPlayers = gamePlayers.map((player, index) => ({
        ...player,
        deck: seededShuffleArray(player.deck, `${currentGameId}-player-${index}`),
      }));

      // Load the game state from Supabase (monsters, environment set by host)
      set({
        players: shuffledPlayers,
        selectedClasses: players.map((p) => p.class_type as ClassType),
        heroNames: players.map((p) => p.hero_name || `Hero`),
        monsters: gameState.monsters || [],
        environment: gameState.environment || null,
        round: gameState.round || 1,
        turn: gameState.turn || 1,
        maxRounds: gameState.max_rounds || 6,
        currentPlayerIndex: gameState.current_player_index || 0,
        phase: gameState.phase || "DRAW",
        selectedCardId: gameState.selected_card_id || null,
        selectedTargetId: gameState.selected_target_id || null,
        drawnCards: gameState.drawn_cards || [],
        log: gameState.log || [],
        isConnected: true,
        lastSyncedVersion: gameState.version || 1,
        localPlayerIndex: localPlayerIndex,
      });

      // Draw cards for all players simultaneously (online mode)
      get().drawAllPlayersCards();
    } catch (error) {
      console.error("Failed to initialize online game:", error);
    }
  },
});
