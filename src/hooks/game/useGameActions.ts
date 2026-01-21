/**
 * Hook for game actions
 * Provides access to combat and game flow actions
 */

import { useGameStore } from "../../store/gameStore";

export interface GameActionsType {
  // Card actions
  selectCard: (cardId: string) => void;
  selectTarget: (targetId: string) => void;
  confirmTarget: () => void;
  startDiceRoll: () => void;

  // Special abilities
  useSpecialAbility: () => void;
  setEnhanceMode: (mode: boolean) => void;

  // Game flow
  resetGame: () => void;
  startGame: () => void;
  nextRound: () => void;

  // Animation
  setAnimation: (updates: Parameters<ReturnType<typeof useGameStore.getState>["setAnimation"]>[0]) => void;
}

/**
 * Hook for accessing game actions
 */
export function useGameActions(): GameActionsType {
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);
  const confirmTarget = useGameStore((state) => state.confirmTarget);
  const startDiceRoll = useGameStore((state) => state.startDiceRoll);
  const useSpecialAbility = useGameStore((state) => state.useSpecialAbility);
  const setEnhanceMode = useGameStore((state) => state.setEnhanceMode);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);
  const nextRound = useGameStore((state) => state.nextRound);
  const setAnimation = useGameStore((state) => state.setAnimation);

  return {
    selectCard,
    selectTarget,
    confirmTarget,
    startDiceRoll,
    useSpecialAbility,
    setEnhanceMode,
    resetGame,
    startGame,
    nextRound,
    setAnimation,
  };
}
