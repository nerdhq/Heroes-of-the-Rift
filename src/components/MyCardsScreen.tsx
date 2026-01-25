import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { ArrowLeft, Filter, Library } from "lucide-react";
import type { Card, Rarity, ClassType } from "../types";

export function MyCardsScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const playerAccount = useGameStore((state) => state.playerAccount);
  const activeChampion = useGameStore((state) => state.activeChampion);

  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassType | "all">("all");
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<Rarity | "all">("all");
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(
    activeChampion?.id ?? null
  );

  // Get the selected champion
  const champions = playerAccount?.champions ?? [];
  const selectedChampion = champions.find((c) => c.id === selectedChampionId) ?? null;
  
  // Get cards from the selected champion
  const ownedCards = selectedChampion?.ownedCards ?? [];

  const filteredCards = ownedCards.filter((card) => {
    if (selectedClassFilter !== "all" && card.class !== selectedClassFilter) return false;
    if (selectedRarityFilter !== "all" && card.rarity !== selectedRarityFilter) return false;
    return true;
  });

  // Group cards by class for display
  const cardsByClass = filteredCards.reduce((acc, card) => {
    if (!acc[card.class]) {
      acc[card.class] = [];
    }
    acc[card.class].push(card);
    return acc;
  }, {} as Record<ClassType, Card[]>);

  const getRarityColor = (rarity: Rarity): string => {
    const colors: Record<Rarity, string> = {
      common: "border-stone-500 bg-stone-800",
      uncommon: "border-green-500 bg-green-900/30",
      rare: "border-blue-500 bg-blue-900/30",
      legendary: "border-amber-500 bg-amber-900/30",
    };
    return colors[rarity];
  };

  const getRarityTextColor = (rarity: Rarity): string => {
    const colors: Record<Rarity, string> = {
      common: "text-stone-300",
      uncommon: "text-green-400",
      rare: "text-blue-400",
      legendary: "text-amber-400",
    };
    return colors[rarity];
  };

  const classes: (ClassType | "all")[] = [
    "all", "fighter", "rogue", "paladin", "mage", "cleric", "bard", "archer", "barbarian"
  ];
  const rarities: (Rarity | "all")[] = ["all", "common", "uncommon", "rare", "legendary"];

  // Count cards by rarity
  const rarityCount = ownedCards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {} as Record<Rarity, number>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => setScreen("title")}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Library className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-bold text-amber-100">My Cards</h1>
          </div>
          
          {/* Champion Selector */}
          {champions.length > 0 ? (
            <div className="mb-6">
              <label className="block text-stone-400 text-sm mb-2">Select Champion</label>
              <div className="flex justify-center">
                <select
                  value={selectedChampionId ?? ""}
                  onChange={(e) => setSelectedChampionId(e.target.value || null)}
                  className="bg-stone-800 text-amber-100 border border-stone-600 rounded-lg px-4 py-2 min-w-[250px]"
                >
                  <option value="">-- Select a Champion --</option>
                  {champions.map((champion) => (
                    <option key={champion.id} value={champion.id}>
                      {champion.name} ({CLASS_CONFIGS[champion.class].name} - Lvl {champion.level})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-stone-500">
              <p>No champions created yet. Create a champion to view their cards.</p>
            </div>
          )}

          {selectedChampion && (
            <>
              <p className="text-stone-400 text-lg mb-4">
                <span style={{ color: CLASS_CONFIGS[selectedChampion.class].color }} className="font-bold">
                  {selectedChampion.name}
                </span>
                's card collection ({ownedCards.length} cards)
              </p>
              
              {/* Rarity breakdown */}
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-stone-400">
                  Common: <span className="text-stone-300 font-bold">{rarityCount.common || 0}</span>
                </span>
                <span className="text-stone-400">
                  Uncommon: <span className="text-green-400 font-bold">{rarityCount.uncommon || 0}</span>
                </span>
                <span className="text-stone-400">
                  Rare: <span className="text-blue-400 font-bold">{rarityCount.rare || 0}</span>
                </span>
                <span className="text-stone-400">
                  Legendary: <span className="text-amber-400 font-bold">{rarityCount.legendary || 0}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-stone-400">Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value as ClassType | "all")}
              className="bg-stone-800 text-amber-100 border border-stone-600 rounded-lg px-3 py-2"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls === "all" ? "All Classes" : CLASS_CONFIGS[cls].name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">Rarity:</span>
            <select
              value={selectedRarityFilter}
              onChange={(e) => setSelectedRarityFilter(e.target.value as Rarity | "all")}
              className="bg-stone-800 text-amber-100 border border-stone-600 rounded-lg px-3 py-2"
            >
              {rarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {rarity === "all" ? "All Rarities" : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Count */}
        <div className="text-center mb-6 text-stone-400">
          Showing {filteredCards.length} cards
        </div>

        {/* Cards Display */}
        {!selectedChampion ? (
          <div className="text-center py-16">
            <Library className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-500 text-xl mb-2">Select a champion to view their cards</p>
            <p className="text-stone-600">
              Each champion has their own card collection.
            </p>
          </div>
        ) : ownedCards.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-16 h-16 text-stone-600 mx-auto mb-4" />
            <p className="text-stone-500 text-xl mb-2">No cards in this champion's collection</p>
            <p className="text-stone-600">
              Visit the Card Shop to purchase cards for this champion!
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 text-xl">No cards match your filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(cardsByClass).map(([classType, cards]) => (
              <div key={classType}>
                <h2 
                  className="text-xl font-bold mb-4 flex items-center gap-2"
                  style={{ color: CLASS_CONFIGS[classType as ClassType].color }}
                >
                  {CLASS_CONFIGS[classType as ClassType].name}
                  <span className="text-stone-500 text-sm font-normal">
                    ({cards.length} cards)
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-4 rounded-xl border-2 ${getRarityColor(card.rarity)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-lg font-bold ${getRarityTextColor(card.rarity)}`}>
                          {card.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getRarityTextColor(card.rarity)} bg-stone-900/50`}
                        >
                          {card.rarity}
                        </span>
                      </div>
                      <p className="text-stone-300 text-sm mb-3">{card.description}</p>
                      <div className="text-sm text-amber-400">⚡ Aggro: {card.aggro}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
