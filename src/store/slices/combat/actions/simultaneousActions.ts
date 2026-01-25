/**
 * Simultaneous play actions for multiplayer: drawAllPlayersCards, resolveAllActions, etc.
 */

import type { SetState, GetState } from "../types";
import type { LogEntry } from "../../../../types";
import { shuffleArray, createLogEntry, rollD20 } from "../../../utils";
import { CARDS_DRAWN_PER_TURN } from "../../../../constants";

export const createSimultaneousActions = (set: SetState, get: GetState) => ({
  // Draw cards for the current player (sequential mode)
  drawCards: () => {
    const { players, currentPlayerIndex, turn, phase } = get();
    const player = players[currentPlayerIndex];

    if (!player.isAlive) {
      const nextAlivePlayer = players.findIndex(
        (p, i) => i > currentPlayerIndex && p.isAlive
      );

      if (nextAlivePlayer !== -1) {
        set({
          currentPlayerIndex: nextAlivePlayer,
        });
        get().drawCards();
      } else {
        set({ phase: "MONSTER_ACTION" });
        get().monsterAct();
      }
      return;
    }

    let deck = [...player.deck];
    let discard = [...player.discard];
    const hand: typeof player.hand = [];

    for (let i = 0; i < CARDS_DRAWN_PER_TURN; i++) {
      if (deck.length === 0 && discard.length > 0) {
        deck = shuffleArray(discard);
        discard = [];
      }
      if (deck.length > 0) {
        hand.push(deck.pop()!);
      }
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      deck,
      discard,
      hand,
    };

    set({
      players: updatedPlayers,
      phase: "SELECT",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          phase,
          `${player.name} draws ${hand.map((c) => c.name).join(", ")}`,
          "info"
        ),
      ],
    });

    // Sync to other players if online
    get().syncAfterAction();
  },

  // Initialize player selections at start of turn
  initializePlayerSelections: () => {
    const { players } = get();
    const selections = players
      .filter((p) => p.isAlive)
      .map((p) => ({
        playerId: p.id,
        cardId: null,
        targetId: null,
        isReady: false,
        enhanceMode: false,
      }));
    set({ playerSelections: selections });
  },

  // Draw cards for ALL players at once (simultaneous mode)
  drawAllPlayersCards: () => {
    const { players, turn, phase } = get();
    const updatedPlayers = [...players];

    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (!player.isAlive) continue;

      let deck = [...player.deck];
      let discard = [...player.discard];
      const hand: typeof player.hand = [];

      for (let j = 0; j < CARDS_DRAWN_PER_TURN; j++) {
        if (deck.length === 0 && discard.length > 0) {
          deck = shuffleArray(discard);
          discard = [];
        }
        if (deck.length > 0) {
          hand.push(deck.pop()!);
        }
      }

      updatedPlayers[i] = {
        ...player,
        deck,
        discard,
        hand,
      };
    }

    // Initialize player selections
    const selections = updatedPlayers
      .filter((p) => p.isAlive)
      .map((p) => ({
        playerId: p.id,
        cardId: null,
        targetId: null,
        isReady: false,
        enhanceMode: false,
      }));

    set({
      players: updatedPlayers,
      playerSelections: selections,
      phase: "SELECT",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          phase,
          `All players draw their cards`,
          "info"
        ),
      ],
    });

    // Sync to other players if online
    get().syncAfterAction();
  },

  // Set card/target selection for a specific player
  setPlayerSelection: (playerId: string, cardId: string | null, targetId: string | null, enhanceMode = false) => {
    const { playerSelections } = get();
    const updatedSelections = playerSelections.map((sel) =>
      sel.playerId === playerId
        ? { ...sel, cardId, targetId, enhanceMode }
        : sel
    );
    set({ playerSelections: updatedSelections });

    // Sync to other players if online
    get().syncAfterAction();
  },

  // Mark a player as ready
  setPlayerReady: (playerId: string, isReady: boolean) => {
    const { playerSelections, isOnline, isHost } = get();
    const updatedSelections = playerSelections.map((sel) =>
      sel.playerId === playerId ? { ...sel, isReady } : sel
    );
    set({ playerSelections: updatedSelections });

    // Sync to other players if online
    get().syncAfterAction();

    // Check if all players are ready - only host triggers resolve
    const allReady = updatedSelections.every((sel) => sel.isReady);
    if (allReady) {
      if (isOnline) {
        // For online mode, only the host triggers resolve
        // This happens via handleStateUpdate when all selections are synced
        if (isHost) {
          // Small delay to ensure all syncs are received
          setTimeout(() => {
            const { playerSelections: latestSelections, phase } = get();
            // Double-check all are still ready and we haven't already started resolving
            if (phase === "SELECT" && latestSelections.every((sel) => sel.isReady)) {
              get().resolveAllActions();
            }
          }, 500);
        }
      } else {
        // For offline mode, trigger immediately
        get().resolveAllActions();
      }
    }
  },

  // Check if all players are ready
  areAllPlayersReady: () => {
    const { playerSelections } = get();
    return playerSelections.length > 0 && playerSelections.every((sel) => sel.isReady);
  },

  // Execute all player actions simultaneously
  resolveAllActions: async () => {
    const { players, playerSelections, turn } = get();

    set({ phase: "AGGRO" });

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Helper to sync state for real-time updates
    const syncNow = () => get().syncAfterAction();

    let updatedPlayers = [...players];
    const logs: LogEntry[] = [];

    // Phase 1: Roll aggro dice for all players
    get().addActionMessage("Rolling aggro dice...", "roll");
    syncNow();
    await delay(500);

    for (const selection of playerSelections) {
      const playerIndex = updatedPlayers.findIndex((p) => p.id === selection.playerId);
      if (playerIndex === -1) continue;

      const player = updatedPlayers[playerIndex];
      if (!player.isAlive || player.isStunned || !selection.cardId) continue;

      const selectedCard = player.hand.find((c) => c.id === selection.cardId);
      if (!selectedCard) continue;

      // Animate dice roll
      set((state) => ({
        animation: { ...state.animation, diceRolling: true, diceRoll: null },
      }));

      for (let i = 0; i < 8; i++) {
        const fakeRoll = Math.floor(Math.random() * 20) + 1;
        set((state) => ({ animation: { ...state.animation, diceRoll: fakeRoll } }));
        await delay(80);
      }

      const diceRoll = rollD20();
      const cardAggro = selectedCard.aggro;
      const newBaseAggro = player.baseAggro + cardAggro;
      const totalAggro = newBaseAggro + diceRoll;

      set((state) => ({
        animation: { ...state.animation, diceRoll: diceRoll, diceRolling: false },
      }));

      updatedPlayers[playerIndex] = {
        ...updatedPlayers[playerIndex],
        baseAggro: newBaseAggro,
        diceAggro: diceRoll,
      };

      set({ players: updatedPlayers });
      get().addActionMessage(`${player.name} rolls ${diceRoll} (+${cardAggro} card) = ${totalAggro} aggro`, "roll", player.id);
      logs.push(createLogEntry(turn, "AGGRO", `${player.name} rolls D20: ${diceRoll} + ${newBaseAggro} base = ${totalAggro} aggro`, "roll"));
      syncNow();
      await delay(600);
    }

    set((state) => ({ animation: { ...state.animation, diceRoll: null, diceRolling: false } }));
    await delay(500);

    // Phase 2: Process each player's action using shared applyCardEffects
    set({ phase: "RESOLVE" });
    syncNow();

    for (const selection of playerSelections) {
      const currentPlayers = get().players;
      const playerIndex = currentPlayers.findIndex((p) => p.id === selection.playerId);
      if (playerIndex === -1) continue;

      const player = currentPlayers[playerIndex];
      if (!player.isAlive) continue;

      if (player.isStunned) {
        get().addActionMessage(`${player.name} is stunned!`, "debuff", player.id);
        logs.push(createLogEntry(turn, "RESOLVE", `${player.name} is stunned and cannot act!`, "debuff"));
        continue;
      }

      const selectedCard = player.hand.find((c) => c.id === selection.cardId);
      if (!selectedCard) continue;

      const isEnhanced = selection.enhanceMode && player.resource >= player.maxResource;
      const enhanceText = isEnhanced ? " (ENHANCED!)" : "";

      get().addActionMessage(`${player.name} plays ${selectedCard.name}!${enhanceText}`, "action", player.id);
      logs.push(createLogEntry(turn, "RESOLVE", `${player.name} plays ${selectedCard.name}!${enhanceText}`, "action"));
      syncNow();
      await delay(1200);

      // Use shared effect application function
      const result = get().applyCardEffects(playerIndex, selection.cardId!, selection.targetId, isEnhanced);

      // Show damage numbers
      for (const dn of result.damageNumbers) {
        get().addDamageNumber(dn.targetId, dn.value, dn.type);
      }

      // Award XP
      for (const [championId, xp] of result.xpEarned) {
        get().addXP(championId, xp);
      }

      // Update store with results (so next player sees updated state)
      set({ players: result.players, monsters: result.monsters });
      logs.push(...result.logs);
      syncNow();
      await delay(800);
    }

    // Final state update
    set({
      playerSelections: [],
      log: [...get().log, ...logs],
    });
    syncNow();

    // Check for victory/defeat
    const finalMonsters = get().monsters;
    const finalPlayers = get().players;

    if (finalMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    if (finalPlayers.every((p) => !p.isAlive)) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = finalPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "defeat" });
      return;
    }

    set({ phase: "MONSTER_ACTION" });
    get().monsterAct();
  },
});
