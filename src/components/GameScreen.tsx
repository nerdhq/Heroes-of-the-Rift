import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { ELITE_MODIFIERS } from "../data/monsters";
import {
  Heart,
  Shield,
  Skull,
  Zap,
  Target,
  HelpCircle,
  Dice6,
  FastForward,
  Settings,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { HelpModal } from "./HelpModal";
import type {
  Card,
  Player,
  Monster,
  StatusEffect,
  Rarity,
  GameSpeed,
} from "../types";

export function GameScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
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
  const animation = useGameStore((state) => state.animation);
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);
  const confirmTarget = useGameStore((state) => state.confirmTarget);
  const startDiceRoll = useGameStore((state) => state.startDiceRoll);
  const needsTargetSelection = useGameStore(
    (state) => state.needsTargetSelection
  );
  const getTargetType = useGameStore((state) => state.getTargetType);

  const currentPlayer = players[currentPlayerIndex];
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();
  const setAnimation = useGameStore((state) => state.setAnimation);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const skipAnimations = useGameStore((state) => state.skipAnimations);
  const toggleSkipAnimations = useGameStore(
    (state) => state.toggleSkipAnimations
  );
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);

  // Special ability and enhancement
  const canUseSpecialAbility = useGameStore(
    (state) => state.canUseSpecialAbility
  );
  const canEnhanceCard = useGameStore((state) => state.canEnhanceCard);
  const useSpecialAbility = useGameStore((state) => state.useSpecialAbility);
  const setEnhanceMode = useGameStore((state) => state.setEnhanceMode);
  const enhanceMode = useGameStore((state) => state.enhanceMode);
  const setScreen = useGameStore((state) => state.setScreen);

  // Auto-scroll battle log to bottom when new entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]);

  // Clean up old action messages after they've been displayed
  useEffect(() => {
    if (animation.actionMessages.length === 0) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      const filtered = animation.actionMessages.filter(
        (msg) => now - msg.timestamp < 5000 // Keep messages for 5 seconds
      );
      if (filtered.length !== animation.actionMessages.length) {
        setAnimation({ actionMessages: filtered });
      }
    }, 1000);

    return () => clearInterval(cleanup);
  }, [animation.actionMessages, setAnimation]);

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
        startDiceRoll();
      } else if (targetType === "ally" && validAllies.length === 1) {
        // Auto-select the only ally and skip target selection
        useGameStore.setState({ selectedTargetId: validAllies[0].id });
        startDiceRoll();
      } else {
        useGameStore.setState({ phase: "TARGET_SELECT" });
      }
    } else {
      startDiceRoll();
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
      accuracy: "🎯",
    };
    return icons[type] || "❓";
  };

  const getStatusDescription = (effect: StatusEffect): string => {
    const descriptions: Record<string, string> = {
      poison: `Poison: Takes ${effect.value} damage at end of turn`,
      burn: `Burn: Takes ${effect.value} damage at end of turn`,
      ice: `Frost: Takes ${effect.value} damage at end of turn, slowed`,
      weakness: `Weakness: Deals ${effect.value} less damage`,
      stun: `Stunned: Cannot act this turn`,
      stealth: `Stealth: Cannot be targeted by single-target attacks`,
      taunt: `Taunt: Forces enemies to target this character`,
      strength: `Strength: Deals +${effect.value} damage`,
      shield: `Shield: Absorbs ${effect.value} damage`,
      block: `Block: Immune to next ${effect.value} attacks`,
      accuracy: `Accuracy Penalty: ${effect.value}% chance to miss`,
    };
    return `${descriptions[effect.type] || effect.type} (${
      effect.duration
    } turns remaining)`;
  };

  const renderHealthBar = (current: number, max: number, color: string) => {
    const percentage = Math.max(0, (current / max) * 100);
    const isLowHp = percentage <= 25 && percentage > 0;
    return (
      <div className="w-full h-3 bg-stone-700 rounded-full overflow-hidden">
        <div
          className={`h-full health-bar-fill ${color} ${
            isLowHp ? "animate-low-hp" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Calculate who has highest aggro (monster target)
  const getHighestAggroPlayer = () => {
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) return null;

    // Check for taunt first
    const tauntPlayer = alivePlayers.find((p) => p.hasTaunt);
    if (tauntPlayer) return tauntPlayer.id;

    // Otherwise highest aggro (excluding stealth)
    const visiblePlayers = alivePlayers.filter((p) => !p.isStealth);
    if (visiblePlayers.length === 0) return alivePlayers[0]?.id;

    return visiblePlayers.reduce((highest, p) => {
      const pAggro = p.baseAggro + p.diceAggro;
      const hAggro = highest.baseAggro + highest.diceAggro;
      return pAggro > hAggro ? p : highest;
    }, visiblePlayers[0])?.id;
  };

  const highestAggroPlayerId = getHighestAggroPlayer();

  const renderPlayerCard = (player: Player, index: number) => {
    const config = CLASS_CONFIGS[player.class];
    const isCurrentPlayer = index === currentPlayerIndex;
    const totalAggro = player.baseAggro + player.diceAggro;
    const isTargeted =
      player.id === highestAggroPlayerId &&
      player.isAlive &&
      monsters.some((m) => m.isAlive);

    return (
      <div
        key={player.id}
        className={`p-4 rounded-lg border-2 transition-all relative ${
          isCurrentPlayer
            ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30"
            : player.isAlive
            ? "border-stone-700 bg-stone-800/50"
            : "border-red-900 bg-red-950/30 opacity-60"
        } ${isTargeted ? "animate-target-pulse" : ""}`}
      >
        {/* Target indicator */}
        {isTargeted && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-intent">
            🎯 TARGET
          </div>
        )}
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
              <h3
                className="font-bold text-base"
                style={{ color: config.color }}
              >
                {player.name}
              </h3>
              <p className="text-xs text-stone-500">{config.name}</p>
            </div>
          </div>
          {!player.isAlive && <Skull className="w-5 h-5 text-red-500" />}
        </div>

        {/* HP Bar */}
        <div className="mb-2">
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

        {/* Resource Bar */}
        {player.maxResource > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: config.color }} className="font-medium">
                {config.resourceName}
              </span>
              <span className="text-stone-400">
                {player.resource}/{player.maxResource}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  player.resource >= player.maxResource
                    ? "animate-resource-glow"
                    : ""
                }`}
                style={{
                  width: `${(player.resource / player.maxResource) * 100}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Aggro - show for all players */}
        {totalAggro > 0 && (
          <div
            className={`text-sm mb-2 ${
              isCurrentPlayer ? "text-amber-400" : "text-amber-600"
            }`}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            Aggro: {totalAggro}{" "}
            {player.baseAggro > 0 && `(${player.baseAggro} base)`}
          </div>
        )}

        {/* Status Effects */}
        {(player.buffs.length > 0 || player.debuffs.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {player.buffs.map((buff, i) => (
              <span
                key={`buff-${i}`}
                className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded cursor-help"
                title={getStatusDescription(buff)}
              >
                {getStatusIcon(buff.type)} {buff.duration}
              </span>
            ))}
            {player.debuffs.map((debuff, i) => (
              <span
                key={`debuff-${i}`}
                className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded cursor-help"
                title={getStatusDescription(debuff)}
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
          {/* Elite Modifier Badge */}
          {monster.eliteModifier && (
            <div
              className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1"
              style={{
                backgroundColor:
                  ELITE_MODIFIERS[monster.eliteModifier].color + "33",
                color: ELITE_MODIFIERS[monster.eliteModifier].color,
                border: `1px solid ${
                  ELITE_MODIFIERS[monster.eliteModifier].color
                }`,
              }}
              title={ELITE_MODIFIERS[monster.eliteModifier].description}
            >
              {ELITE_MODIFIERS[monster.eliteModifier].icon}{" "}
              {ELITE_MODIFIERS[monster.eliteModifier].name}
            </div>
          )}
          <div className="mb-2 flex justify-center">
            {monster.image ? (
              <img
                src={monster.image}
                alt={monster.name}
                className={`object-contain ${
                  monster.name.includes("Dragon") ? "w-28 h-28" : "w-24 h-24"
                }`}
              />
            ) : (
              <span
                className={
                  monster.name.includes("Dragon") ? "text-6xl" : "text-5xl"
                }
              >
                {monster.icon}
              </span>
            )}
          </div>
          <h2
            className={`font-bold ${
              monster.name.includes("Dragon")
                ? "text-2xl text-orange-400"
                : monster.eliteModifier
                ? "text-xl"
                : "text-xl text-red-400"
            }`}
            style={
              monster.eliteModifier
                ? { color: ELITE_MODIFIERS[monster.eliteModifier].color }
                : {}
            }
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
            {monster.shield > 0 && (
              <>
                <Shield className="w-4 h-4 text-blue-400 ml-2" />
                <span className="text-blue-400 font-bold">
                  {monster.shield}
                </span>
              </>
            )}
          </div>
          {renderHealthBar(monster.hp, monster.maxHp, "bg-red-600")}
        </div>

        {/* Status Effects */}
        {monster.debuffs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {monster.debuffs.map((debuff, i) => (
              <span
                key={`debuff-${i}`}
                className="text-sm bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full cursor-help"
                title={getStatusDescription(debuff)}
              >
                {getStatusIcon(debuff.type)} {debuff.type} ({debuff.duration})
              </span>
            ))}
          </div>
        )}

        {/* Intent Preview */}
        {monster.isAlive && monster.intent && (
          <div className="mt-2 p-2 bg-stone-900/50 rounded-lg border border-stone-600">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="animate-intent">
                {monster.intent.damage > 0
                  ? "⚔️"
                  : monster.intent.debuff
                  ? "💀"
                  : "💨"}
              </span>
              <span className="text-stone-300 font-medium">
                {monster.intent.name}
              </span>
              {monster.intent.damage > 0 && (
                <span className="text-red-400 font-bold">
                  {monster.intent.damage} dmg
                </span>
              )}
              {monster.intent.target === "all" && (
                <span className="text-amber-400 text-xs">(AOE)</span>
              )}
              {monster.intent.debuff && (
                <span className="text-purple-400 text-xs">
                  +{monster.intent.debuff.type}
                </span>
              )}
            </div>
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
    const willBeEnhanced = enhanceMode && isSelected && canEnhanceCard();

    return (
      <button
        key={card.id}
        onClick={() => isSelectable && selectCard(card.id)}
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
        {/* Enhanced indicator */}
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
      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        {/* Speed Settings Button */}
        <button
          onClick={() => setShowSpeedSettings(!showSpeedSettings)}
          className={`bg-stone-800 hover:bg-stone-700 p-2 rounded-full border transition-colors ${
            gameSpeed !== "normal" || skipAnimations
              ? "text-green-400 border-green-600"
              : "text-amber-400 border-stone-600"
          }`}
          title="Speed Settings"
        >
          <FastForward className="w-5 h-5" />
        </button>

        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
          title="Game Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Quit Button */}
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="bg-stone-800 hover:bg-red-900 text-red-400 p-2 rounded-full border border-stone-600 hover:border-red-600 transition-colors"
          title="Quit Game"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Speed Settings Dropdown */}
      {showSpeedSettings && (
        <div className="absolute top-14 right-3 z-20 bg-stone-800 rounded-lg border border-stone-600 p-4 shadow-xl w-64">
          <div className="flex items-center gap-2 mb-3 text-amber-400">
            <Settings className="w-4 h-4" />
            <span className="font-bold">Speed Settings</span>
          </div>

          {/* Speed Options */}
          <div className="space-y-2 mb-4">
            <label className="text-stone-300 text-sm">Animation Speed</label>
            <div className="flex gap-1">
              {(["normal", "fast", "instant"] as GameSpeed[]).map((speed) => (
                <button
                  key={speed}
                  onClick={() => setGameSpeed(speed)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                    gameSpeed === speed
                      ? "bg-amber-600 text-amber-100"
                      : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                  }`}
                >
                  {speed === "normal" ? "1x" : speed === "fast" ? "2.5x" : "⚡"}
                </button>
              ))}
            </div>
          </div>

          {/* Skip Animations Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-stone-300 text-sm">Skip All Animations</span>
            <button
              onClick={toggleSkipAnimations}
              className={`w-12 h-6 rounded-full transition-colors ${
                skipAnimations ? "bg-green-600" : "bg-stone-600"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  skipAnimations ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <p className="text-stone-500 text-xs mt-3">
            Speed up combat animations for faster gameplay
          </p>
        </div>
      )}

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-stone-900 rounded-xl border-2 border-red-700 p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-900/50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-400">Quit Game?</h2>
            </div>

            {/* Message */}
            <p className="text-stone-300 mb-6">
              Are you sure you want to quit? All progress in this run will be
              lost and you'll return to the main menu.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 px-4 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg font-bold transition-colors border border-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  setScreen("title");
                }}
                className="flex-1 py-3 px-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors border border-red-600"
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 flex-1 w-full min-h-0">
        {/* Left Panel - Players */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1 min-h-0">
          <h2 className="text-lg font-bold text-amber-400">Party</h2>
          {players.map((player, index) => renderPlayerCard(player, index))}
        </div>

        {/* Center Panel - Battlefield */}
        <div className="col-span-6 flex flex-col h-full min-h-0">
          {/* Round & Turn Info */}
          <div className="text-center mb-2 flex justify-center gap-4">
            <span className="bg-amber-900/50 text-amber-300 px-4 py-2 rounded-full font-bold border border-amber-700">
              Round {round}/{maxRounds}
            </span>
            <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
              Turn {turn}
            </span>
          </div>

          {/* Phase Progress Indicator */}
          <div className="flex justify-center items-center gap-1 mb-3">
            {["DRAW", "SELECT", "AGGRO", "PLAYER_ACTION", "MONSTER_ACTION"].map(
              (p, i) => {
                const phases = [
                  "DRAW",
                  "SELECT",
                  "AGGRO",
                  "PLAYER_ACTION",
                  "MONSTER_ACTION",
                ];
                const currentIndex = phases.indexOf(phase);
                const isActive = p === phase;
                const isPast = i < currentIndex;
                const phaseLabels: Record<string, string> = {
                  DRAW: "Draw",
                  SELECT: "Select",
                  AGGRO: "Roll",
                  PLAYER_ACTION: "Attack",
                  MONSTER_ACTION: "Enemy",
                };
                return (
                  <div key={p} className="flex items-center">
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                        isActive
                          ? "bg-amber-500 text-stone-900 scale-110"
                          : isPast
                          ? "bg-green-700 text-green-100"
                          : "bg-stone-700 text-stone-400"
                      }`}
                    >
                      {phaseLabels[p]}
                    </div>
                    {i < phases.length - 1 && (
                      <div
                        className={`w-4 h-0.5 ${
                          isPast ? "bg-green-600" : "bg-stone-600"
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* Monster Area - takes remaining space, aligned to top */}
          <div className="flex-1 flex items-start justify-center min-h-0 overflow-y-auto pt-4">
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

            {/* Special Ability Button - when resource bar is full */}
            {phase === "SELECT" && canUseSpecialAbility() && currentPlayer && (
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
                    onClick={useSpecialAbility}
                    className="flex-1 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm"
                    title={
                      CLASS_CONFIGS[currentPlayer.class].specialAbility
                        .description
                    }
                  >
                    🌟 {CLASS_CONFIGS[currentPlayer.class].specialAbility.name}
                  </button>
                  <button
                    onClick={() => setEnhanceMode(!enhanceMode)}
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
                        CLASS_CONFIGS[currentPlayer.class].enhanceBonus
                          .damageBonus
                      } dmg, +${
                        CLASS_CONFIGS[currentPlayer.class].enhanceBonus
                          .healBonus
                      } heal, +${
                        CLASS_CONFIGS[currentPlayer.class].enhanceBonus
                          .shieldBonus
                      } shield)`
                    : CLASS_CONFIGS[currentPlayer.class].specialAbility
                        .description}
                </p>
              </div>
            )}

            {/* Confirm Card Selection Button - simplified to single click */}
            {phase === "SELECT" && selectedCardId && (
              <div className="mt-3 text-center">
                <button
                  onClick={handleConfirmCard}
                  className={`font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg ${
                    enhanceMode && canEnhanceCard()
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-amber-100 shadow-amber-900/50"
                      : "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 shadow-green-900/50"
                  }`}
                >
                  {enhanceMode && canEnhanceCard()
                    ? "Play Enhanced Card ✨"
                    : needsTarget &&
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
        <div className="col-span-3 flex flex-col min-h-0 mt-10">
          <h2 className="text-lg font-bold text-amber-400 mb-2">Battle Log</h2>
          <div
            ref={logContainerRef}
            className="flex-1 bg-stone-800/50 rounded-xl p-3 border border-stone-700 overflow-y-auto min-h-0"
          >
            <div className="flex flex-col gap-1">
              {log.slice(-25).map((entry) => (
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

      {/* Dice Roll Overlay */}
      {(animation.diceRolling || animation.diceRoll !== null) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-stone-800 rounded-2xl p-8 border-2 border-amber-500 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              <Dice6 className="w-6 h-6 inline mr-2" />
              Rolling for Aggro
            </h3>
            <div
              className={`text-7xl font-bold mb-4 ${
                animation.diceRolling
                  ? "animate-bounce text-amber-300"
                  : "text-green-400"
              }`}
            >
              {animation.diceRoll ?? "?"}
            </div>
            {!animation.diceRolling &&
              animation.diceRoll !== null &&
              currentPlayer && (
                <div className="text-center">
                  <p className="text-stone-300">
                    {currentPlayer.name} rolled a{" "}
                    <span className="text-amber-400 font-bold">
                      {animation.diceRoll}
                    </span>
                    !
                  </p>
                  <p className="text-lg text-amber-300 mt-2">
                    Total Aggro:{" "}
                    <span className="font-bold text-amber-400">
                      {currentPlayer.baseAggro + animation.diceRoll}
                    </span>
                    <span className="text-stone-400 text-sm ml-2">
                      ({currentPlayer.baseAggro} base + {animation.diceRoll}{" "}
                      roll)
                    </span>
                  </p>
                </div>
              )}
            {animation.diceRolling && (
              <p className="text-stone-400 animate-pulse">Rolling...</p>
            )}
          </div>
        </div>
      )}

      {/* Stacked Action Messages - new messages at bottom, old ones float up and fade */}
      {animation.actionMessages.length > 0 && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center gap-2">
          {animation.actionMessages.slice(-6).map((msg, index, arr) => {
            // Calculate age-based opacity for smooth fading
            const position = arr.length - 1 - index; // 0 = newest (bottom), higher = older (top)
            const fadeClass =
              position >= 4
                ? "opacity-30"
                : position >= 3
                ? "opacity-50"
                : position >= 2
                ? "opacity-70"
                : "";

            return (
              <div
                key={msg.id}
                className={`px-6 py-3 rounded-xl border-2 shadow-lg animate-message-slide-up transition-opacity duration-1000 ${fadeClass} ${
                  msg.type === "damage"
                    ? "bg-red-900/90 border-red-500 text-red-100"
                    : msg.type === "heal"
                    ? "bg-green-900/90 border-green-500 text-green-100"
                    : msg.type === "debuff"
                    ? "bg-purple-900/90 border-purple-500 text-purple-100"
                    : msg.type === "buff"
                    ? "bg-blue-900/90 border-blue-500 text-blue-100"
                    : msg.type === "roll"
                    ? "bg-amber-900/90 border-amber-500 text-amber-100"
                    : "bg-stone-900/90 border-amber-500 text-amber-100"
                }`}
              >
                <p className="text-xl font-bold whitespace-nowrap">
                  {msg.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Damage Numbers */}
      {animation.damageNumbers.map((dmg) => {
        // Find the target element position - for now, render centered on screen
        // In a more complex implementation, we'd track DOM positions
        const isPlayer = dmg.targetId.startsWith("player");
        return (
          <div
            key={dmg.id}
            className={`fixed z-50 pointer-events-none animate-damage-float font-bold text-3xl ${
              dmg.type === "damage"
                ? "text-red-500"
                : dmg.type === "heal"
                ? "text-green-500"
                : "text-blue-500"
            }`}
            style={{
              left: isPlayer ? "15%" : "60%",
              top: "40%",
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {dmg.type === "damage" ? "-" : "+"}
            {dmg.value}
          </div>
        );
      })}
    </div>
  );
}
