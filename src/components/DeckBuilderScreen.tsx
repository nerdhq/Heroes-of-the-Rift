import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { Check, ArrowLeft, HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";
import type { Card } from "../types";

export function DeckBuilderScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const selectedClasses = useGameStore((state) => state.selectedClasses);
  const heroNames = useGameStore((state) => state.heroNames);
  const deckBuildingPlayerIndex = useGameStore(
    (state) => state.deckBuildingPlayerIndex
  );
  const availableCards = useGameStore((state) => state.availableCards);
  const selectedDeckCards = useGameStore((state) => state.selectedDeckCards);
  const toggleCardSelection = useGameStore(
    (state) => state.toggleCardSelection
  );
  const confirmDeck = useGameStore((state) => state.confirmDeck);
  const setScreen = useGameStore((state) => state.setScreen);

  const currentClass = selectedClasses[deckBuildingPlayerIndex];
  const classConfig = CLASS_CONFIGS[currentClass];
  const heroName =
    heroNames[deckBuildingPlayerIndex] || `Hero ${deckBuildingPlayerIndex + 1}`;

  const getRarityColor = (rarity: Card["rarity"]): string => {
    const colors = {
      common: "border-stone-500 bg-stone-800",
      uncommon: "border-green-500 bg-green-900/30",
      rare: "border-blue-500 bg-blue-900/30",
      legendary: "border-amber-500 bg-amber-900/30",
    };
    return colors[rarity];
  };

  const getRarityTextColor = (rarity: Card["rarity"]): string => {
    const colors = {
      common: "text-stone-400",
      uncommon: "text-green-400",
      rare: "text-blue-400",
      legendary: "text-amber-400",
    };
    return colors[rarity];
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setScreen("classSelect")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Class Selection
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Build {heroName}'s Deck
          </h1>
          <p className="text-stone-400">
            Hero {deckBuildingPlayerIndex + 1} of {selectedClasses.length}:{" "}
            <span style={{ color: classConfig.color }} className="font-bold">
              {classConfig.name}
            </span>
          </p>
        </div>

        {/* Selected count */}
        <div className="text-center mb-8">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {selectedDeckCards.length} / 5 Cards Selected
          </span>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {availableCards.map((card) => {
            const isSelected = selectedDeckCards.includes(card.id);

            return (
              <button
                key={card.id}
                onClick={() => toggleCardSelection(card.id)}
                className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${getRarityColor(
                  card.rarity
                )} ${
                  isSelected
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900"
                    : ""
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1">
                    <Check className="w-3 h-3 text-stone-900" />
                  </div>
                )}

                {/* Card name */}
                <h3 className="text-lg font-bold text-amber-100 mb-1">
                  {card.name}
                </h3>

                {/* Rarity */}
                <p
                  className={`text-xs uppercase mb-2 ${getRarityTextColor(
                    card.rarity
                  )}`}
                >
                  {card.rarity}
                </p>

                {/* Description */}
                <p className="text-stone-300 text-sm mb-3">
                  {card.description}
                </p>

                {/* Aggro */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-400">⚡ Aggro: {card.aggro}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div className="text-center">
          <button
            onClick={confirmDeck}
            disabled={selectedDeckCards.length !== 5}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
              selectedDeckCards.length === 5
                ? "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 transform hover:scale-105 shadow-lg shadow-amber-900/50"
                : "bg-stone-700 text-stone-500 cursor-not-allowed"
            }`}
          >
            {deckBuildingPlayerIndex < selectedClasses.length - 1
              ? "Next Hero →"
              : "Start Adventure! ⚔️"}
          </button>
        </div>
      </div>
    </div>
  );
}
