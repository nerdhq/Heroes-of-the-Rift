import { Heart, Shield } from "lucide-react";
import { ELITE_MODIFIERS } from "../../data/monsters";
import type { Monster, StatusEffect } from "../../types";
import { HealthBar } from "./HealthBar";

interface MonsterCardProps {
  monster: Monster;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (monsterId: string) => void;
}

export function MonsterCard({ monster, isSelectable = false, isSelected = false, onSelect }: MonsterCardProps) {
  const getStatusIcon = (type: StatusEffect["type"]): string => {
    const icons: Record<string, string> = {
      poison: "☠️",
      burn: "🔥",
      frost: "❄️",
      weakness: "💔",
      stun: "💫",
      stealth: "👁️",
      taunt: "🎯",
      strength: "💪",
      shield: "🛡️",
      block: "🚫",
      accuracy: "🎯",
      vulnerable: "🎯",
    };
    return icons[type] || "❓";
  };

  const getStatusDescription = (effect: StatusEffect): string => {
    const descriptions: Record<string, string> = {
      poison: `Poison: Takes ${effect.value} damage at end of turn`,
      burn: `Burn: Takes ${effect.value} damage at end of turn`,
      frost: `Frost: Takes ${effect.value} damage at end of turn`,
      weakness: `Weakness: Deals ${effect.value} less damage`,
      stun: `Stunned: Cannot act this turn`,
      stealth: `Stealth: Cannot be targeted by single-target attacks`,
      taunt: `Taunt: Forces enemies to target this character`,
      strength: `Strength: Deals +${effect.value} damage`,
      shield: `Shield: Absorbs ${effect.value} damage`,
      block: `Block: Immune to next ${effect.value} attacks`,
      accuracy: `Accuracy Penalty: ${effect.value}% chance to miss`,
      vulnerable: `Vulnerable: Takes ${effect.value} extra damage`,
    };
    return `${descriptions[effect.type] || effect.type} (${
      effect.duration
    } turns remaining)`;
  };

  const handleClick = () => {
    if (isSelectable && monster.isAlive && onSelect) {
      onSelect(monster.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 sm:p-5 rounded-xl border-2 transition-all relative ${
        monster.isAlive
          ? isSelected
            ? "border-purple-400 bg-purple-900/40 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30"
            : isSelectable
            ? "border-red-700 bg-red-950/30 cursor-pointer hover:border-purple-500 hover:bg-purple-900/20"
            : "border-red-700 bg-red-950/30"
          : "border-stone-700 bg-stone-800/30 opacity-50"
      }`}
    >
      {/* Target Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
          🎯 TARGET
        </div>
      )}
      {/* Monster Header */}
      <div className="text-center mb-1 sm:mb-3">
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
        <div className="flex justify-center">
          {monster.image ? (
            <img
              src={monster.image}
              alt={monster.name}
              className={`object-contain ${
                monster.name.includes("Dragon")
                  ? "w-28 h-28 sm:w-40 sm:h-40"
                  : "w-24 h-24 sm:w-36 sm:h-36"
              }`}
            />
          ) : (
            <span
              className={
                monster.name.includes("Dragon")
                  ? "text-5xl sm:text-6xl"
                  : "text-4xl sm:text-5xl"
              }
            >
              {monster.icon}
            </span>
          )}
        </div>
        <h2
          className={`font-bold ${
            monster.name.includes("Dragon")
              ? "text-lg sm:text-2xl text-orange-400"
              : monster.eliteModifier
              ? "text-base sm:text-xl"
              : "text-base sm:text-xl text-red-400"
          }`}
          style={
            monster.eliteModifier
              ? { color: ELITE_MODIFIERS[monster.eliteModifier].color }
              : {}
          }
        >
          {monster.name}
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm">Level {monster.level}</p>
      </div>

      {/* HP Bar */}
      <div className="mb-1 sm:mb-3">
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base mb-1">
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="text-red-400 font-bold">
            {monster.hp} / {monster.maxHp}
          </span>
          {monster.shield > 0 && (
            <>
              <Shield className="w-4 h-4 text-blue-400 ml-2" />
              <span className="text-blue-400 font-bold">{monster.shield}</span>
            </>
          )}
        </div>
        <HealthBar
          current={monster.hp}
          max={monster.maxHp}
          color="bg-red-600"
        />
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
        <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 bg-stone-900/50 rounded-lg border border-stone-600">
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
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
}
