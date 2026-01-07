import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  Trophy,
  Skull,
  Star,
  Coins,
  ArrowUp,
  Sparkles,
  Swords,
  Shield,
  Heart,
} from "lucide-react";

interface GameSummary {
  isVictory: boolean;
  roundsCompleted: number;
  xpEarned: number;
  goldEarned: number;
  monstersKilled: number;
  previousLevel: number;
  newLevel: number;
  previousXP: number;
  newXP: number;
  xpToNextLevel: number;
  unspentStatPoints: number;
}

const getClassIcon = (classType: string): string => {
  const icons: Record<string, string> = {
    warrior: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    priest: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType] || "👤";
};

export function PostGameScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const round = useGameStore((state) => state.round);
  const players = useGameStore((state) => state.players);
  const roundGoldEarned = useGameStore((state) => state.roundGoldEarned);
  const addChampionGold = useGameStore((state) => state.addChampionGold);

  // Summary state - in a real app this would come from the game ending logic
  const [summary, setSummary] = useState<GameSummary | null>(null);

  useEffect(() => {
    // Calculate game summary
    if (!activeChampion) return;

    const player = players.find((p) => p.championId === activeChampion.id);
    const isVictory = player?.isAlive ?? false;

    // For now, approximate XP based on round progress
    // In full implementation, XP would be tracked during combat
    const estimatedXP = round * 50;
    const estimatedGold = roundGoldEarned;

    setSummary({
      isVictory,
      roundsCompleted: round - 1,
      xpEarned: estimatedXP,
      goldEarned: estimatedGold,
      monstersKilled: (round - 1) * 3,
      previousLevel: activeChampion.level,
      newLevel: activeChampion.level,
      previousXP: activeChampion.xp - estimatedXP,
      newXP: activeChampion.xp,
      xpToNextLevel: activeChampion.xpToNextLevel,
      unspentStatPoints: activeChampion.unspentStatPoints,
    });
  }, [activeChampion, round, players, roundGoldEarned]);

  if (!activeChampion || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-lg mb-4">Loading summary...</p>
        </div>
      </div>
    );
  }

  const config = CLASS_CONFIGS[activeChampion.class];
  const leveledUp = summary.newLevel > summary.previousLevel;
  const levelsGained = summary.newLevel - summary.previousLevel;
  const xpPercent = (summary.newXP / summary.xpToNextLevel) * 100;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${
        summary.isVictory
          ? "from-amber-900 via-stone-900 to-stone-900"
          : "from-red-900 via-stone-900 to-stone-900"
      } flex flex-col items-center justify-center p-8`}
    >
      {/* Result Icon */}
      <div className="mb-6">
        {summary.isVictory ? (
          <Trophy className="w-24 h-24 text-amber-400" />
        ) : (
          <Skull className="w-24 h-24 text-red-400" />
        )}
      </div>

      {/* Title */}
      <h1
        className={`text-5xl font-bold mb-2 ${
          summary.isVictory ? "text-amber-100" : "text-red-100"
        }`}
      >
        {summary.isVictory ? "VICTORY!" : "DEFEATED"}
      </h1>
      <p className="text-stone-400 text-xl mb-8">
        {summary.roundsCompleted > 0
          ? `Completed ${summary.roundsCompleted} round${summary.roundsCompleted > 1 ? "s" : ""}`
          : "Game Over"}
      </p>

      {/* Champion Card */}
      <div className="bg-stone-800/70 rounded-xl p-6 mb-8 border border-stone-700 max-w-md w-full">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{getClassIcon(activeChampion.class)}</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-amber-100">
              {activeChampion.name}
            </h2>
            <p className="text-stone-400">{config.name}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-5 h-5" />
              <span className="text-2xl font-bold">
                Lv. {activeChampion.level}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-stone-400 mb-1">
            <span>XP</span>
            <span>
              {summary.newXP} / {summary.xpToNextLevel}
            </span>
          </div>
          <div className="h-4 bg-stone-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Level Up Banner */}
        {leveledUp && (
          <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-lg p-4 mb-4 flex items-center gap-3">
            <ArrowUp className="w-8 h-8 text-green-200" />
            <div>
              <p className="text-green-100 font-bold text-lg">
                LEVEL UP! (+{levelsGained})
              </p>
              <p className="text-green-200 text-sm">
                +{levelsGained * 3} stat points available
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-green-200 ml-auto" />
          </div>
        )}

        {/* Stats Earned */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-stone-900/50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Star className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              +{summary.xpEarned}
            </div>
            <div className="text-xs text-stone-400">XP Earned</div>
          </div>
          <div className="bg-stone-900/50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <Coins className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              +{summary.goldEarned}
            </div>
            <div className="text-xs text-stone-400">Gold Earned</div>
          </div>
          <div className="bg-stone-900/50 rounded-lg p-3">
            <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
              <Skull className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.monstersKilled}
            </div>
            <div className="text-xs text-stone-400">Monsters</div>
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="bg-stone-800/50 rounded-xl p-4 mb-8 border border-stone-700 max-w-md w-full">
        <h3 className="text-stone-400 text-sm mb-3 text-center">
          Champion Stats
        </h3>
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          <div>
            <Swords className="w-4 h-4 mx-auto text-red-400 mb-1" />
            <div className="text-white font-bold">
              {activeChampion.attributes.STR}
            </div>
            <div className="text-stone-500">STR</div>
          </div>
          <div>
            <div className="text-yellow-400 text-lg mb-0">⚡</div>
            <div className="text-white font-bold">
              {activeChampion.attributes.AGI}
            </div>
            <div className="text-stone-500">AGI</div>
          </div>
          <div>
            <Heart className="w-4 h-4 mx-auto text-pink-400 mb-1" />
            <div className="text-white font-bold">
              {activeChampion.attributes.CON}
            </div>
            <div className="text-stone-500">CON</div>
          </div>
          <div>
            <div className="text-blue-400 text-lg mb-0">🧠</div>
            <div className="text-white font-bold">
              {activeChampion.attributes.INT}
            </div>
            <div className="text-stone-500">INT</div>
          </div>
          <div>
            <Shield className="w-4 h-4 mx-auto text-purple-400 mb-1" />
            <div className="text-white font-bold">
              {activeChampion.attributes.WIS}
            </div>
            <div className="text-stone-500">WIS</div>
          </div>
          <div>
            <div className="text-green-400 text-lg mb-0">🍀</div>
            <div className="text-white font-bold">
              {activeChampion.attributes.LCK}
            </div>
            <div className="text-stone-500">LCK</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 items-center">
        {summary.unspentStatPoints > 0 && (
          <button
            onClick={() => setScreen("statAllocation")}
            className="flex items-center gap-2 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-8 rounded-lg text-lg transition-all hover:scale-105"
          >
            <ArrowUp className="w-5 h-5" />
            Allocate Stats (+{summary.unspentStatPoints})
          </button>
        )}
        <button
          onClick={() => {
            // Save gold earned to champion before returning to title
            if (activeChampion) {
              const player = players.find((p) => p.championId === activeChampion.id);
              if (player && player.gold > 0) {
                addChampionGold(activeChampion.id, player.gold);
              }
            }
            setScreen("title");
          }}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-3 px-8 rounded-lg text-lg transition-all hover:scale-105"
        >
          Return to Title
        </button>
      </div>
    </div>
  );
}
