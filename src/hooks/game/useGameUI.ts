/**
 * Hook for game UI-related state
 * Manages phase, turn, round, speed settings, and animation state
 */

import { useGameStore } from "../../store/gameStore";
import type { GamePhase, Environment, AnimationState, GameSpeed } from "../../types";

export interface GameUIState {
  phase: GamePhase;
  turn: number;
  round: number;
  maxRounds: number;
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  enhanceMode: boolean;
  animation: AnimationState;
  environment: Environment | null;
}

export interface GameUIActions {
  setGameSpeed: (speed: GameSpeed) => void;
  toggleSkipAnimations: () => void;
  setEnhanceMode: (mode: boolean) => void;
  setAnimation: (updates: Partial<AnimationState>) => void;
}

/**
 * Hook for accessing game UI state and actions
 */
export function useGameUI(): GameUIState & GameUIActions {
  // State selectors
  const phase = useGameStore((state) => state.phase);
  const turn = useGameStore((state) => state.turn);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const skipAnimations = useGameStore((state) => state.skipAnimations);
  const enhanceMode = useGameStore((state) => state.enhanceMode);
  const animation = useGameStore((state) => state.animation);
  const environment = useGameStore((state) => state.environment);

  // Action selectors
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const toggleSkipAnimations = useGameStore((state) => state.toggleSkipAnimations);
  const setEnhanceMode = useGameStore((state) => state.setEnhanceMode);
  const setAnimation = useGameStore((state) => state.setAnimation);

  return {
    // State
    phase,
    turn,
    round,
    maxRounds,
    gameSpeed,
    skipAnimations,
    enhanceMode,
    animation,
    environment,
    // Actions
    setGameSpeed,
    toggleSkipAnimations,
    setEnhanceMode,
    setAnimation,
  };
}
