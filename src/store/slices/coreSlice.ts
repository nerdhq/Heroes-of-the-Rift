import type { SliceCreator, CoreActions } from "../types";
import { initialState } from "../initialState";
import { createLogEntry } from "../utils";

export const createCoreSlice: SliceCreator<CoreActions> = (set, get) => ({
  setScreen: (screen) => set({ currentScreen: screen }),

  setReturnScreen: (screen) => set({ returnScreen: screen }),

  addLog: (message, type) => {
    const { turn, phase, log } = get();
    set({ log: [...log, createLogEntry(turn, phase, message, type)] });
  },

  resetGame: () => {
    const { userData } = get();
    set({ ...initialState, userData });
  },

  nextPhase: () => {
    const { phase, players, currentPlayerIndex, isOnline } = get();

    // Helper to sync if online
    const syncIfOnline = () => {
      if (isOnline) {
        get().syncGameStateToSupabase();
      }
    };

    switch (phase) {
      case "DRAW":
        break;
      case "SELECT":
        break;
      case "TARGET_SELECT":
        break;
      case "AGGRO":
        break;
      case "RESOLVE":
        // Simultaneous play - resolve is handled by resolveAllActions
        // which directly transitions to MONSTER_ACTION
        break;
      case "PLAYER_ACTION": {
        const nextAlivePlayer = players.findIndex(
          (p, i) => i > currentPlayerIndex && p.isAlive
        );

        if (nextAlivePlayer !== -1) {
          set({
            currentPlayerIndex: nextAlivePlayer,
            phase: "DRAW",
          });
          syncIfOnline();
          get().drawCards();
        } else {
          set({ phase: "MONSTER_ACTION" });
          syncIfOnline();
          get().monsterAct();
        }
        break;
      }
      case "MONSTER_ACTION":
        set({ phase: "DEBUFF_RESOLUTION" });
        syncIfOnline();
        get().resolveDebuffs();
        break;
      case "DEBUFF_RESOLUTION":
        set({ phase: "END_TURN" });
        syncIfOnline();
        get().endTurn();
        break;
      case "END_TURN":
        break;
    }
  },
});
