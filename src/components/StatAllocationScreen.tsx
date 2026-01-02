import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  ArrowLeft,
  Plus,
  Swords,
  Zap,
  Heart,
  Brain,
  Shield,
  Clover,
  Star,
  Info,
} from "lucide-react";
import type { CharacterAttributes } from "../types";

const STAT_INFO: Record<
  keyof CharacterAttributes,
  { name: string; icon: typeof Swords; color: string; description: string }
> = {
  STR: {
    name: "Strength",
    icon: Swords,
    color: "text-red-400",
    description: "+3% physical damage per point",
  },
  AGI: {
    name: "Agility",
    icon: Zap,
    color: "text-yellow-400",
    description: "+0.5% dodge chance per point above 10",
  },
  CON: {
    name: "Constitution",
    icon: Heart,
    color: "text-pink-400",
    description: "+2 max HP and +2.5% shield per point",
  },
  INT: {
    name: "Intelligence",
    icon: Brain,
    color: "text-blue-400",
    description: "+4% spell damage per point",
  },
  WIS: {
    name: "Wisdom",
    icon: Shield,
    color: "text-purple-400",
    description: "+3.5% healing, +1 buff duration per 10 pts",
  },
  LCK: {
    name: "Luck",
    icon: Clover,
    color: "text-green-400",
    description: "5% base crit + 0.5% per point",
  },
};

const STAT_ORDER: (keyof CharacterAttributes)[] = [
  "STR",
  "AGI",
  "CON",
  "INT",
  "WIS",
  "LCK",
];

export function StatAllocationScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const allocateStatPoint = useGameStore((state) => state.allocateStatPoint);

  if (!activeChampion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-lg mb-4">No champion selected</p>
          <button
            onClick={() => setScreen("championSelect")}
            className="text-amber-400 hover:text-amber-300"
          >
            Select a Champion
          </button>
        </div>
      </div>
    );
  }

  const config = CLASS_CONFIGS[activeChampion.class];
  const getStatCost = (currentValue: number) => (currentValue >= 50 ? 2 : 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setScreen("championSelect")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Champions
        </button>

        {/* Champion Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Allocate Stats
          </h1>
          <div className="flex items-center justify-center gap-3 text-stone-400">
            <span className="text-2xl">{activeChampion.name}</span>
            <span className="text-stone-600">•</span>
            <span>{config.name}</span>
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4" />
              <span>Level {activeChampion.level}</span>
            </div>
          </div>
        </div>

        {/* Available Points */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-green-700 to-green-600 px-8 py-4 rounded-xl">
            <div className="text-green-200 text-sm mb-1">Available Points</div>
            <div className="text-4xl font-bold text-white">
              {activeChampion.unspentStatPoints}
            </div>
          </div>
        </div>

        {/* Soft Cap Warning */}
        <div className="flex items-start gap-2 bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mb-8">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-200 text-sm">
            Stats above 50 cost 2 points each. All stats cap at 99.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4 mb-8">
          {STAT_ORDER.map((stat) => {
            const info = STAT_INFO[stat];
            const Icon = info.icon;
            const currentValue = activeChampion.attributes[stat];
            const cost = getStatCost(currentValue);
            const canAllocate =
              activeChampion.unspentStatPoints >= cost && currentValue < 99;

            return (
              <div
                key={stat}
                className="bg-stone-800/50 rounded-xl p-4 border border-stone-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center ${info.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">
                          {info.name}
                        </span>
                        <span className="text-stone-500 text-sm">({stat})</span>
                      </div>
                      <p className="text-stone-400 text-sm">{info.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {currentValue}
                      </div>
                      {currentValue >= 50 && currentValue < 99 && (
                        <div className="text-xs text-amber-400">2 pts/level</div>
                      )}
                      {currentValue >= 99 && (
                        <div className="text-xs text-green-400">MAX</div>
                      )}
                    </div>

                    <button
                      onClick={() => allocateStatPoint(stat)}
                      disabled={!canAllocate}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        canAllocate
                          ? "bg-green-600 hover:bg-green-500 text-white"
                          : "bg-stone-700 text-stone-500 cursor-not-allowed"
                      }`}
                      title={
                        currentValue >= 99
                          ? "Maximum reached"
                          : `Allocate ${cost} point${cost > 1 ? "s" : ""}`
                      }
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Stat Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-stone-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        currentValue >= 50
                          ? "bg-gradient-to-r from-amber-500 to-amber-400"
                          : "bg-gradient-to-r from-stone-500 to-stone-400"
                      }`}
                      style={{ width: `${(currentValue / 99) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 mt-1">
                    <span>10</span>
                    <span className="text-amber-500">50</span>
                    <span>99</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Done Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setScreen("championSelect")}
            className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-3 px-12 rounded-lg text-xl transition-all hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
