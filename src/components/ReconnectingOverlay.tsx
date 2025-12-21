import { useGameStore } from "../store/gameStore";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

export function ReconnectingOverlay() {
  const isOnline = useGameStore((state) => state.isOnline);
  const isConnected = useGameStore((state) => state.isConnected);
  const syncError = useGameStore((state) => state.syncError);
  const syncState = useGameStore((state) => state.syncState);
  const clearSyncError = useGameStore((state) => state.clearSyncError);

  // Only show when online but disconnected
  if (!isOnline || isConnected) {
    return null;
  }

  const handleRetry = async () => {
    clearSyncError();
    await syncState();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-xl p-8 max-w-sm mx-4 text-center border border-stone-600">
        {syncError ? (
          <>
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">
              Connection Lost
            </h2>
            <p className="text-stone-400 mb-6">{syncError}</p>
            <button
              onClick={handleRetry}
              className="bg-amber-600 hover:bg-amber-500 text-amber-100 font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-amber-100 mb-2">
              Reconnecting...
            </h2>
            <p className="text-stone-400">
              Please wait while we reconnect to the game server.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
