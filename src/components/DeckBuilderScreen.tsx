import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { Check, ArrowLeft, HelpCircle, Shuffle, Star } from "lucide-react";
import { HelpModal } from "./HelpModal";
import { getRarityColor, getRarityTextColor, parseFaithBonuses, hasFaithScaling, hasManaScaling, parseManaModifiers } from "../utils/cardHelpers";

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
  const activeChampion = useGameStore((state) => state.activeChampion);
  const localCoopChampions = useGameStore((state) => state.localCoopChampions);
  const clearLocalCoopChampions = useGameStore((state) => state.clearLocalCoopChampions);

  const currentClass = selectedClasses[deckBuildingPlayerIndex];
  const classConfig = currentClass ? CLASS_CONFIGS[currentClass] : null;

  // Guard against undefined state - redirect to title if no class selected
  if (!classConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400 text-lg mb-4">No class selected</p>
          <button
            onClick={() => setScreen("title")}
            className="text-amber-400 hover:text-amber-300"
          >
            Return to Title
          </button>
        </div>
      </div>
    );
  }

  // Check if in local co-op mode
  const isLocalCoopMode = localCoopChampions.length > 0;
  const currentCoopChampion = isLocalCoopMode ? localCoopChampions[deckBuildingPlayerIndex] : null;

  // Check if playing as champion (solo mode with active champion's class)
  const isChampionMode =
    !isLocalCoopMode &&
    activeChampion &&
    selectedClasses.length === 1 &&
    selectedClasses[0] === activeChampion.class;
  const heroName =
    heroNames[deckBuildingPlayerIndex] || `Hero ${deckBuildingPlayerIndex + 1}`;

  // Handle back button for co-op mode
  const handleBack = () => {
    if (isLocalCoopMode) {
      clearLocalCoopChampions();
      setScreen("gameChampionSelect");
    } else if (isChampionMode) {
      setScreen("gameChampionSelect");
    } else {
      setScreen("classSelect");
    }
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
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          {isLocalCoopMode ? "Cancel Co-op" : isChampionMode ? "Back to Title" : "Back to Class Selection"}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Build {heroName}'s Deck
          </h1>
          {isLocalCoopMode && currentCoopChampion ? (
            <div className="flex items-center justify-center gap-3 text-stone-400">
              <span className="text-green-400">
                Player {deckBuildingPlayerIndex + 1} of {localCoopChampions.length}
              </span>
              <span className="text-stone-600">•</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4" />
                <span>Level {currentCoopChampion.level}</span>
              </div>
              <span className="text-stone-600">•</span>
              <span style={{ color: classConfig.color }} className="font-bold">
                {classConfig.name}
              </span>
            </div>
          ) : isChampionMode && activeChampion ? (
            <div className="flex items-center justify-center gap-3 text-stone-400">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4" />
                <span>Level {activeChampion.level}</span>
              </div>
              <span className="text-stone-600">•</span>
              <span style={{ color: classConfig.color }} className="font-bold">
                {classConfig.name}
              </span>
            </div>
          ) : (
            <p className="text-stone-400">
              Hero {deckBuildingPlayerIndex + 1} of {selectedClasses.length}:{" "}
              <span style={{ color: classConfig.color }} className="font-bold">
                {classConfig.name}
              </span>
            </p>
          )}
        </div>

        {/* Selected count and Random Selection */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {selectedDeckCards.length} / 5 Cards Selected
          </span>
          <button
            onClick={() => {
              // Randomly select 5 cards from available cards
              const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
              const randomCards = shuffled.slice(0, 5).map((c) => c.id);
              // Clear current selection and set new random selection
              useGameStore.setState({ selectedDeckCards: randomCards });
            }}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-purple-100 px-4 py-2 rounded-full font-bold transition-all hover:scale-105"
          >
            <Shuffle className="w-4 h-4" />
            Random Selection
          </button>
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

                {/* Description - with faith bonus formatting for Paladin, mana scaling for Mage */}
                {hasFaithScaling(card.description) ? (
                  <div className="text-sm mb-3 space-y-1">
                    {(() => {
                      const bonuses = parseFaithBonuses(card.description);
                      return (
                        <>
                          <p className="text-stone-300">{bonuses.baseEffect}</p>
                          {bonuses.faith50Bonus && (
                            <p className="text-yellow-400 text-xs">
                              <span className="text-yellow-500 font-semibold">50% Faith:</span> {bonuses.faith50Bonus}
                            </p>
                          )}
                          {bonuses.faith100Bonus && (
                            <p className="text-amber-400 text-xs">
                              <span className="text-amber-500 font-semibold">100% Faith:</span> {bonuses.faith100Bonus}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : hasManaScaling(card.description) ? (
                  <div className="text-sm mb-3 space-y-1">
                    {(() => {
                      const modifiers = parseManaModifiers(card.description);
                      return (
                        <>
                          <p className="text-stone-300">{modifiers.baseEffect}</p>
                          {modifiers.empoweredBonus && (
                            <p className="text-cyan-400 text-xs">
                              <span className="text-cyan-500 font-semibold">Empowered:</span> {modifiers.empoweredBonus}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-stone-300 text-sm mb-3">
                    {card.description}
                  </p>
                )}

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
