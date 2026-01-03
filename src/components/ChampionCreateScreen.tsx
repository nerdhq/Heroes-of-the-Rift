import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS, AVAILABLE_CLASSES } from "../data/classes";
import { ArrowLeft, Heart, Zap, Sparkles } from "lucide-react";
import type { ClassType } from "../types";

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

const getClassGradient = (classType: ClassType): string => {
  const colors: Record<ClassType, string> = {
    warrior: "from-red-700 to-red-600",
    rogue: "from-purple-700 to-purple-600",
    paladin: "from-yellow-600 to-yellow-500",
    mage: "from-blue-700 to-blue-600",
    priest: "from-white/20 to-white/10",
    bard: "from-pink-600 to-pink-500",
    archer: "from-green-700 to-green-600",
    barbarian: "from-orange-700 to-orange-600",
  };
  return colors[classType];
};

export function ChampionCreateScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const returnScreen = useGameStore((state) => state.returnScreen);
  const setReturnScreen = useGameStore((state) => state.setReturnScreen);
  const createChampion = useGameStore((state) => state.createChampion);

  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Please enter a name for your champion");
      return;
    }
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (name.trim().length > 20) {
      setError("Name must be 20 characters or less");
      return;
    }
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    createChampion(name.trim(), selectedClass);
    
    // Return to the appropriate screen based on where we came from
    const targetScreen = returnScreen || "championSelect";
    setReturnScreen(null); // Clear the return screen
    setScreen(targetScreen);
  };

  const selectedConfig = selectedClass ? CLASS_CONFIGS[selectedClass] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => {
            const targetScreen = returnScreen || "championSelect";
            setReturnScreen(null);
            setScreen(targetScreen);
          }}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {returnScreen === "onlineChampionSelect" ? "Back to Champion Selection" : "Back to Champions"}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Create New Champion
          </h1>
          <p className="text-stone-400">
            Choose a name and class for your new champion
          </p>
        </div>

        {/* Name Input */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-stone-300 mb-2 font-medium">
            Champion Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter champion name..."
            maxLength={20}
            className="w-full bg-stone-800 border-2 border-stone-600 focus:border-amber-500 rounded-lg px-4 py-3 text-white text-lg outline-none transition-colors"
          />
          <div className="text-right text-stone-500 text-sm mt-1">
            {name.length}/20
          </div>
        </div>

        {/* Class Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-stone-300 mb-4 text-center">
            Select Class
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_CLASSES.map((classType) => {
              const config = CLASS_CONFIGS[classType];
              const isSelected = selectedClass === classType;

              return (
                <button
                  key={classType}
                  onClick={() => {
                    setSelectedClass(classType);
                    setError("");
                  }}
                  className={`relative bg-gradient-to-br ${getClassGradient(
                    classType
                  )} rounded-xl p-4 transition-all hover:scale-105 border-2 ${
                    isSelected
                      ? "border-amber-400 shadow-lg shadow-amber-500/30"
                      : "border-transparent hover:border-white/20"
                  }`}
                >
                  <div className="text-4xl mb-2">{getClassIcon(classType)}</div>
                  <h3 className="text-lg font-bold text-white">{config.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-sm mt-1">
                    <Heart className="w-3 h-3" />
                    <span>{config.baseHp} HP</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Class Details */}
        {selectedConfig && (
          <div className="max-w-2xl mx-auto mb-8 bg-stone-800/50 rounded-xl p-6 border border-stone-700">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{getClassIcon(selectedClass!)}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {selectedConfig.name}
                </h3>
                <p className="text-stone-400 mb-4">{selectedConfig.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-stone-300">
                      Base HP: <span className="text-white font-bold">{selectedConfig.baseHp}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-stone-300">
                      {selectedConfig.resourceName}: <span className="text-white font-bold">{selectedConfig.maxResource}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium">
                      {selectedConfig.specialAbility.name}
                    </span>
                  </div>
                  <p className="text-stone-400 text-sm">
                    {selectedConfig.specialAbility.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-400 mb-4">{error}</div>
        )}

        {/* Create Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !selectedClass}
            className={`font-bold py-4 px-12 rounded-lg text-xl transition-all ${
              name.trim() && selectedClass
                ? "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 hover:scale-105"
                : "bg-stone-700 text-stone-500 cursor-not-allowed"
            }`}
          >
            Create Champion
          </button>
        </div>
      </div>
    </div>
  );
}
