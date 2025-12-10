import { useGameStore } from "../store/gameStore";
import { Skull, Users, Shuffle } from "lucide-react";

export function DefeatScreen() {
  const turn = useGameStore((state) => state.turn);
  const round = useGameStore((state) => state.round);
  const savedParty = useGameStore((state) => state.savedParty);
  const playAgainSameParty = useGameStore((state) => state.playAgainSameParty);
  const playAgainNewParty = useGameStore((state) => state.playAgainNewParty);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-stone-900 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Defeat Icon */}
      <div className="mb-8">
        <Skull className="w-32 h-32 text-red-500 animate-pulse" />
      </div>

      {/* Title */}
      <h1 className="text-6xl font-bold text-red-400 mb-4">DEFEAT</h1>
      <p className="text-2xl text-stone-400 mb-2">Your party has fallen...</p>
      <p className="text-lg text-stone-500 mb-8">
        Round {round} • Turn {turn}
      </p>

      {/* Quote */}
      <div className="bg-stone-800/50 rounded-xl p-6 mb-8 border border-red-900 max-w-md text-center">
        <p className="text-stone-400 italic">
          "The dungeon claims another group of adventurers. Perhaps the next
          party will fare better..."
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex gap-4">
          {savedParty && (
            <button
              onClick={playAgainSameParty}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-900/50"
            >
              <Users className="w-6 h-6" />
              Try Again (Same Party)
            </button>
          )}
          <button
            onClick={playAgainNewParty}
            className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-red-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
          >
            <Shuffle className="w-6 h-6" />
            Try Different Classes
          </button>
        </div>
        {savedParty && (
          <p className="text-stone-500 text-sm">
            Last party: {savedParty.names.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
