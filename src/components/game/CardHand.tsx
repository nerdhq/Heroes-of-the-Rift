import { Target } from "lucide-react";
import { CLASS_CONFIGS } from "../../data/classes";
import type { Card, Player, Monster, Rarity, GamePhase } from "../../types";

interface CardHandProps {
  currentPlayer: Player | undefined;
  drawnCards: Card[];
  phase: GamePhase;
  selectedCardId: string | null;
  selectedTargetId: string | null;
  enhanceMode: boolean;
  needsTarget: boolean;
  targetType: string | null;
  monsters: Monster[];
  players: Player[];
  canUseSpecialAbility: boolean;
  canEnhanceCard: boolean;
  onSelectCard: (cardId: string) => void;
  onSelectTarget: (targetId: string) => void;
  onConfirmCard: () => void;
  onConfirmTarget: () => void;
  onUseSpecialAbility: () => void;
  onToggleEnhanceMode: () => void;
}

export function CardHand({
  currentPlayer,
  drawnCards,
  phase,
  selectedCardId,
  selectedTargetId,
  enhanceMode,
  needsTarget,
  targetType,
  monsters,
  players,
  canUseSpecialAbility,
  canEnhanceCard,
  onSelectCard,
  onSelectTarget,
  onConfirmCard,
  onConfirmTarget,
  onUseSpecialAbility,
  onToggleEnhanceMode,
}: CardHandProps) {
  const getRarityColor = (rarity: Rarity): string => {
    const colors: Record<Rarity, string> = {
      common: "border-stone-500 bg-stone-800",
      uncommon: "border-green-500 bg-green-950/30",
      rare: "border-blue-500 bg-blue-950/30",
      legendary: "border-amber-500 bg-amber-950/30",
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

  const renderCard = (card: Card, isSelectable: boolean) => {
    const isSelected = selectedCardId === card.id;
    const rarityStyle = getRarityColor(card.rarity);
    const rarityText = getRarityTextColor(card.rarity);
    const projectedTotal = currentPlayer
      ? card.aggro + currentPlayer.diceAggro
      : card.aggro;
    const willBeEnhanced = enhanceMode && isSelected && canEnhanceCard;

    return (
      <button
        key={card.id}
        onClick={() => isSelectable && onSelectCard(card.id)}
        disabled={!isSelectable}
        className={`p-4 rounded-xl border-2 transition-all transform text-left relative ${
          isSelectable ? "hover:scale-105 cursor-pointer" : "cursor-default"
        } ${
          willBeEnhanced
            ? "border-amber-400 ring-2 ring-amber-400 bg-gradient-to-br from-amber-900/50 to-purple-900/50 animate-card-glow"
            : isSelected
            ? "border-amber-400 ring-2 ring-amber-400 bg-amber-900/30 animate-card-glow"
            : rarityStyle
        }`}
      >
        {willBeEnhanced && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
            ✨ ENHANCED
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-bold ${rarityText}`}>{card.name}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${rarityText} bg-stone-900/50`}
          >
            {card.rarity}
          </span>
        </div>
        <p className="text-stone-300 text-sm mb-2">{card.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-400">
            ⚡ Base: {card.aggro}
            {currentPlayer && currentPlayer.diceAggro > 0 && isSelected && (
              <span className="text-amber-300 ml-2">
                (Total: {projectedTotal})
              </span>
            )}
          </span>
        </div>
      </button>
    );
  };

  // Determine if we should show "Select Target" or "Play Card" button
  const showSelectTargetButton =
    needsTarget &&
    ((targetType === "monster" &&
      monsters.filter((m) => m.isAlive).length > 1) ||
      (targetType === "ally" &&
        players.filter((p) => p.isAlive && p.id !== currentPlayer?.id).length >
          1));

  return (
    <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700 mt-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-amber-100">
          {currentPlayer?.name}'s Hand
        </h3>
        {phase === "SELECT" && !selectedCardId && (
          <span className="text-amber-400 text-sm animate-pulse">
            Choose a card to play
          </span>
        )}
        {phase === "SELECT" && selectedCardId && (
          <span className="text-green-400 text-sm">
            Card selected - click Confirm
          </span>
        )}
      </div>

      {drawnCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {drawnCards.map((card) => renderCard(card, phase === "SELECT"))}
        </div>
      ) : (
        <p className="text-stone-500 text-center py-4">Waiting for cards...</p>
      )}

      {/* Special Ability Button */}
      {phase === "SELECT" && canUseSpecialAbility && currentPlayer && (
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 font-bold text-sm">
              ⚡ {CLASS_CONFIGS[currentPlayer.class].resourceName} Full!
            </span>
            <span className="text-purple-400 text-xs">
              Choose how to spend it:
            </span>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onUseSpecialAbility}
              className="flex-1 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm"
              title={
                CLASS_CONFIGS[currentPlayer.class].specialAbility.description
              }
            >
              🌟 {CLASS_CONFIGS[currentPlayer.class].specialAbility.name}
            </button>
            <button
              onClick={onToggleEnhanceMode}
              className={`flex-1 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm ${
                enhanceMode
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100"
                  : "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100"
              }`}
            >
              {enhanceMode ? "✨ Enhancing..." : "✨ Enhance Card"}
            </button>
          </div>
          <p className="text-purple-400/70 text-xs mt-2 text-center">
            {enhanceMode
              ? `Select a card to enhance (+${
                  CLASS_CONFIGS[currentPlayer.class].enhanceBonus.damageBonus
                } dmg, +${
                  CLASS_CONFIGS[currentPlayer.class].enhanceBonus.healBonus
                } heal, +${
                  CLASS_CONFIGS[currentPlayer.class].enhanceBonus.shieldBonus
                } shield)`
              : CLASS_CONFIGS[currentPlayer.class].specialAbility.description}
          </p>
        </div>
      )}

      {/* Confirm Card Selection Button */}
      {phase === "SELECT" && selectedCardId && (
        <div className="mt-3 text-center">
          <button
            onClick={onConfirmCard}
            className={`font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg ${
              enhanceMode && canEnhanceCard
                ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-100 shadow-amber-900/50"
                : "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 shadow-green-900/50"
            }`}
          >
            {enhanceMode && canEnhanceCard
              ? "Play Enhanced Card ✨"
              : showSelectTargetButton
              ? "Select Target →"
              : "Play Card ⚔️"}
          </button>
        </div>
      )}

      {/* Target Selection UI */}
      {phase === "TARGET_SELECT" && (
        <div className="mt-3 p-4 bg-purple-900/30 rounded-lg border border-purple-500">
          <div className="flex items-center gap-2 mb-3 text-purple-300">
            <Target className="w-5 h-5" />
            <span className="font-bold">
              Select a {targetType === "ally" ? "ally" : "monster"} to target
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {targetType === "monster" &&
              monsters
                .filter((m) => m.isAlive)
                .map((monster) => (
                  <button
                    key={monster.id}
                    onClick={() => onSelectTarget(monster.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedTargetId === monster.id
                        ? "border-purple-400 bg-purple-800/50 text-purple-100"
                        : "border-stone-600 bg-stone-700 text-stone-300 hover:border-purple-500"
                    }`}
                  >
                    {monster.name} ({monster.hp}/{monster.maxHp})
                  </button>
                ))}
            {targetType === "ally" &&
              players
                .filter((p) => p.isAlive && p.id !== currentPlayer?.id)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSelectTarget(player.id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedTargetId === player.id
                        ? "border-purple-400 bg-purple-800/50 text-purple-100"
                        : "border-stone-600 bg-stone-700 text-stone-300 hover:border-purple-500"
                    }`}
                  >
                    {player.name} ({player.hp}/{player.maxHp})
                  </button>
                ))}
          </div>
          {selectedTargetId && (
            <div className="mt-3 text-center">
              <button
                onClick={onConfirmTarget}
                className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
              >
                Confirm Target ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
