import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { Sword, Shield, Scroll, Users, Wifi, Coins, ShoppingBag } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

export function TitleScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const userData = useGameStore((state) => state.userData);
  const loadUserData = useGameStore((state) => state.loadUserData);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handlePlayOnline = () => {
    if (isAuthenticated) {
      setScreen("lobby");
    } else {
      setScreen("login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Sword className="w-12 h-12 text-amber-500" />
          <h1 className="text-6xl font-bold text-amber-100 tracking-wider">
            HEROES OF THE RIFT
          </h1>
          <Shield className="w-12 h-12 text-amber-500" />
        </div>
        <p className="text-stone-400 text-xl">A Co-op Card Dungeon Crawler</p>
      </div>

      {/* Gold Counter */}
      <div className="flex items-center gap-2 mb-8 bg-stone-800/50 px-6 py-3 rounded-full border border-yellow-600/30">
        <Coins className="w-6 h-6 text-yellow-500" />
        <span className="text-yellow-400 font-bold text-xl">{userData?.gold ?? 0} Gold</span>
      </div>

      {/* Decorative scroll */}
      <div className="relative mb-12">
        <Scroll className="w-24 h-24 text-amber-700 opacity-30" />
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-80">
        <button
          onClick={() => setScreen("classSelect")}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-900/50"
        >
          Local Game
        </button>

        <button
          onClick={() => setScreen("cardShop")}
          className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-900/50 flex items-center justify-center gap-3"
        >
          <ShoppingBag className="w-6 h-6" />
          Card Shop
        </button>

        {isSupabaseConfigured() ? (
          <button
            onClick={handlePlayOnline}
            className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-blue-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" />
            Play Online
          </button>
        ) : (
          <button
            disabled
            className="bg-stone-700 text-stone-500 font-bold py-4 px-8 rounded-lg text-xl cursor-not-allowed opacity-50 flex items-center justify-center gap-3"
            title="Supabase not configured"
          >
            <Wifi className="w-6 h-6" />
            Online (Not Configured)
          </button>
        )}

        <button
          disabled
          className="bg-stone-700 text-stone-500 font-bold py-4 px-8 rounded-lg text-xl cursor-not-allowed opacity-50"
        >
          Options
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-stone-600 text-sm">
        <p>Up to 5 Heroes • Turn-based Combat • Deck Building</p>
      </div>
    </div>
  );
}
