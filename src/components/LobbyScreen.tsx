import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import {
  Users,
  Plus,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function LobbyScreen() {
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);

  const profile = useGameStore((state) => state.profile);
  const signOut = useGameStore((state) => state.signOut);
  const setScreen = useGameStore((state) => state.setScreen);
  const createGame = useGameStore((state) => state.createGame);
  const joinGame = useGameStore((state) => state.joinGame);
  const lobbyError = useGameStore((state) => state.lobbyError);
  const clearLobbyError = useGameStore((state) => state.clearLobbyError);

  const handleCreateGame = async () => {
    setIsCreating(true);
    clearLobbyError?.();

    const success = await createGame?.(maxPlayers);

    if (success) {
      setShowCreateModal(false);
      setScreen("waitingRoom");
    }
    setIsCreating(false);
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsJoining(true);
    clearLobbyError?.();

    const success = await joinGame?.(joinCode.trim().toUpperCase());

    if (success) {
      setScreen("waitingRoom");
    }
    setIsJoining(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setScreen("title");
  };

  const handlePlayLocal = () => {
    setScreen("classSelect");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Users className="w-10 h-10 text-amber-500" />
          <h1 className="text-4xl font-bold text-amber-100 tracking-wider">
            Multiplayer Lobby
          </h1>
        </div>
        <p className="text-stone-400">
          Welcome, <span className="text-amber-400">{profile?.username || "Hero"}</span>
        </p>
      </div>

      {/* Main Options */}
      <div className="w-full max-w-md space-y-6">
        {/* Create Game */}
        <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
          <h2 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Game
          </h2>
          <p className="text-stone-400 text-sm mb-4">
            Start a new adventure and invite friends with a code
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Create Game
          </button>
        </div>

        {/* Join Game */}
        <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
          <h2 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Join Existing Game
          </h2>
          <form onSubmit={handleJoinGame} className="space-y-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-letter code..."
              maxLength={6}
              className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-amber-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-widest text-center text-xl font-mono"
              disabled={isJoining}
            />
            <button
              type="submit"
              disabled={isJoining || joinCode.length < 6}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 disabled:from-stone-600 disabled:to-stone-600 text-blue-100 disabled:text-stone-400 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Game"
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {lobbyError && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{lobbyError}</p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-stone-700" />
          <span className="text-stone-500 text-sm">or</span>
          <div className="flex-1 h-px bg-stone-700" />
        </div>

        {/* Local Play */}
        <button
          onClick={handlePlayLocal}
          className="w-full bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Play Locally (Offline)
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full text-stone-500 hover:text-stone-300 font-medium py-2 px-6 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Create Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-800 rounded-xl p-6 border border-stone-600 w-full max-w-sm">
            <h2 className="text-xl font-bold text-amber-100 mb-4">
              Create New Game
            </h2>

            <div className="mb-6">
              <label className="block text-stone-300 text-sm font-medium mb-2">
                Max Players
              </label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMaxPlayers(num)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      maxPlayers === num
                        ? "bg-amber-600 text-amber-100"
                        : "bg-stone-700 text-stone-400 hover:bg-stone-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium py-3 rounded-lg transition-all"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="flex-1 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
