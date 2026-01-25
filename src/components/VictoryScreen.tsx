import { useGameStore } from "../store/gameStore";
import { Trophy, Crown, Users, Shuffle } from "lucide-react";

export function VictoryScreen() {
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const players = useGameStore((state) => state.players);
  const savedParty = useGameStore((state) => state.savedParty);
  const playAgainSameParty = useGameStore((state) => state.playAgainSameParty);
  const playAgainNewParty = useGameStore((state) => state.playAgainNewParty);

  const alivePlayers = players.filter((p) => p.isAlive);
  const defeatedDragon = round > maxRounds || round === maxRounds;

  const getClassIcon = (classType: string): string => {
    const icons: Record<string, string> = {
      fighter: "⚔️",
      rogue: "🗡️",
      paladin: "🛡️",
      mage: "🔮",
      cleric: "✨",
      bard: "🎵",
      archer: "🏹",
      barbarian: "🪓",
    };
    return icons[classType] || "👤";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-stone-900 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Victory Icon */}
      <div className="mb-8 relative">
        {defeatedDragon ? (
          <>
            <Crown className="w-32 h-32 text-amber-400 animate-bounce" />
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-6xl">
              🐉
            </span>
          </>
        ) : (
          <Trophy className="w-32 h-32 text-amber-400 animate-bounce" />
        )}
      </div>

      {/* Title */}
      <h1 className="text-6xl font-bold text-amber-100 mb-4 mt-8">
        {defeatedDragon ? "LEGENDARY VICTORY!" : "VICTORY!"}
      </h1>
      <p className="text-2xl text-amber-400 mb-2">
        {defeatedDragon
          ? "You have slain the Ancient Dragon!"
          : `Round ${round - 1} Complete`}
      </p>
      <p className="text-lg text-stone-400 mb-8">
        {defeatedDragon
          ? "The dungeon is cleared. You are heroes of legend!"
          : "Prepare for the next challenge..."}
      </p>

      {/* Survivors */}
      <div className="bg-stone-800/50 rounded-xl p-6 mb-8 border border-amber-700">
        <h2 className="text-xl font-bold text-amber-100 mb-4 text-center">
          {defeatedDragon ? "Legendary Heroes" : "Surviving Heroes"}
        </h2>
        <div className="flex gap-4 justify-center flex-wrap">
          {alivePlayers.map((player) => (
            <div
              key={player.id}
              className="text-center p-4 bg-stone-700/50 rounded-lg"
            >
              <div className="text-3xl mb-2">{getClassIcon(player.class)}</div>
              <p className="text-amber-100 font-bold">{player.name}</p>
              <p className="text-red-400 text-sm">
                {player.hp}/{player.maxHp} HP
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {defeatedDragon && (
        <div className="bg-stone-800/30 rounded-xl p-4 mb-8 border border-stone-700">
          <p className="text-stone-300 text-center">
            🏆 All {maxRounds} rounds completed! 🏆
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex gap-4">
          {savedParty && (
            <button
              onClick={playAgainSameParty}
              className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-900/50"
            >
              <Users className="w-6 h-6" />
              Play Again (Same Party)
            </button>
          )}
          <button
            onClick={playAgainNewParty}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-900/50"
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
