import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS, AVAILABLE_CLASSES } from "../data/classes";
import { Check, Users, ArrowLeft, Edit2, HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";
import type { ClassType } from "../types";

export function ClassSelectScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const selectedClasses = useGameStore((state) => state.selectedClasses);
  const heroNames = useGameStore((state) => state.heroNames);
  const toggleClassSelection = useGameStore(
    (state) => state.toggleClassSelection
  );
  const setHeroName = useGameStore((state) => state.setHeroName);
  const confirmClassSelection = useGameStore(
    (state) => state.confirmClassSelection
  );
  const setScreen = useGameStore((state) => state.setScreen);

  const getClassIcon = (classType: ClassType): string => {
    const icons: Record<ClassType, string> = {
      warrior: "⚔️",
      rogue: "🗡️",
      paladin: "🛡️",
      mage: "🔮",
      priest: "✨",
      bard: "🎵",
      archer: "🏹",
      barbarian: "🪓",
    };
    return icons[classType];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8 relative">
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 z-10 bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
        title="Game Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setScreen("title")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Choose Your Heroes
          </h1>
          <div className="flex items-center justify-center gap-2 text-stone-400">
            <Users className="w-5 h-5" />
            <span>Select 1-5 classes for your party</span>
          </div>
        </div>

        {/* Selected count */}
        <div className="text-center mb-4">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {selectedClasses.length} / 5 Heroes Selected
          </span>
        </div>

        {/* Hero Names */}
        {selectedClasses.length > 0 && (
          <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700">
            <h3 className="text-lg font-bold text-amber-100 mb-3 flex items-center gap-2">
              <Edit2 className="w-5 h-5" />
              Name Your Heroes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {selectedClasses.map((classType, index) => (
                <div key={`name-${index}`} className="flex flex-col gap-1">
                  <label className="text-xs text-stone-400">
                    {getClassIcon(classType)} {CLASS_CONFIGS[classType].name}
                  </label>
                  <input
                    type="text"
                    value={heroNames[index] || ""}
                    onChange={(e) => setHeroName(index, e.target.value)}
                    placeholder={`Hero ${index + 1}`}
                    className="bg-stone-700 border border-stone-600 rounded px-3 py-2 text-amber-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                    maxLength={20}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {AVAILABLE_CLASSES.map((classType) => {
            const config = CLASS_CONFIGS[classType];
            const isSelected = selectedClasses.includes(classType);

            return (
              <button
                key={classType}
                onClick={() => toggleClassSelection(classType)}
                className={`relative p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  isSelected
                    ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30"
                    : "border-stone-700 bg-stone-800/50 hover:border-stone-600"
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-amber-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-stone-900" />
                  </div>
                )}

                {/* Class icon */}
                <div className="text-5xl mb-4">{getClassIcon(classType)}</div>

                {/* Class name */}
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: config.color }}
                >
                  {config.name}
                </h3>

                {/* Description */}
                <p className="text-stone-400 text-sm mb-4">
                  {config.description}
                </p>

                {/* Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">❤️ {config.baseHp} HP</span>
                  <span className="text-blue-400">
                    ⚡ {config.resourceName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="text-center">
          <button
            onClick={confirmClassSelection}
            disabled={selectedClasses.length === 0}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
              selectedClasses.length > 0
                ? "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 transform hover:scale-105 shadow-lg shadow-amber-900/50"
                : "bg-stone-700 text-stone-500 cursor-not-allowed"
            }`}
          >
            Build Decks →
          </button>
        </div>
      </div>
    </div>
  );
}
