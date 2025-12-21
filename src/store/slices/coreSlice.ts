import type { SliceCreator, CoreActions } from "../types";
import { initialState } from "../initialState";
import { createLogEntry } from "../utils";

export const createCoreSlice: SliceCreator<CoreActions> = (set, get) => ({
  setScreen: (screen) => set({ currentScreen: screen }),

  addLog: (message, type) => {
    const { turn, phase, log } = get();
    set({ log: [...log, createLogEntry(turn, phase, message, type)] });
  },

  resetGame: () => {
    set(initialState);
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
      case "PLAYER_ACTION": {
        const nextAlivePlayer = players.findIndex(
          (p, i) => i > currentPlayerIndex && p.isAlive
        );

        if (nextAlivePlayer !== -1) {
          set({
            currentPlayerIndex: nextAlivePlayer,
            phase: "DRAW",
          });
          get().drawCards();
        } else {
          set({ phase: "MONSTER_ACTION" });
          get().monsterAct();
        }
        break;
      }
      case "MONSTER_ACTION":
        set({ phase: "DEBUFF_RESOLUTION" });
        get().resolveDebuffs();
        break;
      case "DEBUFF_RESOLUTION":
        set({ phase: "END_TURN" });
        get().endTurn();
        break;
      case "END_TURN":
        break;
    }
  },
});
