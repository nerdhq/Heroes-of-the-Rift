/**
 * Game hooks barrel export
 * Provides centralized access to all game-related hooks
 */

export { useGameUI, type GameUIState, type GameUIActions } from "./useGameUI";
export {
  useGameEntities,
  type GameEntitiesState,
  type GameEntitiesActions,
  type GameEntitiesComputed,
} from "./useGameEntities";
export { useBattleInfo, type BattleInfoState } from "./useBattleInfo";
export {
  useMultiplayerState,
  type MultiplayerStateValues,
  type MultiplayerActions,
  type MultiplayerComputed,
} from "./useMultiplayerState";
export { useGameActions, type GameActionsType } from "./useGameActions";
