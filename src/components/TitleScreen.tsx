import { useGameStore } from "../store/gameStore";
import { Sword, Shield, Scroll } from "lucide-react";

export function TitleScreen() {
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Sword className="w-12 h-12 text-amber-500" />
          <h1 className="text-6xl font-bold text-amber-100 tracking-wider">
            PAPER DUNGEON
          </h1>
          <Shield className="w-12 h-12 text-amber-500" />
        </div>
        <p className="text-stone-400 text-xl">A Co-op Card Dungeon Crawler</p>
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
          New Adventure
        </button>
        <button
          disabled
          className="bg-stone-700 text-stone-500 font-bold py-4 px-8 rounded-lg text-xl cursor-not-allowed opacity-50"
        >
          Continue (Coming Soon)
        </button>
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
