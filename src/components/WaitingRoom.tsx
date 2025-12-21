import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  Users,
  Copy,
  Check,
  Crown,
  Loader2,
  LogOut,
  Play,
  Wifi,
  WifiOff,
  UserX,
} from "lucide-react";

export function WaitingRoom() {
  const [copied, setCopied] = useState(false);

  const profile = useGameStore((state) => state.profile);
  const gameCode = useGameStore((state) => state.gameCode);
  const isHost = useGameStore((state) => state.isHost);
  const lobbyPlayers = useGameStore((state) => state.lobbyPlayers);
  const lobbyError = useGameStore((state) => state.lobbyError);
  const setScreen = useGameStore((state) => state.setScreen);
  const leaveGame = useGameStore((state) => state.leaveGame);
  const startOnlineGame = useGameStore((state) => state.startOnlineGame);
  const kickPlayer = useGameStore((state) => state.kickPlayer);
  const subscribeToGame = useGameStore((state) => state.subscribeToGame);
  const unsubscribeFromGame = useGameStore((state) => state.unsubscribeFromGame);
  const currentGameId = useGameStore((state) => state.currentGameId);

  // Subscribe to game updates
  useEffect(() => {
    if (currentGameId) {
      subscribeToGame?.(currentGameId);
    }
    return () => {
      unsubscribeFromGame?.();
    };
  }, [currentGameId, subscribeToGame, unsubscribeFromGame]);

  const handleCopyCode = async () => {
    if (gameCode) {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveGame = async () => {
    await leaveGame?.();
    setScreen("lobby");
  };

  const handleStartGame = async () => {
    if (startOnlineGame) {
      const success = await startOnlineGame();
      if (success) {
        setScreen("classSelect");
      }
    }
  };

  const handleKickPlayer = async (playerId: string) => {
    await kickPlayer?.(playerId);
  };

  const canStart = lobbyPlayers.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-100 mb-2">Waiting Room</h1>
        <p className="text-stone-400">
          {isHost ? "Share the code with your friends!" : "Waiting for host to start..."}
        </p>
      </div>

      {/* Game Code */}
      <div className="mb-8">
        <p className="text-stone-400 text-sm text-center mb-2">Game Code</p>
        <button
          onClick={handleCopyCode}
          className="bg-stone-800 border-2 border-amber-600 rounded-xl px-8 py-4 flex items-center gap-4 hover:bg-stone-700 transition-all group"
        >
          <span className="text-4xl font-mono font-bold text-amber-400 tracking-[0.3em]">
            {gameCode || "------"}
          </span>
          {copied ? (
            <Check className="w-6 h-6 text-green-500" />
          ) : (
            <Copy className="w-6 h-6 text-stone-400 group-hover:text-amber-400 transition-colors" />
          )}
        </button>
        {copied && (
          <p className="text-green-500 text-sm text-center mt-2">
            Copied to clipboard!
          </p>
        )}
      </div>

      {/* Players List */}
      <div className="w-full max-w-md bg-stone-800/50 rounded-xl border border-stone-700 overflow-hidden mb-6">
        <div className="px-4 py-3 bg-stone-800 border-b border-stone-700 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          <span className="text-amber-100 font-medium">
            Players ({lobbyPlayers.length})
          </span>
        </div>
        <div className="divide-y divide-stone-700">
          {lobbyPlayers.length === 0 ? (
            <div className="px-4 py-8 text-center text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-50" />
              <p>Waiting for players...</p>
            </div>
          ) : (
            lobbyPlayers.map((player) => (
              <div
                key={player.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Connection Status */}
                  {player.is_connected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}

                  {/* Player Name */}
                  <span className="text-amber-100 font-medium">
                    {player.hero_name || `Player ${player.player_index + 1}`}
                  </span>

                  {/* Host Badge */}
                  {player.player_index === 0 && (
                    <span className="flex items-center gap-1 text-xs bg-amber-600/30 text-amber-400 px-2 py-0.5 rounded">
                      <Crown className="w-3 h-3" />
                      Host
                    </span>
                  )}

                  {/* You Badge */}
                  {player.user_id === profile?.id && (
                    <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>

                {/* Kick Button (host only, can't kick self) */}
                {isHost && player.user_id !== profile?.id && (
                  <button
                    onClick={() => handleKickPlayer(player.id)}
                    className="text-stone-500 hover:text-red-500 transition-colors p-1"
                    title="Kick player"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Message */}
      {lobbyError && (
        <div className="w-full max-w-md mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-300 text-sm text-center">{lobbyError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-md space-y-3">
        {isHost && (
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 disabled:from-stone-600 disabled:to-stone-600 text-green-100 disabled:text-stone-400 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Start Game
          </button>
        )}

        <button
          onClick={handleLeaveGame}
          className="w-full bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Leave Game
        </button>
      </div>

      {/* Tips */}
      <div className="mt-8 text-center text-stone-500 text-sm max-w-md">
        <p>
          {isHost
            ? "Once all players have joined, click Start Game to begin class selection."
            : "The host will start the game when everyone is ready."}
        </p>
      </div>
    </div>
  );
}
