import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { getAllCards } from "../data/cards";
import { ShoppingCart, SkipForward, Coins, ArrowLeft, Filter } from "lucide-react";
import type { Card, Rarity, ClassType } from "../types";

// Card pricing based on rarity
const getCardPrice = (rarity: Rarity): number => {
  const prices: Record<Rarity, number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };
  return prices[rarity];
};

export function CardShopScreen() {
  const players = useGameStore((state) => state.players);
  const shopPlayerIndex = useGameStore((state) => state.shopPlayerIndex);
  const shopCards = useGameStore((state) => state.shopCards);
  const selectedShopCardId = useGameStore(
    (state) => state.selectedShopCardId
  );
  const selectShopCard = useGameStore((state) => state.selectShopCard);
  const purchaseShopCard = useGameStore((state) => state.purchaseShopCard);
  const skipShop = useGameStore((state) => state.skipShop);
  const setScreen = useGameStore((state) => state.setScreen);
  const userData = useGameStore((state) => state.userData);
  const purchaseCardForCollection = useGameStore((state) => state.purchaseCardForCollection);

  // Determine if we're in standalone mode (accessed from title screen)
  const isStandaloneMode = players.length === 0;

  // For standalone mode: local state for browsing all cards
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassType | "all">("all");
  const [selectedRarityFilter, setSelectedRarityFilter] = useState<Rarity | "all">("all");
  const [standaloneSelectedCardId, setStandaloneSelectedCardId] = useState<string | null>(null);

  // Get all cards for standalone mode
  const allCards = getAllCards();
  const filteredCards = allCards.filter((card) => {
    if (selectedClassFilter !== "all" && card.class !== selectedClassFilter) return false;
    if (selectedRarityFilter !== "all" && card.rarity !== selectedRarityFilter) return false;
    return true;
  });

  const currentPlayer = players[shopPlayerIndex];
  const classConfig = currentPlayer ? CLASS_CONFIGS[currentPlayer.class] : null;

  // Use user gold for standalone mode, player gold for in-game mode
  const currentGold = isStandaloneMode ? userData.gold : (currentPlayer?.gold || 0);

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

  const renderCard = (card: Card, isStandalone: boolean) => {
    const isSelected = isStandalone 
      ? standaloneSelectedCardId === card.id 
      : selectedShopCardId === card.id;
    const rarityStyle = getRarityColor(card.rarity);
    const rarityText = getRarityTextColor(card.rarity);
    const price = getCardPrice(card.rarity);
    const canAfford = currentGold >= price;

    const handleClick = () => {
      if (isStandalone) {
        setStandaloneSelectedCardId(card.id);
      } else {
        selectShopCard(card.id);
      }
    };

    return (
      <button
        key={card.id}
        onClick={handleClick}
        disabled={!canAfford}
        className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
          !canAfford
            ? "opacity-50 cursor-not-allowed"
            : isSelected
            ? "border-amber-400 ring-2 ring-amber-400 bg-amber-900/30 scale-105"
            : rarityStyle
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-bold ${rarityText}`}>{card.name}</h3>
          <span
            className={`text-xs px-2 py-1 rounded ${rarityText} bg-stone-900/50`}
          >
            {card.rarity}
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-1">
          {CLASS_CONFIGS[card.class].name}
        </p>
        <p className="text-stone-300 text-sm mb-3">{card.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-amber-400">⚡ Aggro: {card.aggro}</div>
          <div
            className={`text-sm font-bold flex items-center gap-1 ${
              canAfford ? "text-yellow-500" : "text-red-500"
            }`}
          >
            <Coins className="w-4 h-4" />
            {price}
          </div>
        </div>
      </button>
    );
  };

  const handleStandalonePurchase = () => {
    if (!standaloneSelectedCardId) return;
    const card = filteredCards.find((c) => c.id === standaloneSelectedCardId);
    if (card) {
      const success = purchaseCardForCollection(card);
      if (success) {
        setStandaloneSelectedCardId(null);
      }
    }
  };

  // Standalone mode: browsing all cards from title screen
  if (isStandaloneMode) {
    const standaloneSelectedCard = filteredCards.find((c) => c.id === standaloneSelectedCardId);
    const canAffordStandalone = standaloneSelectedCard
      ? currentGold >= getCardPrice(standaloneSelectedCard.rarity)
      : false;

    const classes: (ClassType | "all")[] = [
      "all", "warrior", "rogue", "paladin", "mage", "priest", "bard", "archer", "barbarian"
    ];
    const rarities: (Rarity | "all")[] = ["all", "common", "uncommon", "rare", "legendary"];

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
              <ShoppingCart className="w-10 h-10 text-amber-400" />
              <h1 className="text-4xl font-bold text-amber-100">Card Shop</h1>
            </div>
            <p className="text-stone-400 text-lg mb-2">
              Purchase cards to add to your collection
            </p>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-500">
              <Coins className="w-6 h-6" />
              {currentGold} gold
            </div>
            <p className="text-stone-500 text-sm mt-2">
              Owned cards: {userData?.ownedCards?.length ?? 0}
            </p>
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

          {/* Purchase Button (fixed at top when card selected) */}
          {standaloneSelectedCardId && canAffordStandalone && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleStandalonePurchase}
                className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Coins className="w-5 h-5" />
                Purchase {standaloneSelectedCard?.name} ({getCardPrice(standaloneSelectedCard!.rarity)} gold)
              </button>
            </div>
          )}

          {/* Card Count */}
          <div className="text-center mb-6 text-stone-400">
            Showing {filteredCards.length} cards
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCards.map((card) => renderCard(card, true))}
          </div>
        </div>
      </div>
    );
  }

  // In-game mode: after round completion
  if (!currentPlayer) {
    return null;
  }

  const selectedCard = shopCards.find((c) => c.id === selectedShopCardId);
  const canAfford = selectedCard
    ? currentGold >= getCardPrice(selectedCard.rarity)
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingCart className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-bold text-amber-100">Card Shop</h1>
          </div>
          <p className="text-stone-400 text-lg mb-2">
            <span style={{ color: classConfig?.color }} className="font-bold">
              {currentPlayer.name}
            </span>
            , purchase cards with your gold
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-500">
            <Coins className="w-6 h-6" />
            {currentPlayer.gold} gold
          </div>
        </div>

        {/* Card Options */}
        {shopCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {shopCards.map((card) => renderCard(card, false))}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-500">
            <p>No cards available in the shop.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          {selectedShopCardId && canAfford && (
            <button
              onClick={purchaseShopCard}
              className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Coins className="w-5 h-5" />
              Purchase ({getCardPrice(selectedCard!.rarity)} gold)
            </button>
          )}
          <button
            onClick={skipShop}
            className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold py-3 px-6 rounded-lg transition-all"
          >
            <SkipForward className="w-5 h-5" />
            Skip
          </button>
        </div>

        {/* Player Progress */}
        <div className="mt-8 text-center text-stone-500 text-sm">
          Player {shopPlayerIndex + 1} of{" "}
          {players.filter((p) => p.isAlive).length} alive heroes
        </div>
      </div>
    </div>
  );
}
