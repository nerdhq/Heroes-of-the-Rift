import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  ArrowLeft,
  Star,
  Coins,
  Swords,
  Heart,
  Shield,
  Zap,
  Brain,
  Clover,
  Users,
  Play,
} from "lucide-react";
import type { Champion, ClassType } from "../types";

const getClassIcon = (classType: ClassType): string => {
  const icons: Record<ClassType, string> = {
    fighter: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    cleric: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType];
};

const getClassColor = (classType: ClassType): string => {
  const colors: Record<ClassType, string> = {
    fighter: "from-red-700 to-red-600",
    rogue: "from-purple-700 to-purple-600",
    paladin: "from-yellow-600 to-yellow-500",
    mage: "from-blue-700 to-blue-600",
    cleric: "from-white/20 to-white/10",
    bard: "from-pink-600 to-pink-500",
    archer: "from-green-700 to-green-600",
    barbarian: "from-orange-700 to-orange-600",
  };
  return colors[classType];
};

function ChampionCard({
  champion,
  isSelected,
  selectionNumber,
  onToggle,
}: {
  champion: Champion;
  isSelected: boolean;
  selectionNumber: number;
  onToggle: () => void;
}) {
  const config = CLASS_CONFIGS[champion.class] ?? { name: "Unknown", color: "#888" };
  const xpPercent = (champion.xp / champion.xpToNextLevel) * 100;

  return (
    <div
      onClick={onToggle}
      className={`relative bg-gradient-to-br ${getClassColor(
        champion.class
      )} rounded-xl p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
        isSelected
          ? "border-green-400 shadow-lg shadow-green-500/30"
          : "border-transparent hover:border-white/30"
      }`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center">
          {selectionNumber}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-3xl mb-1">{getClassIcon(champion.class)}</div>
          <h3 className="text-xl font-bold text-white">{champion.name}</h3>
          <p className="text-sm text-white/70">{config.name}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-amber-300">
            <Star className="w-4 h-4" />
            <span className="font-bold">Lv. {champion.level}</span>
          </div>
          {champion.unspentStatPoints > 0 && (
            <div className="text-xs text-green-300 mt-1">
              +{champion.unspentStatPoints} pts
            </div>
          )}
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>XP</span>
          <span>
            {champion.xp} / {champion.xpToNextLevel}
          </span>
        </div>
        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Stats preview */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1 text-white/80">
          <Swords className="w-3 h-3" />
          <span>{champion.attributes.STR}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <Zap className="w-3 h-3" />
          <span>{champion.attributes.AGI}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <Heart className="w-3 h-3" />
          <span>{champion.attributes.CON}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <Brain className="w-3 h-3" />
          <span>{champion.attributes.INT}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <Shield className="w-3 h-3" />
          <span>{champion.attributes.WIS}</span>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <Clover className="w-3 h-3" />
          <span>{champion.attributes.LCK}</span>
        </div>
      </div>

      {/* Gold and Cards */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1 text-yellow-300">
          <Coins className="w-4 h-4" />
          <span>{champion.gold}</span>
        </div>
        <div className="text-white/60">{champion.ownedCards.length} cards</div>
      </div>
    </div>
  );
}

export function GameChampionSelectScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const setReturnScreen = useGameStore((state) => state.setReturnScreen);
  const playerAccount = useGameStore((state) => state.playerAccount);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const loadProgression = useGameStore((state) => state.loadProgression);

  // Local co-op state and actions
  const localCoopChampions = useGameStore((state) => state.localCoopChampions);
  const toggleLocalCoopChampion = useGameStore((state) => state.toggleLocalCoopChampion);
  const clearLocalCoopChampions = useGameStore((state) => state.clearLocalCoopChampions);
  const startLocalCoopGame = useGameStore((state) => state.startLocalCoopGame);

  useEffect(() => {
    loadProgression();
  }, [loadProgression]);

  // Pre-select active champion on mount if none selected
  useEffect(() => {
    if (activeChampion && localCoopChampions.length === 0) {
      toggleLocalCoopChampion(activeChampion.id);
    }
  }, [activeChampion, localCoopChampions.length, toggleLocalCoopChampion]);

  // Clean up selections when leaving
  useEffect(() => {
    return () => {
      // Don't clear if we're starting the game
    };
  }, []);

  const handleBack = () => {
    clearLocalCoopChampions();
    setScreen("title");
  };

  const handleStartGame = () => {
    if (localCoopChampions.length > 0) {
      startLocalCoopGame();
    }
  };

  // Get the selection number for a champion (1, 2, or 3)
  const getSelectionNumber = (championId: string): number => {
    const index = localCoopChampions.findIndex((c) => c.id === championId);
    return index >= 0 ? index + 1 : 0;
  };

  const canStart = localCoopChampions.length >= 1 && localCoopChampions.length <= 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Select Champions
          </h1>
          <p className="text-stone-400">
            Choose 1-5 champions for your adventure
          </p>
        </div>

        {/* Selection indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            localCoopChampions.length > 0
              ? "bg-green-900/50 text-green-300"
              : "bg-stone-800 text-stone-400"
          }`}>
            <Users className="w-5 h-5" />
            <span className="font-bold">
              {localCoopChampions.length}/5 Champions Selected
            </span>
          </div>
          {localCoopChampions.length > 0 && (
            <button
              onClick={clearLocalCoopChampions}
              className="text-stone-400 hover:text-red-400 text-sm underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Champions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {playerAccount?.champions.map((champion) => (
            <ChampionCard
              key={champion.id}
              champion={champion}
              isSelected={localCoopChampions.some((c) => c.id === champion.id)}
              selectionNumber={getSelectionNumber(champion.id)}
              onToggle={() => toggleLocalCoopChampion(champion.id)}
            />
          ))}
        </div>

        {/* Start button */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`font-bold py-4 px-10 rounded-lg text-xl transition-all flex items-center gap-3 ${
              canStart
                ? "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white transform hover:scale-105"
                : "bg-stone-700 text-stone-500 cursor-not-allowed"
            }`}
          >
            <Play className="w-6 h-6" />
            {localCoopChampions.length === 1
              ? `Play as ${localCoopChampions[0].name}`
              : localCoopChampions.length > 1
              ? `Start with ${localCoopChampions.length} Champions`
              : "Select a Champion"}
          </button>

          {localCoopChampions.length === 0 && (
            <p className="text-stone-500 text-sm">
              Click a champion to select them
            </p>
          )}
        </div>

        {/* Empty state */}
        {(!playerAccount || playerAccount.champions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-stone-400 text-lg mb-4">
              You don't have any champions yet.
            </p>
            <button
              onClick={() => {
                setReturnScreen("gameChampionSelect");
                setScreen("championCreate");
              }}
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-3 px-8 rounded-lg transition-all"
            >
              Create Your First Champion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
