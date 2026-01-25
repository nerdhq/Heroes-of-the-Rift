/**
 * Hook for multiplayer-related state
 * Manages online mode, player selections, and sync actions
 */

import { useGameStore } from "../../store/gameStore";
import type { Player, PlayerSelection } from "../../types";

export interface MultiplayerStateValues {
  isOnline: boolean;
  localPlayerIndex: number;
  playerSelections: PlayerSelection[];
  isConnected: boolean;
  isSyncing: boolean;
  syncError: string | null;
}

export interface MultiplayerActions {
  subscribeToGameState: () => void;
  unsubscribeFromGameState: () => void;
  setPlayerSelection: (playerId: string, cardId: string | null, targetId: string | null, enhanceMode?: boolean) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  syncAfterAction: () => void;
  clearSyncError: () => void;
}

export interface MultiplayerComputed {
  localPlayer: Player | undefined;
  isLocalPlayerTurn: boolean;
  localPlayerSelection: PlayerSelection | null;
}

/**
 * Hook for accessing multiplayer state and actions
 */
export function useMultiplayerState(): MultiplayerStateValues & MultiplayerActions & MultiplayerComputed {
  // State selectors
  const isOnline = useGameStore((state) => state.isOnline);
  const localPlayerIndex = useGameStore((state) => state.localPlayerIndex);
  const playerSelections = useGameStore((state) => state.playerSelections);
  const isConnected = useGameStore((state) => state.isConnected);
  const isSyncing = useGameStore((state) => state.isSyncing);
  const syncError = useGameStore((state) => state.syncError);
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);

  // Action selectors
  const subscribeToGameState = useGameStore((state) => state.subscribeToGameState);
  const unsubscribeFromGameState = useGameStore((state) => state.unsubscribeFromGameState);
  const setPlayerSelection = useGameStore((state) => state.setPlayerSelection);
  const setPlayerReady = useGameStore((state) => state.setPlayerReady);
  const syncAfterAction = useGameStore((state) => state.syncAfterAction);
  const clearSyncError = useGameStore((state) => state.clearSyncError);

  // Computed values
  const currentPlayer = players[currentPlayerIndex];
  const localPlayer = isOnline ? players[localPlayerIndex] : currentPlayer;
  const isLocalPlayerTurn = !isOnline || localPlayerIndex === currentPlayerIndex;
  const localPlayerSelection = isOnline && localPlayer
    ? playerSelections.find((sel) => sel.playerId === localPlayer.id) ?? null
    : null;

  return {
    // State
    isOnline,
    localPlayerIndex,
    playerSelections,
    isConnected,
    isSyncing,
    syncError,
    // Actions
    subscribeToGameState,
    unsubscribeFromGameState,
    setPlayerSelection,
    setPlayerReady,
    syncAfterAction,
    clearSyncError,
    // Computed
    localPlayer,
    isLocalPlayerTurn,
    localPlayerSelection,
  };
}
