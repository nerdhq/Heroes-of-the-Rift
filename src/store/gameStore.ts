import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameStore } from "./types";
import { initialState } from "./initialState";
import {
  createCoreSlice,
  createPlayersSlice,
  createCombatSlice,
  createRewardsSlice,
  createAnimationSlice,
  createSettingsSlice,
  createUserDataSlice,
  createAuthSlice,
  initialAuthState,
  createLobbySlice,
  initialLobbyState,
  createMultiplayerSlice,
  initialMultiplayerState,
  createProgressionSlice,
  initialProgressionState,
} from "./slices";

export const useGameStore = create<GameStore>()(
  persist(
    (...a) => ({
      ...initialState,
      ...initialAuthState,
      ...initialLobbyState,
      ...initialMultiplayerState,
      ...initialProgressionState,
      ...createCoreSlice(...a),
      ...createPlayersSlice(...a),
      ...createCombatSlice(...a),
      ...createRewardsSlice(...a),
      ...createAnimationSlice(...a),
      ...createSettingsSlice(...a),
      ...createUserDataSlice(...a),
      ...createAuthSlice(...a),
      ...createLobbySlice(...a),
      ...createMultiplayerSlice(...a),
      ...createProgressionSlice(...a),
    }),
    {
      name: "dungeon-crawler-storage",
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GameStore> | undefined;
        return {
          ...currentState,
          ...persisted,
          // Ensure userData always has valid defaults (migration for old saves)
          userData: {
            gold: persisted?.userData?.gold ?? 0,
            ownedCards: persisted?.userData?.ownedCards ?? [],
          },
        };
      },
      partialize: (state) => ({
        // Persist game state
        currentScreen: state.currentScreen,
        phase: state.phase,
        players: state.players,
        monsters: state.monsters,
        currentPlayerIndex: state.currentPlayerIndex,
        turn: state.turn,
        level: state.level,
        round: state.round,
        maxRounds: state.maxRounds,
        environment: state.environment,
        selectedCardId: state.selectedCardId,
        selectedTargetId: state.selectedTargetId,
        drawnCards: state.drawnCards,
        log: state.log,
        selectedClasses: state.selectedClasses,
        heroNames: state.heroNames,
        deckBuildingPlayerIndex: state.deckBuildingPlayerIndex,
        availableCards: state.availableCards,
        selectedDeckCards: state.selectedDeckCards,
        rewardPlayerIndex: state.rewardPlayerIndex,
        rewardCards: state.rewardCards,
        selectedRewardCardId: state.selectedRewardCardId,
        shopPlayerIndex: state.shopPlayerIndex,
        shopCards: state.shopCards,
        selectedShopCardId: state.selectedShopCardId,
        // Settings
        gameSpeed: state.gameSpeed,
        skipAnimations: state.skipAnimations,
        savedParty: state.savedParty,
        enhanceMode: state.enhanceMode,
        // User data (persisted separately but also here for backup)
        userData: state.userData,
        // Don't persist animation state - it should reset
      }),
    }
  )
);
