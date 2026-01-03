import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { User, LogIn, Loader2, AlertCircle } from "lucide-react";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signInAnonymously = useGameStore((state) => state.signInAnonymously);
  const authError = useGameStore((state) => state.authError);
  const clearAuthError = useGameStore((state) => state.clearAuthError);
  const setScreen = useGameStore((state) => state.setScreen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setIsLoading(true);

    const success = await signInAnonymously(username);

    if (success) {
      setScreen("onlineChampionSelect");
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    clearAuthError();
    setScreen("title");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <User className="w-12 h-12 text-amber-500" />
          <h1 className="text-4xl font-bold text-amber-100 tracking-wider">
            Join the Adventure
          </h1>
        </div>
        <p className="text-stone-400 text-lg">Enter your name to play online</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="bg-stone-800/50 rounded-xl p-8 border border-stone-700">
          {/* Username Input */}
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-stone-300 text-sm font-medium mb-2"
            >
              Your Hero Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a name..."
              maxLength={20}
              className="w-full bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-amber-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <p className="text-stone-500 text-xs mt-2">
              Leave empty for a random name
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{authError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:from-stone-600 disabled:to-stone-600 text-amber-100 disabled:text-stone-400 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-amber-900/50 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                Enter Lobby
              </>
            )}
          </button>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-full mt-4 bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium py-3 px-6 rounded-lg transition-all"
        >
          Back to Title
        </button>
      </form>

      {/* Info */}
      <div className="mt-8 text-center text-stone-500 text-sm max-w-md">
        <p>
          Play with friends online! Create a game and share the code, or join
          an existing game.
        </p>
      </div>
    </div>
  );
}
