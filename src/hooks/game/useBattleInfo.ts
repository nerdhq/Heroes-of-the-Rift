/**
 * Hook for battle information state
 * Manages battle log and related state
 */

import { useGameStore } from "../../store/gameStore";
import type { LogEntry } from "../../types";

export interface BattleInfoState {
  log: LogEntry[];
  maxRounds: number;
}

/**
 * Hook for accessing battle information
 */
export function useBattleInfo(): BattleInfoState {
  const log = useGameStore((state) => state.log);
  const maxRounds = useGameStore((state) => state.maxRounds);

  return {
    log,
    maxRounds,
  };
}
