import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { Heart, Shield, Skull, Zap, Target, HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";
import type { Card, Player, Monster, StatusEffect, Rarity } from "../types";

export function GameScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const turn = useGameStore((state) => state.turn);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const drawnCards = useGameStore((state) => state.drawnCards);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);
  const log = useGameStore((state) => state.log);
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);
  const confirmTarget = useGameStore((state) => state.confirmTarget);
  const rollAggro = useGameStore((state) => state.rollAggro);
  const needsTargetSelection = useGameStore(
    (state) => state.needsTargetSelection
  );
  const getTargetType = useGameStore((state) => state.getTargetType);

  const currentPlayer = players[currentPlayerIndex];
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();

  // Handler for confirm button - either go to target select or roll aggro
  const handleConfirmCard = () => {
    if (needsTarget) {
      // Check if there's only one valid target - auto-select it
      const validMonsters = monsters.filter((m) => m.isAlive);
      const validAllies = players.filter(
        (p) => p.isAlive && p.id !== currentPlayer?.id
      );

      if (targetType === "monster" && validMonsters.length === 1) {
        // Auto-select the only monster and skip target selection
        useGameStore.setState({ selectedTargetId: validMonsters[0].id });
        rollAggro();
      } else if (targetType === "ally" && validAllies.length === 1) {
        // Auto-select the only ally and skip target selection
        useGameStore.setState({ selectedTargetId: validAllies[0].id });
        rollAggro();
      } else {
        useGameStore.setState({ phase: "TARGET_SELECT" });
      }
    } else {
      rollAggro();
    }
  };

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

  const getStatusIcon = (type: StatusEffect["type"]): string => {
    const icons: Record<string, string> = {
      poison: "☠️",
      burn: "🔥",
      ice: "❄️",
      weakness: "💔",
      stun: "💫",
      stealth: "👁️",
      taunt: "🎯",
      strength: "💪",
      shield: "🛡️",
      block: "🚫",
    };
    return icons[type] || "❓";
  };

  const renderHealthBar = (current: number, max: number, color: string) => {
    const percentage = Math.max(0, (current / max) * 100);
    return (
      <div className="w-full h-3 bg-stone-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderPlayerCard = (player: Player, index: number) => {
    const config = CLASS_CONFIGS[player.class];
    const isCurrentPlayer = index === currentPlayerIndex;
    const totalAggro = player.baseAggro + player.diceAggro;

    return (
      <div
        key={player.id}
        className={`p-4 rounded-lg border-2 transition-all ${
          isCurrentPlayer
            ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30"
            : player.isAlive
            ? "border-stone-700 bg-stone-800/50"
            : "border-red-900 bg-red-950/30 opacity-60"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {player.class === "warrior" && "⚔️"}
              {player.class === "rogue" && "🗡️"}
              {player.class === "paladin" && "🛡️"}
              {player.class === "mage" && "🔮"}
              {player.class === "priest" && "✨"}
              {player.class === "bard" && "🎵"}
              {player.class === "archer" && "🏹"}
              {player.class === "barbarian" && "🪓"}
            </span>
            <div>
              <h3 className="font-bold text-base" style={{ color: config.color }}>
                {player.name}
              </h3>
              <p className="text-xs text-stone-500">{config.name}</p>
            </div>
          </div>
          {!player.isAlive && <Skull className="w-5 h-5 text-red-500" />}
        </div>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-red-400">
              <Heart className="w-3 h-3" />
              {player.hp}/{player.maxHp}
            </span>
            {player.shield > 0 && (
              <span className="flex items-center gap-1 text-blue-400">
                <Shield className="w-3 h-3" />
                {player.shield}
              </span>
            )}
          </div>
          {renderHealthBar(player.hp, player.maxHp, "bg-red-500")}
        </div>

        {/* Aggro - show for all players */}
        {totalAggro > 0 && (
          <div
            className={`text-sm mb-2 ${
              isCurrentPlayer ? "text-amber-400" : "text-amber-600"
            }`}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            Aggro: {totalAggro} {player.baseAggro > 0 && `(${player.baseAggro} base)`}
          </div>
        )}

        {/* Status Effects */}
        {(player.buffs.length > 0 || player.debuffs.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {player.buffs.map((buff, i) => (
              <span
                key={`buff-${i}`}
                className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded"
                title={`${buff.type}: ${buff.value} (${buff.duration} turns)`}
              >
                {getStatusIcon(buff.type)} {buff.duration}
              </span>
            ))}
            {player.debuffs.map((debuff, i) => (
              <span
                key={`debuff-${i}`}
                className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded"
                title={`${debuff.type}: ${debuff.value} (${debuff.duration} turns)`}
              >
                {getStatusIcon(debuff.type)} {debuff.duration}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMonster = (monster: Monster) => {
    return (
      <div
        key={monster.id}
        className={`p-5 rounded-xl border-2 transition-all ${
          monster.isAlive
            ? "border-red-700 bg-red-950/30"
            : "border-stone-700 bg-stone-800/30 opacity-50"
        }`}
      >
        {/* Monster Header */}
        <div className="text-center mb-3">
          <div
            className={`mb-2 ${
              monster.name === "Ancient Dragon" ? "text-6xl" : "text-5xl"
            }`}
          >
            {monster.name === "Goblin" && "👺"}
            {monster.name === "Skeleton" && "💀"}
            {monster.name === "Werewolf" && "🐺"}
            {monster.name === "Troll" && "👹"}
            {monster.name === "Vampire" && "🧛"}
            {monster.name === "Cerberus" && "🐕‍🦺"}
            {monster.name === "Dark Knight" && "🗡️"}
            {monster.name === "Orc Warlord" && "👹"}
            {monster.name === "Ancient Dragon" && "🐉"}
          </div>
          <h2
            className={`font-bold ${
              monster.name === "Ancient Dragon"
                ? "text-2xl text-orange-400"
                : "text-xl text-red-400"
            }`}
          >
            {monster.name}
          </h2>
          <p className="text-stone-500 text-sm">Level {monster.level}</p>
        </div>

        {/* HP Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-center gap-2 text-base mb-1">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-red-400 font-bold">
              {monster.hp} / {monster.maxHp}
            </span>
          </div>
          {renderHealthBar(monster.hp, monster.maxHp, "bg-red-600")}
        </div>

        {/* Status Effects */}
        {monster.debuffs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {monster.debuffs.map((debuff, i) => (
              <span
                key={`debuff-${i}`}
                className="text-sm bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full"
                title={`${debuff.type}: ${debuff.value} (${debuff.duration} turns)`}
              >
                {getStatusIcon(debuff.type)} {debuff.type} ({debuff.duration})
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCard = (card: Card, isSelectable: boolean) => {
    const isSelected = selectedCardId === card.id;
    const rarityStyle = getRarityColor(card.rarity);
    const rarityText = getRarityTextColor(card.rarity);
    // Show projected total aggro if this card is selected
    const projectedTotal = currentPlayer
      ? card.aggro + currentPlayer.diceAggro
      : card.aggro;

    return (
      <button
        key={card.id}
        onClick={() => isSelectable && selectCard(card.id)}
        disabled={!isSelectable}
        className={`p-4 rounded-xl border-2 transition-all transform text-left ${
          isSelectable ? "hover:scale-105 cursor-pointer" : "cursor-default"
        } ${
          isSelected
            ? "border-amber-400 ring-2 ring-amber-400 bg-amber-900/30"
            : rarityStyle
        }`}
      >
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
            {currentPlayer?.diceAggro > 0 && isSelected && (
              <span className="text-amber-300 ml-2">
                (Total: {projectedTotal})
              </span>
            )}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-3 overflow-hidden relative flex flex-col">
      {/* Help Button - Fixed position */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-3 right-3 z-10 bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
        title="Game Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 flex-1 w-full min-h-0">
        {/* Left Panel - Players */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1 min-h-0">
          <h2 className="text-lg font-bold text-amber-400">Party</h2>
          {players.map((player, index) => renderPlayerCard(player, index))}
        </div>

        {/* Center Panel - Battlefield */}
        <div className="col-span-6 flex flex-col h-full min-h-0">
          {/* Round & Turn Info */}
          <div className="text-center mb-3 flex justify-center gap-4">
            <span className="bg-amber-900/50 text-amber-300 px-4 py-2 rounded-full font-bold border border-amber-700">
              Round {round}/{maxRounds}
            </span>
            <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
              Turn {turn} - {phase.replace("_", " ")}
            </span>
          </div>

          {/* Monster Area - takes remaining space */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
            <div
              className={`grid gap-4 w-full ${
                monsters.length > 1
                  ? "grid-cols-2 max-w-2xl"
                  : "grid-cols-1 max-w-md"
              }`}
            >
              {monsters.map((monster) => renderMonster(monster))}
            </div>
          </div>

          {/* Hand Area - fixed at bottom */}
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
              <p className="text-stone-500 text-center py-4">
                Waiting for cards...
              </p>
            )}

            {/* Confirm Card Selection Button - simplified to single click */}
            {phase === "SELECT" && selectedCardId && (
              <div className="mt-3 text-center">
                <button
                  onClick={handleConfirmCard}
                  className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-900/50"
                >
                  {needsTarget &&
                  ((targetType === "monster" &&
                    monsters.filter((m) => m.isAlive).length > 1) ||
                    (targetType === "ally" &&
                      players.filter(
                        (p) => p.isAlive && p.id !== currentPlayer?.id
                      ).length > 1))
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
                    Select a {targetType === "ally" ? "ally" : "monster"} to
                    target
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {targetType === "monster" &&
                    monsters
                      .filter((m) => m.isAlive)
                      .map((monster) => (
                        <button
                          key={monster.id}
                          onClick={() => selectTarget(monster.id)}
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
                          onClick={() => selectTarget(player.id)}
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
                      onClick={confirmTarget}
                      className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
                    >
                      Confirm Target ✓
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Log */}
        <div className="col-span-3 flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-amber-400 mb-2">Battle Log</h2>
          <div className="flex-1 bg-stone-800/50 rounded-xl p-3 border border-stone-700 overflow-y-auto min-h-0">
            <div className="flex flex-col-reverse gap-1">
              {log
                .slice(-25)
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.id}
                    className={`text-sm p-2 rounded ${
                      entry.isSubEntry ? "ml-4 border-l-2 border-stone-600" : ""
                    } ${
                      entry.type === "damage"
                        ? "text-red-400 bg-red-900/20"
                        : entry.type === "heal"
                        ? "text-green-400 bg-green-900/20"
                        : entry.type === "buff"
                        ? "text-blue-400 bg-blue-900/20"
                        : entry.type === "debuff"
                        ? "text-purple-400 bg-purple-900/20"
                        : entry.type === "roll"
                        ? "text-amber-400 bg-amber-900/20"
                        : entry.type === "action"
                        ? "text-amber-200 bg-amber-900/10"
                        : "text-stone-400"
                    }`}
                  >
                    {entry.message}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
