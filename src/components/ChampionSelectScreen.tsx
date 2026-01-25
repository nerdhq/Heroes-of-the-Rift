import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Star,
  Coins,
  Swords,
  Heart,
  Shield,
  Zap,
  Brain,
  Clover,
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
  isActive,
  onSelect,
  onDelete,
}: {
  champion: Champion;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const config = CLASS_CONFIGS[champion.class];
  const xpPercent = (champion.xp / champion.xpToNextLevel) * 100;

  return (
    <div
      onClick={onSelect}
      className={`relative bg-gradient-to-br ${getClassColor(
        champion.class
      )} rounded-xl p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
        isActive ? "border-amber-400 shadow-lg shadow-amber-500/30" : "border-transparent"
      }`}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-amber-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
          ACTIVE
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

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-2 right-2 p-1 text-white/40 hover:text-red-400 transition-colors"
        title="Delete Champion"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ChampionSelectScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const setReturnScreen = useGameStore((state) => state.setReturnScreen);
  const playerAccount = useGameStore((state) => state.playerAccount);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const loadProgression = useGameStore((state) => state.loadProgression);
  const selectChampion = useGameStore((state) => state.selectChampion);
  const deleteChampion = useGameStore((state) => state.deleteChampion);

  useEffect(() => {
    loadProgression();
  }, [loadProgression]);

  const handleDelete = (championId: string, championName: string) => {
    if (
      window.confirm(
        `Delete ${championName}? This will permanently remove the champion and all their gold/cards.`
      )
    ) {
      deleteChampion(championId);
    }
  };

  const startChampionGame = useGameStore((state) => state.startChampionGame);

  const handlePlay = () => {
    if (activeChampion) {
      startChampionGame();
    }
  };

  const canCreateMore =
    playerAccount &&
    playerAccount.champions.length < playerAccount.maxChampionSlots;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setScreen("title")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Your Champions
          </h1>
          <p className="text-stone-400">
            Select a champion to play or create a new one
          </p>
        </div>

        {/* Champion slots info */}
        <div className="text-center mb-6">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {playerAccount?.champions.length ?? 0} /{" "}
            {playerAccount?.maxChampionSlots ?? 3} Champion Slots
          </span>
        </div>

        {/* Champions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {playerAccount?.champions.map((champion) => (
            <ChampionCard
              key={champion.id}
              champion={champion}
              isActive={activeChampion?.id === champion.id}
              onSelect={() => selectChampion(champion.id)}
              onDelete={() => handleDelete(champion.id, champion.name)}
            />
          ))}

          {/* Create new button */}
          {canCreateMore && (
            <button
              onClick={() => {
                setReturnScreen("championSelect");
                setScreen("championCreate");
              }}
              className="bg-stone-800/50 border-2 border-dashed border-stone-600 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-amber-500 hover:text-amber-400 transition-all"
            >
              <Plus className="w-12 h-12" />
              <span className="font-bold">Create New Champion</span>
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {activeChampion && (
            <>
              <button
                onClick={() => setScreen("statAllocation")}
                className={`font-bold py-3 px-8 rounded-lg transition-all ${
                  activeChampion.unspentStatPoints > 0
                    ? "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white"
                    : "bg-stone-700 hover:bg-stone-600 text-stone-200"
                }`}
              >
                {activeChampion.unspentStatPoints > 0
                  ? `Allocate Stats (+${activeChampion.unspentStatPoints})`
                  : "View Stats"}
              </button>
              <button
                onClick={handlePlay}
                className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-3 px-8 rounded-lg text-xl transition-all"
              >
                Play as {activeChampion.name}
              </button>
            </>
          )}
        </div>

        {/* Empty state */}
        {(!playerAccount || playerAccount.champions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-stone-400 text-lg mb-4">
              You don't have any champions yet.
            </p>
            <button
              onClick={() => setScreen("championCreate")}
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
