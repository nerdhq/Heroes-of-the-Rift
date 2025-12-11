import type { StatusEffect } from "../../types";

interface StatusEffectsProps {
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
}

export function StatusEffects({ buffs, debuffs }: StatusEffectsProps) {
  if (buffs.length === 0 && debuffs.length === 0) {
    return null;
  }

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

  return (
    <div className="flex flex-wrap gap-1">
      {buffs.map((buff, i) => (
        <span
          key={`buff-${i}`}
          className="text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded cursor-help"
          title={getStatusDescription(buff)}
        >
          {getStatusIcon(buff.type)} {buff.duration}
        </span>
      ))}
      {debuffs.map((debuff, i) => (
        <span
          key={`debuff-${i}`}
          className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded cursor-help"
          title={getStatusDescription(debuff)}
        >
          {getStatusIcon(debuff.type)} {debuff.duration}
        </span>
      ))}
    </div>
  );
}
