/**
 * Hook for game entity-related state
 * Manages players, monsters, and selection state
 */

import { useGameStore } from "../../store/gameStore";
import type { Player, Monster } from "../../types";

export interface GameEntitiesState {
  players: Player[];
  monsters: Monster[];
  currentPlayerIndex: number;
  selectedCardId: string | null;
  selectedTargetId: string | null;
  currentPlayer: Player | undefined;
}

export interface GameEntitiesActions {
  selectCard: (cardId: string) => void;
  selectTarget: (targetId: string) => void;
}

export interface GameEntitiesComputed {
  needsTarget: boolean;
  targetType: "monster" | "ally" | "self" | null;
  canEnhanceCard: boolean;
  canUseSpecialAbility: boolean;
  highestAggroPlayerId: string | null;
}

/**
 * Hook for accessing game entity state, actions, and computed values
 */
export function useGameEntities(): GameEntitiesState & GameEntitiesActions & GameEntitiesComputed {
  // State selectors
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);

  // Action selectors
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);

  // Computed selectors
  const needsTargetSelection = useGameStore((state) => state.needsTargetSelection);
  const getTargetType = useGameStore((state) => state.getTargetType);
  const canEnhanceCardFn = useGameStore((state) => state.canEnhanceCard);
  const canUseSpecialAbilityFn = useGameStore((state) => state.canUseSpecialAbility);

  // Computed values
  const currentPlayer = players[currentPlayerIndex];
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();
  const canEnhanceCard = canEnhanceCardFn();
  const canUseSpecialAbility = canUseSpecialAbilityFn();

  // Calculate highest aggro player
  const getHighestAggroPlayer = (): string | null => {
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) return null;

    const tauntPlayer = alivePlayers.find((p) => p.hasTaunt);
    if (tauntPlayer) return tauntPlayer.id;

    const visiblePlayers = alivePlayers.filter((p) => !p.isStealth);
    if (visiblePlayers.length === 0) return alivePlayers[0]?.id;

    return visiblePlayers.reduce((highest, p) => {
      const pAggro = p.baseAggro + p.diceAggro;
      const hAggro = highest.baseAggro + highest.diceAggro;
      return pAggro > hAggro ? p : highest;
    }, visiblePlayers[0])?.id;
  };

  return {
    // State
    players,
    monsters,
    currentPlayerIndex,
    selectedCardId,
    selectedTargetId,
    currentPlayer,
    // Actions
    selectCard,
    selectTarget,
    // Computed
    needsTarget,
    targetType,
    canEnhanceCard,
    canUseSpecialAbility,
    highestAggroPlayerId: getHighestAggroPlayer(),
  };
}
