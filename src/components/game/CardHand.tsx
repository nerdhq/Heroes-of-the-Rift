import { Target, Check, Clock } from "lucide-react";
import { CLASS_CONFIGS } from "../../data/classes";
import type { Card, Player, Monster, Rarity, GamePhase } from "../../types";

interface PlayerSelection {
  playerId: string;
  cardId: string | null;
  targetId: string | null;
  isReady: boolean;
  enhanceMode: boolean;
}

interface CardHandProps {
  currentPlayer: Player | undefined;
  localPlayer: Player | undefined;
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
  isOnline: boolean;
  isLocalPlayerTurn: boolean;
  playerSelections: PlayerSelection[];
  localPlayerSelection: PlayerSelection | null | undefined;
  onSelectCard: (cardId: string) => void;
  onSelectTarget: (targetId: string) => void;
  onConfirmCard: () => void;
  onConfirmTarget: () => void;
  onUseSpecialAbility: () => void;
  onToggleEnhanceMode: () => void;
  onSetPlayerSelection: (playerId: string, cardId: string | null, targetId: string | null, enhanceMode?: boolean) => void;
  onSetPlayerReady: (playerId: string, isReady: boolean) => void;
}

export function CardHand({
  currentPlayer,
  localPlayer,
  phase,
  selectedCardId,
  selectedTargetId,
  enhanceMode,
  needsTarget,
  targetType,
  monsters: _monsters,
  players,
  canUseSpecialAbility,
  canEnhanceCard,
  isOnline,
  isLocalPlayerTurn,
  playerSelections,
  localPlayerSelection,
  onSelectCard,
  onSelectTarget,
  onConfirmCard: _onConfirmCard,
  onConfirmTarget,
  onUseSpecialAbility,
  onToggleEnhanceMode,
  onSetPlayerSelection,
  onSetPlayerReady,
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

  // For online simultaneous play
  const isSimultaneousMode = isOnline && phase === "SELECT";
  const localSelectedCardId = isSimultaneousMode ? localPlayerSelection?.cardId : selectedCardId;
  const localSelectedTargetId = isSimultaneousMode ? localPlayerSelection?.targetId : selectedTargetId;
  const localEnhanceMode = isSimultaneousMode ? localPlayerSelection?.enhanceMode : enhanceMode;
  const isLocalPlayerReady = localPlayerSelection?.isReady || false;

  // Handle card selection for simultaneous play
  const handleCardSelect = (cardId: string) => {
    if (isSimultaneousMode && localPlayer && !isLocalPlayerReady) {
      // Check if this card needs targeting
      const card = localPlayer.hand.find((c) => c.id === cardId);
      const needsTargeting = card?.effects.some((e) => e.target === "monster" || e.target === "ally");

      onSetPlayerSelection(localPlayer.id, cardId, null, localEnhanceMode);

      // Auto-ready if card doesn't need targeting
      if (!needsTargeting) {
        // Small delay to ensure selection is set first
        setTimeout(() => {
          onSetPlayerReady(localPlayer.id, true);
        }, 50);
      }
    } else if (!isOnline) {
      onSelectCard(cardId);
    }
  };

  // Handle target selection for simultaneous play
  const handleTargetSelect = (targetId: string) => {
    if (isSimultaneousMode && localPlayer && !isLocalPlayerReady) {
      onSetPlayerSelection(localPlayer.id, localSelectedCardId || null, targetId, localEnhanceMode);
    } else if (!isOnline) {
      onSelectTarget(targetId);
    }
  };

  // Handle unready (cancel)
  const handleUnready = () => {
    if (localPlayer) {
      onSetPlayerReady(localPlayer.id, false);
    }
  };

  // Handle enhance mode toggle for both modes
  const handleEnhanceToggle = () => {
    if (isSimultaneousMode && localPlayer) {
      // Online mode: update playerSelection.enhanceMode
      onSetPlayerSelection(localPlayer.id, localSelectedCardId || null, localSelectedTargetId || null, !localEnhanceMode);
    } else {
      // Offline mode: use the global toggle
      onToggleEnhanceMode();
    }
  };

  // Check if selected card needs target selection
  const getCardNeedsTarget = (cardId: string | null): boolean => {
    if (!cardId || !localPlayer) return false;
    const card = localPlayer.hand.find((c) => c.id === cardId);
    if (!card) return false;
    return card.effects.some((e) => e.target === "monster" || e.target === "ally");
  };

  const cardNeedsTarget = getCardNeedsTarget(localSelectedCardId || null);

  // Get target type for selected card
  const getSelectedCardTargetType = (): "ally" | "monster" | null => {
    if (!localSelectedCardId || !localPlayer) return null;
    const card = localPlayer.hand.find((c) => c.id === localSelectedCardId);
    if (!card) return null;
    for (const effect of card.effects) {
      if (effect.target === "monster") return "monster";
      if (effect.target === "ally") return "ally";
    }
    return null;
  };

  const selectedCardTargetType = getSelectedCardTargetType();

  const renderCard = (card: Card, isSelectable: boolean) => {
    const isSelected = localSelectedCardId === card.id;
    const rarityStyle = getRarityColor(card.rarity);
    const rarityText = getRarityTextColor(card.rarity);
    const projectedTotal = localPlayer
      ? card.aggro + localPlayer.diceAggro
      : card.aggro;
    const willBeEnhanced = localEnhanceMode && isSelected && canEnhanceCard;

    return (
      <button
        key={card.id}
        onClick={() => isSelectable && handleCardSelect(card.id)}
        disabled={!isSelectable || isLocalPlayerReady}
        className={`p-4 rounded-xl border-2 transition-all transform text-left relative ${
          isSelectable && !isLocalPlayerReady ? "hover:scale-105 cursor-pointer" : "cursor-default"
        } ${
          willBeEnhanced
            ? "border-amber-400 ring-2 ring-amber-400 bg-gradient-to-br from-amber-900/50 to-purple-900/50 animate-card-glow"
            : isSelected
            ? "border-amber-400 ring-2 ring-amber-400 bg-amber-900/30 animate-card-glow"
            : rarityStyle
        } ${isLocalPlayerReady ? "opacity-75" : ""}`}
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
            {localPlayer && localPlayer.diceAggro > 0 && isSelected && (
              <span className="text-amber-300 ml-2">
                (Total: {projectedTotal})
              </span>
            )}
          </span>
        </div>
      </button>
    );
  };


  // Cards to display - always show local player's hand
  const cardsToDisplay = localPlayer?.hand || [];

  // The player whose hand we're showing
  const displayPlayer = isOnline ? localPlayer : currentPlayer;

  // Can select cards in online simultaneous mode or offline when it's your turn
  const canSelectCards = isSimultaneousMode
    ? !isLocalPlayerReady
    : phase === "SELECT" && isLocalPlayerTurn;

  // Count ready players
  const readyCount = playerSelections.filter((sel) => sel.isReady).length;
  const totalPlayers = playerSelections.length;

  return (
    <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700 mt-3 flex-shrink-0 max-h-[50vh] overflow-hidden">
      {/* Header with ready status for online mode */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-amber-100">
          {displayPlayer?.name}'s Hand
        </h3>

        {/* Online simultaneous mode status */}
        {isSimultaneousMode && (
          <div className="flex items-center gap-3">
            {/* Ready count */}
            <div className="flex items-center gap-1 text-sm">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{readyCount}/{totalPlayers} Ready</span>
            </div>

            {/* Local player status */}
            {isLocalPlayerReady ? (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> You're ready!
              </span>
            ) : localSelectedCardId && cardNeedsTarget ? (
              <span className="text-amber-400 text-sm animate-pulse">
                Select a target above
              </span>
            ) : (
              <span className="text-amber-400 text-sm animate-pulse">
                Choose a card
              </span>
            )}
          </div>
        )}

        {/* Offline mode status */}
        {!isOnline && (
          <>
            {isLocalPlayerTurn && phase === "SELECT" && !selectedCardId && (
              <span className="text-amber-400 text-sm animate-pulse">
                Choose a card to play
              </span>
            )}
            {isLocalPlayerTurn && phase === "SELECT" && selectedCardId && (
              <span className="text-green-400 text-sm">
                Card selected - click Confirm
              </span>
            )}
          </>
        )}

        {/* Waiting for resolve */}
        {phase === "RESOLVE" && (
          <span className="text-purple-400 text-sm flex items-center gap-1">
            <Clock className="w-4 h-4 animate-spin" /> Resolving actions...
          </span>
        )}
      </div>

      {/* Player ready indicators for online mode */}
      {isSimultaneousMode && playerSelections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {playerSelections.map((sel) => {
            const player = players.find((p) => p.id === sel.playerId);
            if (!player) return null;
            return (
              <div
                key={sel.playerId}
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  sel.isReady
                    ? "bg-green-900/50 text-green-400 border border-green-500"
                    : sel.cardId
                    ? "bg-amber-900/50 text-amber-400 border border-amber-500"
                    : "bg-stone-700 text-stone-400 border border-stone-600"
                }`}
              >
                {sel.isReady ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {player.name}
              </div>
            );
          })}
        </div>
      )}

      {cardsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
          {cardsToDisplay.map((card) => renderCard(card, canSelectCards))}
        </div>
      ) : (
        <p className="text-stone-500 text-center py-4">
          {phase === "DRAW" ? "Drawing cards..." : "Your hand is empty"}
        </p>
      )}

      {/* Monster targeting hint for online mode */}
      {isSimultaneousMode && localSelectedCardId && cardNeedsTarget && selectedCardTargetType === "monster" && !isLocalPlayerReady && (
        <div className="mt-3 text-center">
          <div className="text-purple-300 font-medium animate-pulse">
            🎯 Click on a monster above to attack
          </div>
        </div>
      )}

      {/* Ally targeting for online mode (still needs buttons since allies aren't clickable in battlefield) */}
      {isSimultaneousMode && localSelectedCardId && cardNeedsTarget && selectedCardTargetType === "ally" && !isLocalPlayerReady && (
        <div className="mt-3 p-4 bg-purple-900/30 rounded-lg border border-purple-500">
          <div className="flex items-center gap-2 mb-3 text-purple-300">
            <Target className="w-5 h-5" />
            <span className="font-bold">Select an ally to target</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {players
              .filter((p) => p.isAlive)
              .map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    handleTargetSelect(player.id);
                    // Auto-ready after selecting ally target
                    if (localPlayer) {
                      setTimeout(() => onSetPlayerReady(localPlayer.id, true), 50);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    localSelectedTargetId === player.id
                      ? "border-purple-400 bg-purple-800/50 text-purple-100"
                      : "border-stone-600 bg-stone-700 text-stone-300 hover:border-purple-500"
                  }`}
                >
                  {player.name} ({player.hp}/{player.maxHp})
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Cancel button for online mode when ready */}
      {isSimultaneousMode && isLocalPlayerReady && (
        <div className="mt-3 text-center">
          <button
            onClick={handleUnready}
            className="bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-100 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Cancel ✕
          </button>
        </div>
      )}

      {/* Special Ability Button - works for both online and offline */}
      {phase === "SELECT" && canUseSpecialAbility && displayPlayer && !isLocalPlayerReady && (
        <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 font-bold text-sm">
              ⚡ {CLASS_CONFIGS[displayPlayer.class].resourceName} Full!
            </span>
            <span className="text-purple-400 text-xs">
              Choose how to spend it:
            </span>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onUseSpecialAbility}
              className="flex-1 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm"
              title={CLASS_CONFIGS[displayPlayer.class].specialAbility.description}
            >
              🌟 {CLASS_CONFIGS[displayPlayer.class].specialAbility.name}
            </button>
            <button
              onClick={handleEnhanceToggle}
              className={`flex-1 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm ${
                localEnhanceMode
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100"
                  : "bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100"
              }`}
            >
              {localEnhanceMode ? "✨ Enhancing..." : "✨ Enhance Card"}
            </button>
          </div>
          <p className="text-purple-400/70 text-xs mt-2 text-center">
            {localEnhanceMode
              ? `Select a card to enhance (+${
                  CLASS_CONFIGS[displayPlayer.class].enhanceBonus.damageBonus
                } dmg, +${
                  CLASS_CONFIGS[displayPlayer.class].enhanceBonus.healBonus
                } heal, +${
                  CLASS_CONFIGS[displayPlayer.class].enhanceBonus.shieldBonus
                } shield)`
              : CLASS_CONFIGS[displayPlayer.class].specialAbility.description}
          </p>
        </div>
      )}

      {/* Monster targeting hint - only shown when card is selected and needs monster target */}
      {!isOnline && phase === "SELECT" && isLocalPlayerTurn && selectedCardId && needsTarget && targetType === "monster" && (
        <div className="mt-3 text-center">
          <div className="text-purple-300 font-medium animate-pulse">
            🎯 Click on a monster above to attack
          </div>
        </div>
      )}

      {/* Target Selection UI - only for ally targeting in offline mode */}
      {!isOnline && phase === "TARGET_SELECT" && isLocalPlayerTurn && targetType === "ally" && (
        <div className="mt-3 p-4 bg-purple-900/30 rounded-lg border border-purple-500">
          <div className="flex items-center gap-2 mb-3 text-purple-300">
            <Target className="w-5 h-5" />
            <span className="font-bold">Select an ally to target</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {players
              .filter((p) => p.isAlive)
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
