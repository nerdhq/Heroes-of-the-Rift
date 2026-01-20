import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { Trophy, Coins, Plus, ArrowRight, Skull } from "lucide-react";
import type { Card, Rarity } from "../types";

export function RoundCompleteScreen() {
  const players = useGameStore((state) => state.players);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const selectedClasses = useGameStore((state) => state.selectedClasses);
  const roundGoldEarned = useGameStore((state) => state.roundGoldEarned);
  const continueFromRoundComplete = useGameStore((state) => state.continueFromRoundComplete);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const getCurrentQuest = useGameStore((state) => state.getCurrentQuest);

  const quest = getCurrentQuest();
  const isCampaignMode = !!campaignProgress;

  // State for card selection - one card per player
  const [playerCardSelections, setPlayerCardSelections] = useState<Record<number, string | null>>({});

  const alivePlayers = players.filter((p) => p.isAlive);

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

  // Get available cards for a player (owned cards for their class that aren't already in their deck)
  const getAvailableCardsForPlayer = (playerIndex: number): Card[] => {
    const player = players[playerIndex];
    if (!player) return [];
    
    const playerClass = selectedClasses[playerIndex];
    
    // Check if this player is the active champion (first player in solo champion mode)
    const isChampionPlayer = 
      playerIndex === 0 && 
      activeChampion && 
      selectedClasses.length === 1 && 
      selectedClasses[0] === activeChampion.class;
    
    // Use champion's owned cards if playing as champion
    const ownedClassCards = isChampionPlayer
      ? activeChampion.ownedCards.filter((card: Card) => card.class === playerClass)
      : [];
    
    // Get card names already in player's deck
    const deckCardNames = new Set([
      ...player.deck.map((c) => c.name),
      ...player.discard.map((c) => c.name),
      ...player.hand.map((c) => c.name),
    ]);
    
    // Filter to cards not already in deck
    return ownedClassCards.filter((card) => !deckCardNames.has(card.name));
  };

  const handleSelectCard = (playerIndex: number, cardId: string) => {
    setPlayerCardSelections((prev) => ({
      ...prev,
      [playerIndex]: prev[playerIndex] === cardId ? null : cardId,
    }));
  };

  const handleContinue = () => {
    // Collect selected cards for each player
    const selections: Record<number, string> = {};
    for (const [playerIndexStr, cardId] of Object.entries(playerCardSelections)) {
      if (cardId) {
        selections[parseInt(playerIndexStr)] = cardId;
      }
    }
    continueFromRoundComplete(selections);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Campaign Info */}
          {isCampaignMode && activeCampaign && quest && (
            <div className="mb-4">
              <span className="text-stone-500 text-sm">{activeCampaign.name}</span>
              <span className="text-stone-600 mx-2">•</span>
              <span className="text-stone-400 text-sm">{quest.name}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-amber-400" />
            <h1 className="text-4xl font-bold text-amber-100">Round {round - 1} Complete!</h1>
          </div>
          <p className="text-stone-400 text-lg">
            {round <= maxRounds 
              ? `Prepare for Round ${round} of ${maxRounds}`
              : "Victory is near!"}
          </p>
          {/* Boss Round Warning */}
          {isCampaignMode && round === maxRounds && (
            <div className="mt-3 flex items-center justify-center gap-2 text-red-400">
              <Skull className="w-5 h-5" />
              <span className="font-semibold">Next round: Boss Fight!</span>
              <Skull className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Gold Earned */}
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Coins className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-bold text-yellow-300">+{roundGoldEarned} Gold Earned</span>
          </div>
          <p className="text-yellow-200/70">
            {activeChampion?.name || alivePlayers[0]?.name || "Party"}'s Gold: {alivePlayers[0]?.gold ?? 0}
          </p>
        </div>

        {/* Player Card Selection */}
        <div className="space-y-8">
          {alivePlayers.map((player) => {
            const playerIndex = players.findIndex((p) => p.id === player.id);
            const availableCards = getAvailableCardsForPlayer(playerIndex);
            const selectedCardId = playerCardSelections[playerIndex];
            const classConfig = CLASS_CONFIGS[player.class];
            if (!classConfig) return null;

            return (
              <div key={player.id} className="bg-stone-800/50 rounded-xl p-6 border border-stone-700">
                <div className="flex items-center gap-3 mb-4">
                  <Plus className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold" style={{ color: classConfig.color }}>
                    {player.name} - Add a Card to Deck
                  </h2>
                  <span className="text-stone-500 text-sm">
                    (Optional - {availableCards.length} cards available)
                  </span>
                </div>

                {availableCards.length === 0 ? (
                  <p className="text-stone-500 italic">
                    No additional cards available for this class. Purchase more from the Card Shop!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {availableCards.map((card) => {
                      const isSelected = selectedCardId === card.id;
                      return (
                        <button
                          key={card.id}
                          onClick={() => handleSelectCard(playerIndex, card.id)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? "border-green-400 ring-2 ring-green-400 bg-green-900/30"
                              : getRarityColor(card.rarity)
                          } hover:scale-105`}
                        >
                          <h3 className={`font-bold text-sm ${getRarityTextColor(card.rarity)}`}>
                            {card.name}
                          </h3>
                          <p className={`text-xs ${getRarityTextColor(card.rarity)} opacity-70`}>
                            {card.rarity}
                          </p>
                          <p className="text-stone-400 text-xs mt-1 line-clamp-2">
                            {card.description}
                          </p>
                          <div className="text-xs text-amber-400 mt-1">
                            ⚡ {card.aggro}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleContinue}
            className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-900/50 flex items-center gap-3 mx-auto"
          >
            Continue to Round {round}
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
