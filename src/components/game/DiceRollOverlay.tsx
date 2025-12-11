import { Dice6 } from "lucide-react";
import type { Player } from "../../types";

interface DiceRollOverlayProps {
  diceRolling: boolean;
  diceRoll: number | null;
  currentPlayer: Player | undefined;
}

export function DiceRollOverlay({
  diceRolling,
  diceRoll,
  currentPlayer,
}: DiceRollOverlayProps) {
  if (!diceRolling && diceRoll === null) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-2xl p-8 border-2 border-amber-500 shadow-2xl text-center">
        <h3 className="text-xl font-bold text-amber-400 mb-4">
          <Dice6 className="w-6 h-6 inline mr-2" />
          Rolling for Aggro
        </h3>
        <div
          className={`text-7xl font-bold mb-4 ${
            diceRolling ? "animate-bounce text-amber-300" : "text-green-400"
          }`}
        >
          {diceRoll ?? "?"}
        </div>
        {!diceRolling && diceRoll !== null && currentPlayer && (
          <div className="text-center">
            <p className="text-stone-300">
              {currentPlayer.name} rolled a{" "}
              <span className="text-amber-400 font-bold">{diceRoll}</span>!
            </p>
            <p className="text-lg text-amber-300 mt-2">
              Total Aggro:{" "}
              <span className="font-bold text-amber-400">
                {currentPlayer.baseAggro + diceRoll}
              </span>
              <span className="text-stone-400 text-sm ml-2">
                ({currentPlayer.baseAggro} base + {diceRoll} roll)
              </span>
            </p>
          </div>
        )}
        {diceRolling && (
          <p className="text-stone-400 animate-pulse">Rolling...</p>
        )}
      </div>
    </div>
  );
}
