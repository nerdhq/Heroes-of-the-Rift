import { useState } from "react";
import { Heart, Shield, Skull, Zap, BarChart3, Swords, Wind, Activity, Brain, Sparkles, Clover, Coins } from "lucide-react";
import { CLASS_CONFIGS } from "../../data/classes";
import type { Player, CharacterAttributes, StatusEffect } from "../../types";
import { HealthBar } from "./HealthBar";
import { StatusEffects } from "./StatusEffects";

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isTargeted: boolean;
}

// Stats tooltip component
function StatsTooltip({
  attributes,
  buffs,
  debuffs
}: {
  attributes: CharacterAttributes;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
}) {
  const stats = [
    { key: "STR", value: attributes.STR, icon: Swords, color: "text-red-400", bonus: `+${Math.round((attributes.STR - 10) * 3)}% phys` },
    { key: "AGI", value: attributes.AGI, icon: Wind, color: "text-yellow-400", bonus: `+${((attributes.AGI - 10) * 0.5).toFixed(1)}% dodge` },
    { key: "CON", value: attributes.CON, icon: Activity, color: "text-pink-400", bonus: `+${(attributes.CON - 10) * 2} HP` },
    { key: "INT", value: attributes.INT, icon: Brain, color: "text-blue-400", bonus: `+${Math.round((attributes.INT - 10) * 4)}% spell` },
    { key: "WIS", value: attributes.WIS, icon: Sparkles, color: "text-purple-400", bonus: `+${Math.round((attributes.WIS - 10) * 3.5)}% heal` },
    { key: "LCK", value: attributes.LCK, icon: Clover, color: "text-green-400", bonus: `${(5 + attributes.LCK * 0.5).toFixed(1)}% crit` },
  ];

  const getEffectIcon = (type: string) => {
    const icons: Record<string, string> = {
      poison: "🧪",
      burn: "🔥",
      frost: "❄️",
      stun: "💫",
      stealth: "👤",
      taunt: "🛡️",
      regen: "💚",
      strength: "💪",
      weakness: "📉",
      haste: "⚡",
      slow: "🐌",
      shield: "🛡️",
    };
    return icons[type] || "✨";
  };

  return (
    <div className="absolute top-full right-0 mt-2 z-50 pointer-events-none">
      <div className="bg-stone-900 border border-stone-600 rounded-lg p-4 shadow-xl min-w-[240px]">
        {/* Arrow */}
        <div className="absolute bottom-full right-3 border-8 border-transparent border-b-stone-600" />

        <div className="text-sm font-bold text-amber-400 mb-3">Character Stats</div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2">
          {stats.map(({ key, value, icon: Icon, color, bonus }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-white font-bold text-sm">{value}</span>
              <span className="text-stone-400 text-xs">{bonus}</span>
            </div>
          ))}
        </div>

        {/* Buffs */}
        {buffs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-700">
            <div className="text-sm font-bold text-green-400 mb-2">Buffs</div>
            <div className="space-y-1.5">
              {buffs.map((buff, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-green-300">
                    {getEffectIcon(buff.type)} {buff.type}
                  </span>
                  <span className="text-stone-400">
                    {buff.value > 0 && `+${buff.value}`} {buff.duration}t
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debuffs */}
        {debuffs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-700">
            <div className="text-sm font-bold text-red-400 mb-2">Debuffs</div>
            <div className="space-y-1.5">
              {debuffs.map((debuff, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-red-300">
                    {getEffectIcon(debuff.type)} {debuff.type}
                  </span>
                  <span className="text-stone-400">
                    {debuff.value > 0 && `-${debuff.value}`} {debuff.duration}t
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerCard({
  player,
  isCurrentPlayer,
  isTargeted,
}: PlayerCardProps) {
  const [showStats, setShowStats] = useState(false);
  const config = CLASS_CONFIGS[player.class];
  const totalAggro = player.baseAggro + player.diceAggro;

  // Guard against undefined config
  if (!config) return null;

  const getClassIcon = (playerClass: string) => {
    const icons: Record<string, string> = {
      fighter: "⚔️",
      rogue: "🗡️",
      paladin: "🛡️",
      mage: "🔮",
      cleric: "✨",
      bard: "🎵",
      archer: "🏹",
      barbarian: "🪓",
    };
    return icons[playerClass] || "❓";
  };

  return (
    <div
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
          <span className="text-2xl">{getClassIcon(player.class)}</span>
          <div>
            <h3 className="font-bold text-base" style={{ color: config.color }}>
              {player.name}
            </h3>
            <p className="text-xs text-stone-500">{config.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Gold display */}
          <div className="flex items-center gap-1 bg-yellow-900/40 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold border border-yellow-700/50">
            <Coins className="w-3 h-3" />
            {player.gold}
          </div>
          {/* Stats icon with hover tooltip */}
          {player.attributes && (
            <div
              className="relative"
              onMouseEnter={() => setShowStats(true)}
              onMouseLeave={() => setShowStats(false)}
            >
              <button className="p-1 rounded bg-stone-700/50 hover:bg-stone-600 transition-colors">
                <BarChart3 className="w-4 h-4 text-amber-400" />
              </button>
              {showStats && (
                <StatsTooltip
                  attributes={player.attributes}
                  buffs={player.buffs}
                  debuffs={player.debuffs}
                />
              )}
            </div>
          )}
          {!player.isAlive && <Skull className="w-5 h-5 text-red-500" />}
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-red-400">
            <Heart className="w-3 h-3" />
            {player.hp}/{player.maxHp}
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <Shield className="w-3 h-3" />
            {player.shield}
          </span>
        </div>
        <HealthBar current={player.hp} max={player.maxHp} color="bg-red-500" />
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

      {/* Mage Mana Bar (separate from Overflow for Empowered/Depowered) */}
      {player.class === "mage" && player.maxMana !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-cyan-400 font-medium">
              Mana {(player.mana ?? 0) >= (player.maxMana / 2) ? "(Empowered)" : "(Depowered)"}
            </span>
            <span className="text-stone-400">
              {player.mana ?? 0}/{player.maxMana}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                (player.mana ?? 0) >= (player.maxMana / 2)
                  ? "bg-cyan-400"
                  : "bg-cyan-700"
              }`}
              style={{
                width: `${((player.mana ?? 0) / player.maxMana) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Aggro */}
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
      <StatusEffects buffs={player.buffs} debuffs={player.debuffs} />
    </div>
  );
}
