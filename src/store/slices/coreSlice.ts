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
    const { phase, players, currentPlayerIndex } = get();

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
          get().syncAfterAction();
          get().drawCards();
        } else {
          set({ phase: "MONSTER_ACTION" });
          get().syncAfterAction();
          get().monsterAct();
        }
        break;
      }
      case "MONSTER_ACTION":
        set({ phase: "STATUS_RESOLUTION" });
        get().syncAfterAction();
        get().resolveDebuffs();
        break;
      case "STATUS_RESOLUTION":
        set({ phase: "END_TURN" });
        get().syncAfterAction();
        get().endTurn();
        break;
      case "END_TURN":
        break;
    }
  },
});
