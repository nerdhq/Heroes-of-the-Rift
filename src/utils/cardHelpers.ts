/**
 * Card-related utility functions
 */

import type { Card } from "../types";

/**
 * Get border and background color classes for a card based on rarity
 */
export function getRarityColor(rarity: Card["rarity"]): string {
  const colors: Record<Card["rarity"], string> = {
    common: "border-stone-500 bg-stone-800",
    uncommon: "border-green-500 bg-green-900/30",
    rare: "border-blue-500 bg-blue-900/30",
    legendary: "border-amber-500 bg-amber-900/30",
  };
  return colors[rarity];
}

/**
 * Get text color class for a card based on rarity
 */
export function getRarityTextColor(rarity: Card["rarity"]): string {
  const colors: Record<Card["rarity"], string> = {
    common: "text-stone-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    legendary: "text-amber-400",
  };
  return colors[rarity];
}

/**
 * Get the price for a card based on rarity
 */
export function getCardPrice(rarity: Card["rarity"]): number {
  const prices: Record<Card["rarity"], number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };
  return prices[rarity];
}

/**
 * Get a display name for the rarity
 */
export function getRarityDisplayName(rarity: Card["rarity"]): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Faith bonus tiers for Paladin cards
 */
export interface FaithBonuses {
  baseEffect: string;
  faith50Bonus: string | null;
  faith100Bonus: string | null;
}

/**
 * Parse a Paladin card description to extract faith bonuses
 * Format: "Base effect. Faith 50%: bonus. Faith 100%: bonus."
 */
export function parseFaithBonuses(description: string): FaithBonuses {
  // Match patterns like "Faith 50%: +3 damage" or "Faith 100%: +1 turn stun"
  const faith50Match = description.match(/Faith 50%:\s*([^.]+\.?)/i);
  const faith100Match = description.match(/Faith 100%:\s*([^.]+\.?)/i);

  // Base effect is everything before "Faith 50%" or the whole description
  let baseEffect = description;
  const faith50Index = description.toLowerCase().indexOf("faith 50%");
  if (faith50Index > 0) {
    baseEffect = description.substring(0, faith50Index).trim();
    // Remove trailing period if present
    if (baseEffect.endsWith(".")) {
      baseEffect = baseEffect.slice(0, -1);
    }
  }

  return {
    baseEffect,
    faith50Bonus: faith50Match ? faith50Match[1].trim() : null,
    faith100Bonus: faith100Match ? faith100Match[1].trim() : null,
  };
}

/**
 * Check if a card has faith scaling (Paladin cards with Faith bonuses)
 */
export function hasFaithScaling(description: string): boolean {
  return description.toLowerCase().includes("faith 50%") ||
         description.toLowerCase().includes("faith 100%");
}

/**
 * Get the current faith tier based on resource level
 * Paladin maxResource is 8, so: 0-3 = base, 4-7 = 50%, 8 = 100%
 */
export function getFaithTier(currentFaith: number, maxFaith: number): "base" | "50%" | "100%" {
  const percentage = (currentFaith / maxFaith) * 100;
  if (percentage >= 100) return "100%";
  if (percentage >= 50) return "50%";
  return "base";
}

/**
 * Get the card description for the current faith tier (for in-game display)
 * Shows only the applicable bonuses based on current faith level
 */
export function getCardDescriptionForFaith(
  description: string,
  currentFaith: number,
  maxFaith: number
): string {
  if (!hasFaithScaling(description)) {
    return description;
  }

  const bonuses = parseFaithBonuses(description);
  const tier = getFaithTier(currentFaith, maxFaith);

  let result = bonuses.baseEffect;

  if ((tier === "50%" || tier === "100%") && bonuses.faith50Bonus) {
    result += ` (+${bonuses.faith50Bonus})`;
  }

  if (tier === "100%" && bonuses.faith100Bonus) {
    result += ` (+${bonuses.faith100Bonus})`;
  }

  return result;
}

/**
 * Parsed Faith bonus effect
 */
export interface ParsedFaithBonus {
  type: "damage" | "shield" | "heal" | "stunDuration" | "cleanse" | "strength" | "weakness" | "burn" | "vulnerable" | "block" | "revivePercent";
  value?: number;
  target?: "self" | "ally" | "monster" | "allAllies" | "allMonsters";
  duration?: number;
}

/**
 * Parse a Faith bonus string like "+3 damage" or "+4 self heal" into structured data
 */
export function parseFaithBonusString(bonusStr: string): ParsedFaithBonus | null {
  const str = bonusStr.toLowerCase().trim();

  // Handle "+cleanse" (no value)
  if (str.includes("cleanse")) {
    return { type: "cleanse", target: "ally" };
  }

  // Handle "+Block for X turn"
  const blockMatch = str.match(/\+?block.*?(\d+)\s*turn/i);
  if (blockMatch || str.includes("block")) {
    const duration = blockMatch ? parseInt(blockMatch[1]) : 1;
    return { type: "block", value: 1, target: "self", duration };
  }

  // Handle revive percentage change like "Revive at 50% HP"
  const reviveMatch = str.match(/revive.*?(\d+)%/i);
  if (reviveMatch) {
    return { type: "revivePercent", value: parseInt(reviveMatch[1]) };
  }

  // Handle "+X turn stun" or "+X turn duration"
  const stunDurationMatch = str.match(/\+?(\d+)\s*turn.*?stun/i);
  if (stunDurationMatch) {
    return { type: "stunDuration", value: parseInt(stunDurationMatch[1]) };
  }

  // Handle debuff durations like "Weakness lasts 3 turns"
  const weaknessLasts = str.match(/weakness.*?(\d+)\s*turn/i);
  if (weaknessLasts) {
    return { type: "weakness", value: 0, duration: parseInt(weaknessLasts[1]) };
  }

  // Handle "+X Strength for Y turns"
  const strengthMatch = str.match(/\+?(\d+)\s*strength.*?(\d+)\s*turn/i);
  if (strengthMatch) {
    return { type: "strength", value: parseInt(strengthMatch[1]), duration: parseInt(strengthMatch[2]) };
  }

  // Handle numeric bonuses with type
  const numericMatch = str.match(/\+?(\d+)\s*(aoe\s+)?(\w+)/i);
  if (numericMatch) {
    const value = parseInt(numericMatch[1]);
    const isAoe = !!numericMatch[2];
    const typeStr = numericMatch[3];

    // Determine effect type
    let type: ParsedFaithBonus["type"] | null = null;
    let target: ParsedFaithBonus["target"] = undefined;

    if (typeStr.includes("damage")) {
      type = "damage";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("shield")) {
      type = "shield";
      // Check for "to all" or "AOE"
      if (str.includes("to all") || isAoe) {
        target = "allAllies";
      } else {
        target = str.includes("self") ? "self" : "ally";
      }
    } else if (typeStr.includes("heal")) {
      type = "heal";
      if (str.includes("aoe") || str.includes("to all") || isAoe) {
        target = "allAllies";
      } else if (str.includes("self")) {
        target = "self";
      } else {
        target = "ally";
      }
    } else if (typeStr.includes("weakness")) {
      type = "weakness";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("burn")) {
      type = "burn";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("vulnerable")) {
      type = "vulnerable";
      target = isAoe ? "allMonsters" : "monster";
    }

    if (type) {
      return { type, value, target };
    }
  }

  return null;
}

/**
 * Get the Faith bonuses that should be applied for a card at the current Faith level
 * Returns an array of parsed bonuses that should be applied
 */
export function getApplicableFaithBonuses(
  description: string,
  currentFaith: number,
  maxFaith: number
): ParsedFaithBonus[] {
  if (!hasFaithScaling(description)) {
    return [];
  }

  const bonuses = parseFaithBonuses(description);
  const tier = getFaithTier(currentFaith, maxFaith);
  const applicableBonuses: ParsedFaithBonus[] = [];

  // Apply 50% bonus if at 50% or higher Faith
  if ((tier === "50%" || tier === "100%") && bonuses.faith50Bonus) {
    const parsed = parseFaithBonusString(bonuses.faith50Bonus);
    if (parsed) {
      applicableBonuses.push(parsed);
    }
  }

  // Apply 100% bonus if at full Faith
  if (tier === "100%" && bonuses.faith100Bonus) {
    const parsed = parseFaithBonusString(bonuses.faith100Bonus);
    if (parsed) {
      applicableBonuses.push(parsed);
    }
  }

  return applicableBonuses;
}

// ============================================
// MAGE EMPOWERED/DEPOWERED SCALING
// ============================================

/**
 * Mage mana state bonuses
 */
export interface MageManaState {
  baseEffect: string;
  empoweredBonus: string | null;
  depoweredPenalty: string | null;
}

/**
 * Check if a card has Mage mana scaling (Empowered/Depowered)
 */
export function hasManaScaling(description: string): boolean {
  const lower = description.toLowerCase();
  return lower.includes("empowered:") || lower.includes("depowered:");
}

/**
 * Get the Mage mana tier based on current mana
 * Empowered: 5+ mana (50%+ of max 10)
 * Depowered: 0-4 mana (below 50%)
 * No neutral state - you're always either empowered or depowered
 */
export function getManaTier(currentMana: number, maxMana: number): "empowered" | "depowered" {
  const percentage = (currentMana / maxMana) * 100;
  if (percentage >= 50) return "empowered";
  return "depowered";
}

/**
 * Parse a Mage card description to extract mana bonuses
 * Format: "Base effect. Empowered: bonus. Depowered: penalty. [X mana]"
 */
export function parseManaModifiers(description: string): MageManaState {
  // Match patterns like "Empowered: +4 damage" or "Depowered: -4 damage"
  const empoweredMatch = description.match(/Empowered:\s*([^.]+\.?)/i);
  const depoweredMatch = description.match(/Depowered:\s*([^.]+\.?)/i);

  // Base effect is everything before "Empowered" or "Depowered" (whichever comes first)
  let baseEffect = description;
  const empoweredIndex = description.toLowerCase().indexOf("empowered:");
  const depoweredIndex = description.toLowerCase().indexOf("depowered:");
  const firstModifierIndex = empoweredIndex >= 0 && depoweredIndex >= 0
    ? Math.min(empoweredIndex, depoweredIndex)
    : empoweredIndex >= 0 ? empoweredIndex : depoweredIndex;

  if (firstModifierIndex > 0) {
    baseEffect = description.substring(0, firstModifierIndex).trim();
    // Remove trailing period if present
    if (baseEffect.endsWith(".")) {
      baseEffect = baseEffect.slice(0, -1);
    }
  }

  return {
    baseEffect,
    empoweredBonus: empoweredMatch ? empoweredMatch[1].trim() : null,
    depoweredPenalty: depoweredMatch ? depoweredMatch[1].trim() : null,
  };
}

/**
 * Parsed Mage mana modifier (bonus or penalty)
 */
export interface ParsedManaModifier {
  type: "damage" | "shield" | "heal" | "stun" | "stunDuration" | "burn" | "frost" | "frostDuration" | "vulnerable" | "weakness" | "missile";
  value: number; // Can be negative for penalties
  target?: "self" | "ally" | "monster" | "allAllies" | "allMonsters";
  duration?: number;
}

/**
 * Parse a single Mage mana modifier string like "+4 damage" or "Stun 1 turn" into structured data
 */
export function parseManaModifierString(modifierStr: string): ParsedManaModifier | null {
  const str = modifierStr.toLowerCase().trim();

  // Handle "+X missile" (for Magic Missile card)
  const missileMatch = str.match(/([+-]?\d+)\s*missile/i);
  if (missileMatch) {
    return { type: "missile", value: parseInt(missileMatch[1]) };
  }

  // Handle "Stun X turn" or "Stun for X turn" (new stun effect, not duration modifier)
  const stunNewMatch = str.match(/stun(?:\s+for)?\s+(\d+)\s*turn/i);
  if (stunNewMatch) {
    return { type: "stun", value: 1, duration: parseInt(stunNewMatch[1]), target: "allMonsters" };
  }

  // Handle "+X turn stun" (extend existing stun duration)
  const stunDurationMatch = str.match(/([+-]?\d+)\s*turn.*?stun/i);
  if (stunDurationMatch) {
    return { type: "stunDuration", value: parseInt(stunDurationMatch[1]) };
  }

  // Handle "extend Frost by X turn" or "+X turn frost"
  const frostDurationMatch = str.match(/extend\s+frost\s+(?:by\s+)?(\d+)\s*turn/i);
  if (frostDurationMatch) {
    return { type: "frostDuration", value: parseInt(frostDurationMatch[1]) };
  }
  const frostDurationMatch2 = str.match(/([+-]?\d+)\s*turn\s+frost/i);
  if (frostDurationMatch2) {
    return { type: "frostDuration", value: parseInt(frostDurationMatch2[1]) };
  }

  // Handle burn/tick changes like "+2 Burn/tick"
  const burnTickMatch = str.match(/([+-]?\d+)\s*burn\/tick/i);
  if (burnTickMatch) {
    return { type: "burn", value: parseInt(burnTickMatch[1]), duration: 0 }; // duration 0 = add to existing
  }

  // Handle ice/tick changes like "+1 Ice/tick"
  const iceTickMatch = str.match(/([+-]?\d+)\s*ice\/tick/i);
  if (iceTickMatch) {
    return { type: "frost", value: parseInt(iceTickMatch[1]), duration: 0 };
  }

  // Handle general numeric modifiers like "+4 damage" or "-4 AOE damage"
  const numericMatch = str.match(/([+-]?\d+)\s*(aoe\s+)?(\w+)/i);
  if (numericMatch) {
    const value = parseInt(numericMatch[1]);
    const isAoe = !!numericMatch[2];
    const typeStr = numericMatch[3];

    let type: ParsedManaModifier["type"] | null = null;
    let target: ParsedManaModifier["target"] = undefined;

    if (typeStr.includes("damage")) {
      type = "damage";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("shield")) {
      type = "shield";
      target = isAoe ? "allAllies" : "self";
    } else if (typeStr.includes("heal")) {
      type = "heal";
      target = isAoe ? "allAllies" : "self";
    } else if (typeStr.includes("burn")) {
      type = "burn";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("frost")) {
      type = "frost";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("vulnerable")) {
      type = "vulnerable";
      target = isAoe ? "allMonsters" : "monster";
    } else if (typeStr.includes("weakness")) {
      type = "weakness";
      target = isAoe ? "allMonsters" : "monster";
    }

    if (type) {
      return { type, value, target };
    }
  }

  return null;
}

/**
 * Parse multiple Mage mana modifiers from a comma-separated string
 * e.g., "Stun 1 turn, extend Frost by 1 turn" -> [stun modifier, frostDuration modifier]
 */
export function parseManaModifierStrings(modifierStr: string): ParsedManaModifier[] {
  const parts = modifierStr.split(",").map(s => s.trim()).filter(s => s.length > 0);
  const modifiers: ParsedManaModifier[] = [];

  for (const part of parts) {
    const parsed = parseManaModifierString(part);
    if (parsed) {
      modifiers.push(parsed);
    }
  }

  return modifiers;
}

/**
 * Get the card description for the current mana tier (for in-game display)
 * Depowered = base card only, Empowered = base + bonus
 */
export function getCardDescriptionForMana(
  description: string,
  currentMana: number,
  maxMana: number
): string {
  if (!hasManaScaling(description)) {
    return description;
  }

  const modifiers = parseManaModifiers(description);
  const tier = getManaTier(currentMana, maxMana);

  let result = modifiers.baseEffect;

  // Only show empowered bonus when empowered - depowered just uses base
  if (tier === "empowered" && modifiers.empoweredBonus) {
    result += ` (+${modifiers.empoweredBonus})`;
  }

  return result;
}

/**
 * Get the applicable mana modifier for a Mage card based on current mana
 * Returns null if depowered (base card only), bonus modifier if empowered
 * @deprecated Use getApplicableManaModifiers for multiple modifier support
 */
export function getApplicableManaModifier(
  description: string,
  currentMana: number,
  maxMana: number
): ParsedManaModifier | null {
  if (!hasManaScaling(description)) {
    return null;
  }

  const modifiers = parseManaModifiers(description);
  const tier = getManaTier(currentMana, maxMana);

  // Only return modifier when empowered - depowered uses base card only
  if (tier === "empowered" && modifiers.empoweredBonus) {
    return parseManaModifierString(modifiers.empoweredBonus);
  }

  return null;
}

/**
 * Get all applicable mana modifiers for a Mage card based on current mana
 * Returns empty array if depowered (base card only), bonus modifiers if empowered
 */
export function getApplicableManaModifiers(
  description: string,
  currentMana: number,
  maxMana: number
): ParsedManaModifier[] {
  if (!hasManaScaling(description)) {
    return [];
  }

  const modifiers = parseManaModifiers(description);
  const tier = getManaTier(currentMana, maxMana);

  // Only return modifiers when empowered - depowered uses base card only
  if (tier === "empowered" && modifiers.empoweredBonus) {
    return parseManaModifierStrings(modifiers.empoweredBonus);
  }

  return [];
}
