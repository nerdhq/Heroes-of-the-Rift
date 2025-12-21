import type { SliceCreator, SettingsActions } from "../types";
import { initialState } from "../initialState";

export const createSettingsSlice: SliceCreator<SettingsActions> = (set, get) => ({
  setGameSpeed: (speed) => {
    set({ gameSpeed: speed });
  },

  toggleSkipAnimations: () => {
    set((state) => ({ skipAnimations: !state.skipAnimations }));
  },

  getDelay: (baseMs) => {
    const { gameSpeed, skipAnimations } = get();
    if (skipAnimations) return 0;
    switch (gameSpeed) {
      case "fast":
        return Math.floor(baseMs * 0.4);
      case "instant":
        return 50;
      default:
        return baseMs;
    }
  },

  playAgainSameParty: () => {
    const { savedParty } = get();
    if (!savedParty) {
      set(initialState);
      return;
    }

    set({
      ...initialState,
      savedParty,
      selectedClasses: savedParty.classes,
      heroNames: savedParty.names,
      currentScreen: "deckBuilder",
    });

    get().confirmClassSelection();
  },

  playAgainNewParty: () => {
    const { gameSpeed, skipAnimations } = get();
    set({
      ...initialState,
      gameSpeed,
      skipAnimations,
      savedParty: null,
    });
  },
});
