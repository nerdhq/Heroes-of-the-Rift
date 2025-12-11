import type { GamePhase } from "../../types";

interface GameHeaderProps {
  round: number;
  maxRounds: number;
  turn: number;
  phase: GamePhase;
}

export function GameHeader({ round, maxRounds, turn, phase }: GameHeaderProps) {
  const phases = ["DRAW", "SELECT", "AGGRO", "PLAYER_ACTION", "MONSTER_ACTION"];
  const phaseLabels: Record<string, string> = {
    DRAW: "Draw",
    SELECT: "Select",
    AGGRO: "Roll",
    PLAYER_ACTION: "Attack",
    MONSTER_ACTION: "Enemy",
  };

  return (
    <>
      {/* Round & Turn Info */}
      <div className="text-center mb-2 flex justify-center gap-4">
        <span className="bg-amber-900/50 text-amber-300 px-4 py-2 rounded-full font-bold border border-amber-700">
          Round {round}/{maxRounds}
        </span>
        <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
          Turn {turn}
        </span>
      </div>

      {/* Phase Progress Indicator */}
      <div className="flex justify-center items-center gap-1 mb-3">
        {phases.map((p, i) => {
          const currentIndex = phases.indexOf(phase);
          const isActive = p === phase;
          const isPast = i < currentIndex;

          return (
            <div key={p} className="flex items-center">
              <div
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-stone-900 scale-110"
                    : isPast
                    ? "bg-green-700 text-green-100"
                    : "bg-stone-700 text-stone-400"
                }`}
              >
                {phaseLabels[p]}
              </div>
              {i < phases.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    isPast ? "bg-green-600" : "bg-stone-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
