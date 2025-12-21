import type { Player } from "../../types";

interface DiceRollOverlayProps {
  diceRolling: boolean;
  diceRoll: number | null;
  currentPlayer: Player | undefined;
}

// D20 dice face component - shows dots/pips pattern for values 1-20
function DiceFace({ value, isRolling }: { value: number; isRolling: boolean }) {
  // For D20, we'll show the number prominently with decorative corners
  return (
    <div
      className={`relative w-32 h-32 ${
        isRolling ? "animate-dice-roll" : ""
      }`}
    >
      {/* Dice body - icosahedron-inspired shape */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 rounded-lg transform rotate-0 shadow-2xl border-4 border-amber-400 ${
          isRolling ? "" : "shadow-amber-500/50"
        }`}
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      >
        {/* Inner shadow for depth */}
        <div className="absolute inset-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded"
          style={{
            clipPath: "polygon(50% 5%, 95% 27%, 95% 73%, 50% 95%, 5% 73%, 5% 27%)",
          }}
        />
        
        {/* Number display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-4xl font-black ${
              value === 20
                ? "text-green-300 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                : value === 1
                ? "text-red-300 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]"
                : "text-amber-100"
            } drop-shadow-lg`}
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            {value}
          </span>
        </div>
      </div>
      
      {/* Highlight effect */}
      <div
        className="absolute top-1 left-1 w-8 h-8 bg-white/20 rounded-full blur-sm"
        style={{ transform: "translate(10px, 5px)" }}
      />
    </div>
  );
}

export function DiceRollOverlay({
  diceRolling,
  diceRoll,
  currentPlayer,
}: DiceRollOverlayProps) {
  if (!diceRolling && diceRoll === null) {
    return null;
  }

  const displayValue = diceRoll ?? 1;
  const isNat20 = !diceRolling && diceRoll === 20;
  const isNat1 = !diceRolling && diceRoll === 1;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className={`bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl p-8 border-2 shadow-2xl text-center ${
          isNat20
            ? "border-green-400 shadow-green-500/30"
            : isNat1
            ? "border-red-400 shadow-red-500/30"
            : "border-amber-500 shadow-amber-500/30"
        }`}
      >
        <h3 className="text-xl font-bold text-amber-400 mb-6">
          🎲 Rolling D20 for Aggro
        </h3>

        {/* 2D Dice Display */}
        <div className="flex justify-center mb-6">
          <DiceFace value={displayValue} isRolling={diceRolling} />
        </div>

        {/* Result text */}
        {!diceRolling && diceRoll !== null && currentPlayer && (
          <div className="text-center space-y-2">
            {isNat20 && (
              <p className="text-green-400 font-bold text-lg animate-pulse">
                ✨ NATURAL 20! ✨
              </p>
            )}
            {isNat1 && (
              <p className="text-red-400 font-bold text-lg animate-pulse">
                💀 Natural 1...
              </p>
            )}
            <p className="text-stone-300">
              {currentPlayer.name} rolled a{" "}
              <span
                className={`font-bold ${
                  isNat20
                    ? "text-green-400"
                    : isNat1
                    ? "text-red-400"
                    : "text-amber-400"
                }`}
              >
                {diceRoll}
              </span>
              !
            </p>
            <p className="text-lg text-amber-300 mt-2">
              Total Aggro:{" "}
              <span className="font-bold text-amber-400 text-xl">
                {currentPlayer.baseAggro + diceRoll}
              </span>
              <span className="text-stone-400 text-sm ml-2">
                ({currentPlayer.baseAggro} base + {diceRoll} roll)
              </span>
            </p>
          </div>
        )}

        {diceRolling && (
          <p className="text-amber-300 animate-pulse font-medium">
            Rolling...
          </p>
        )}
      </div>
    </div>
  );
}
