import type { GamePhase, LogEntry, Card, Player, Monster, Environment, EffectType, Effect, StatusEffect, CharacterAttributes, Champion } from "../types";
import { CLASS_CONFIGS } from "../data/classes";
import {
  BASE_STAT_VALUE,
  STR_DAMAGE_MULTIPLIER,
  INT_DAMAGE_MULTIPLIER,
  WIS_HEAL_MULTIPLIER,
  CON_SHIELD_MULTIPLIER,
  DURATION_BONUS_DIVISOR,
  MAX_HP_BONUS_MULTIPLIER,
  BASE_CRIT_CHANCE,
  CRIT_CHANCE_PER_LCK,
  BASE_CRIT_MULTIPLIER,
  CRIT_MULTIPLIER_PER_LCK,
  DODGE_CHANCE_PER_AGI,
  ACCURACY_MITIGATION_DIVISOR,
  DEFAULT_ATTRIBUTES,
  // Class-specific mechanics
  FIGHTER_PROC_CHANCE,
  FIGHTER_CRIT_MULTIPLIER,
  BARBARIAN_HP_THRESHOLD_75,
  BARBARIAN_HP_THRESHOLD_50,
  BARBARIAN_HP_THRESHOLD_25,
  BARBARIAN_DAMAGE_BONUS_75,
  BARBARIAN_DAMAGE_BONUS_50,
  BARBARIAN_DAMAGE_BONUS_25,
  ARCHER_CRIT_CHANCE_PER_AIM,
  ARCHER_MAX_AIM_CRIT_MULTIPLIER,
} from "../constants";

// ============================================
// STAT SCALING UTILITIES
// ============================================

// Re-export DEFAULT_ATTRIBUTES for backward compatibility
export { DEFAULT_ATTRIBUTES };

// Physical damage scaling: base * (1 + (STR-10) * multiplier)
export const calculateScaledDamage = (
  base: number,
  attrs: CharacterAttributes | undefined,
  isPhysical: boolean
): number => {
  if (!attrs) return base;
  const stat = isPhysical ? attrs.STR : attrs.INT;
  const scalingMultiplier = isPhysical ? STR_DAMAGE_MULTIPLIER : INT_DAMAGE_MULTIPLIER;
  const multiplier = 1 + (stat - BASE_STAT_VALUE) * scalingMultiplier;
  return Math.floor(base * multiplier);
};

// Healing scaling: base * (1 + (WIS-10) * multiplier)
export const calculateScaledHeal = (
  base: number,
  attrs: CharacterAttributes | undefined
): number => {
  if (!attrs) return base;
  const multiplier = 1 + (attrs.WIS - BASE_STAT_VALUE) * WIS_HEAL_MULTIPLIER;
  return Math.floor(base * multiplier);
};

// Shield scaling: base * (1 + (CON-10) * multiplier)
export const calculateScaledShield = (
  base: number,
  attrs: CharacterAttributes | undefined
): number => {
  if (!attrs) return base;
  const multiplier = 1 + (attrs.CON - BASE_STAT_VALUE) * CON_SHIELD_MULTIPLIER;
  return Math.floor(base * multiplier);
};

// Duration bonus from WIS: floor((WIS-10) / divisor)
export const calculateDurationBonus = (
  attrs: CharacterAttributes | undefined
): number => {
  if (!attrs) return 0;
  return Math.floor((attrs.WIS - BASE_STAT_VALUE) / DURATION_BONUS_DIVISOR);
};

// Calculate max HP bonus from CON: (CON-10) * multiplier
export const calculateMaxHpBonus = (
  attrs: CharacterAttributes | undefined
): number => {
  if (!attrs) return 0;
  return (attrs.CON - BASE_STAT_VALUE) * MAX_HP_BONUS_MULTIPLIER;
};

// Crit chance: base + (LCK * bonus per point)
// Returns multiplier if crit, 1 if not
export const rollCrit = (
  attrs: CharacterAttributes | undefined
): { isCrit: boolean; multiplier: number } => {
  if (!attrs) return { isCrit: false, multiplier: 1 };

  const critChance = BASE_CRIT_CHANCE + attrs.LCK * CRIT_CHANCE_PER_LCK;
  const critMultiplier = BASE_CRIT_MULTIPLIER + attrs.LCK * CRIT_MULTIPLIER_PER_LCK;

  if (Math.random() < critChance) {
    return { isCrit: true, multiplier: critMultiplier };
  }
  return { isCrit: false, multiplier: 1 };
};

// Dodge chance: (AGI-base) * chance per point
export const rollDodge = (
  attrs: CharacterAttributes | undefined
): boolean => {
  if (!attrs) return false;
  const dodgeChance = (attrs.AGI - BASE_STAT_VALUE) * DODGE_CHANCE_PER_AGI;
  return Math.random() < dodgeChance;
};

// Accuracy penalty mitigation from AGI
export const calculateAccuracyMitigation = (
  attrs: CharacterAttributes | undefined
): number => {
  if (!attrs) return 0;
  return Math.floor((attrs.AGI - BASE_STAT_VALUE) / ACCURACY_MITIGATION_DIVISOR);
};

// Determine if a card's damage is physical or magical based on class
export const isPhysicalDamageClass = (classType: Player["class"]): boolean => {
  const physicalClasses = ["fighter", "rogue", "barbarian", "archer"];
  return physicalClasses.includes(classType);
};

// ============================================
// DICE UTILITIES
// ============================================
export const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;
export const rollD6 = (): number => Math.floor(Math.random() * 6) + 1;

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

// ============================================
// LOG UTILITIES
// ============================================
export const formatDebuffMessage = (type: string): string => {
  const messages: Record<string, string> = {
    poison: "poisoned",
    burn: "burning",
    stun: "stunned",
    weakness: "weakened",
    ice: "frozen",
    accuracy: "blinded",
    disable: "silenced",
    bleed: "bleeding",
  };
  return messages[type] || `afflicted with ${type}`;
};

export const createLogEntry = (
  turn: number,
  phase: GamePhase,
  message: string,
  type: LogEntry["type"],
  isSubEntry: boolean = false
): LogEntry => ({
  id: generateId(),
  turn,
  phase,
  message,
  type,
  timestamp: Date.now(),
  isSubEntry,
});

// ============================================
// MONSTER UTILITIES
// ============================================
export const rollMonsterIntents = (monsters: Monster[]): Monster[] => {
  return monsters.map((monster) => {
    if (!monster.isAlive) return monster;
    const roll = rollD6();
    const ability =
      monster.abilities.find((a) => a.roll === roll) || monster.abilities[0];
    return { ...monster, intent: ability };
  });
};

// ============================================
// PLAYER UTILITIES
// ============================================
export const createPlayer = (
  id: string,
  name: string,
  classType: Player["class"],
  deck: Card[],
  champion?: Champion
): Player => {
  const config = CLASS_CONFIGS[classType];

  // Calculate HP bonus from champion attributes
  const hpBonus = champion ? calculateMaxHpBonus(champion.attributes) : 0;
  const maxHp = config.baseHp + hpBonus;

  return {
    id,
    name,
    class: classType,
    hp: maxHp,
    maxHp: maxHp,
    shield: 0,
    baseAggro: 0,
    diceAggro: 0,
    buffs: [],
    debuffs: [],
    deck: [...deck],
    discard: [],
    hand: [],
    resource: 0,
    maxResource: config.maxResource,
    gold: champion?.gold ?? 0,
    isAlive: true,
    isStealth: false,
    hasTaunt: false,
    isStunned: false,
    accuracyPenalty: 0,
    // Champion link
    championId: champion?.id,
    attributes: champion?.attributes,
    // Bard-specific: start with no active song
    bardSongType: classType === "bard" ? null : undefined,
    // Cleric-specific: start in Judgment mode
    clericMode: classType === "cleric" ? "judgment" : undefined,
    // Mage-specific: separate mana pool for Empowered/Depowered scaling
    mana: classType === "mage" ? 0 : undefined,
    maxMana: classType === "mage" ? 10 : undefined,
  };
};

export const distributeGold = (
  players: Player[],
  goldAmount: number
): { players: Player[]; message: string } => {
  const alivePlayers = players.filter((p) => p.isAlive);
  if (alivePlayers.length === 0) {
    return { players, message: "" };
  }

  const goldPerPlayer = Math.floor(goldAmount / alivePlayers.length);
  const updatedPlayers = players.map((player) => {
    if (player.isAlive) {
      return { ...player, gold: player.gold + goldPerPlayer };
    }
    return player;
  });

  const message =
    alivePlayers.length > 1
      ? `Each hero receives ${goldPerPlayer} gold!`
      : `${alivePlayers[0].name} receives ${goldPerPlayer} gold!`;

  return { players: updatedPlayers, message };
};

// Distribute XP to players with champions (returns XP amounts for store to apply)
export const calculateXPDistribution = (
  players: Player[],
  xpAmount: number
): { championXP: Map<string, number>; message: string } => {
  const alivePlayers = players.filter((p) => p.isAlive && p.championId);
  const championXP = new Map<string, number>();

  if (alivePlayers.length === 0) {
    return { championXP, message: "" };
  }

  const xpPerPlayer = Math.floor(xpAmount / alivePlayers.length);

  for (const player of alivePlayers) {
    if (player.championId) {
      championXP.set(player.championId, xpPerPlayer);
    }
  }

  const message =
    alivePlayers.length > 1
      ? `Each hero earns ${xpPerPlayer} XP!`
      : `${alivePlayers[0].name} earns ${xpPerPlayer} XP!`;

  return { championXP, message };
};

// ============================================
// ARRAY UTILITIES
// ============================================
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Seeded random number generator for deterministic shuffling
export const seededRandom = (seed: string): (() => number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
};

// Shuffle array with a seed for deterministic results
export const seededShuffleArray = <T>(array: T[], seed: string): T[] => {
  const shuffled = [...array];
  const random = seededRandom(seed);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================
// ENVIRONMENT UTILITIES
// ============================================
export const applyEnvironmentModifier = (
  value: number,
  effectType: EffectType,
  environment: Environment | null
): number => {
  if (!environment || !environment.effects || value === 0) return value;

  let modifier = 1.0;

  for (const envEffect of environment.effects) {
    switch (envEffect.type) {
      case "frostBonus":
        if (effectType === "frost") {
          modifier *= envEffect.value;
        }
        break;
      case "fireBonus":
        if (effectType === "burn") {
          modifier *= envEffect.value;
        }
        break;
      case "poisonBonus":
        if (effectType === "poison") {
          modifier *= envEffect.value;
        }
        break;
      case "healingBonus":
        if (effectType === "heal") {
          modifier *= envEffect.value;
        }
        break;
      case "damageBonus":
        if (effectType === "damage") {
          modifier *= envEffect.value;
        }
        break;
      case "shieldBonus":
        if (effectType === "shield") {
          modifier *= envEffect.value;
        }
        break;
    }
  }

  return Math.floor(value * modifier);
};

// ============================================
// CARD UTILITIES
// ============================================
export const getRarityWeight = (rarity: Card["rarity"]): number => {
  const weights = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 5,
  };
  return weights[rarity];
};

export const getCardPrice = (rarity: Card["rarity"]): number => {
  const prices = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };
  return prices[rarity];
};

export const selectWeightedRandomCards = (cards: Card[], count: number): Card[] => {
  const selected: Card[] = [];
  const available = [...cards];

  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce(
      (sum, card) => sum + getRarityWeight(card.rarity),
      0
    );

    let random = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let i = 0; i < available.length; i++) {
      random -= getRarityWeight(available[i].rarity);
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    selected.push(available[selectedIndex]);
    available.splice(selectedIndex, 1);
  }

  return selected;
};

// Select cards for deck building: only common/uncommon, with 50% chance of including a rare
export const selectDeckBuildingCards = (cards: Card[], count: number): Card[] => {
  // Filter to only common and uncommon cards
  const commonUncommon = cards.filter(
    (card) => card.rarity === "common" || card.rarity === "uncommon"
  );
  
  // 50% chance to include a rare card
  const includeRare = Math.random() < 0.5;
  const rareCards = cards.filter((card) => card.rarity === "rare");
  
  const selected: Card[] = [];
  const available = [...commonUncommon];
  
  // If we're including a rare and there are rare cards available, add one first
  if (includeRare && rareCards.length > 0) {
    const randomRareIndex = Math.floor(Math.random() * rareCards.length);
    selected.push(rareCards[randomRareIndex]);
  }
  
  // Fill the rest with common/uncommon cards using weighted selection
  while (selected.length < count && available.length > 0) {
    const totalWeight = available.reduce(
      (sum, card) => sum + getRarityWeight(card.rarity),
      0
    );

    let random = Math.random() * totalWeight;

    let selectedIndex = 0;
    for (let i = 0; i < available.length; i++) {
      random -= getRarityWeight(available[i].rarity);
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    selected.push(available[selectedIndex]);
    available.splice(selectedIndex, 1);
  }

  return selected;
};

// ============================================
// APPLY EFFECT HELPER
// ============================================
export function applyEffect(
  effect: Effect,
  caster: Player,
  players: Player[],
  monsters: Monster[],
  turn: number,
  selectedTargetId: string | null = null,
  environment: Environment | null = null
): { players: Player[]; monsters: Monster[]; logs: LogEntry[]; xpEarned: Map<string, number> } {
  const logs: LogEntry[] = [];
  let updatedPlayers = [...players];
  const updatedMonsters = [...monsters];
  const xpEarned = new Map<string, number>();

  const getTargets = (): Player[] => {
    switch (effect.target) {
      case "self":
        return [caster];
      case "ally":
        if (selectedTargetId) {
          const target = updatedPlayers.find(
            (p) => p.id === selectedTargetId && p.isAlive
          );
          return target ? [target] : [];
        }
        return updatedPlayers
          .filter((p) => p.isAlive && p.id !== caster.id)
          .slice(0, 1);
      case "lowestAlly":
        // Target the ally with the lowest HP (including self)
        const aliveAllies = updatedPlayers.filter((p) => p.isAlive);
        if (aliveAllies.length === 0) return [];
        const lowestHpAlly = aliveAllies.reduce((lowest, p) =>
          (p.hp / p.maxHp) < (lowest.hp / lowest.maxHp) ? p : lowest
        );
        return [lowestHpAlly];
      case "allAllies":
        return updatedPlayers.filter((p) => p.isAlive);
      default:
        return [];
    }
  };

  const getMonsterTargets = (): Monster[] => {
    switch (effect.target) {
      case "monster":
        if (selectedTargetId) {
          const target = updatedMonsters.find(
            (m) => m.id === selectedTargetId && m.isAlive
          );
          return target ? [target] : [];
        }
        return updatedMonsters.filter((m) => m.isAlive).slice(0, 1);
      case "allMonsters":
        return updatedMonsters.filter((m) => m.isAlive);
      default:
        return [];
    }
  };

  switch (effect.type) {
    case "damage": {
      // Check if this damage effect requires stealth
      if (effect.stealthOnly) {
        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);
        if (!currentCaster?.isStealth) {
          // Skip this damage effect if not stealthed
          break;
        }
      }

      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        let damage = effect.value || 0;

        // Apply stat scaling based on class type
        const isPhysical = isPhysicalDamageClass(caster.class);
        damage = calculateScaledDamage(damage, caster.attributes, isPhysical);

        damage = applyEnvironmentModifier(damage, "damage", environment);

        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);

        // ============================================
        // BARBARIAN - Blood Frenzy HP scaling
        // Lower HP = more damage
        // ============================================
        if (currentCaster?.class === "barbarian") {
          const hpPercent = currentCaster.hp / currentCaster.maxHp;
          let bloodFrenzyBonus = 0;
          let bloodFrenzyTier = "";

          if (hpPercent <= BARBARIAN_HP_THRESHOLD_25) {
            bloodFrenzyBonus = BARBARIAN_DAMAGE_BONUS_25; // +100%
            bloodFrenzyTier = "MAXIMUM";
          } else if (hpPercent <= BARBARIAN_HP_THRESHOLD_50) {
            bloodFrenzyBonus = BARBARIAN_DAMAGE_BONUS_50; // +50%
            bloodFrenzyTier = "HIGH";
          } else if (hpPercent <= BARBARIAN_HP_THRESHOLD_75) {
            bloodFrenzyBonus = BARBARIAN_DAMAGE_BONUS_75; // +25%
            bloodFrenzyTier = "RISING";
          }

          if (bloodFrenzyBonus > 0) {
            const bonusDamage = Math.floor(damage * bloodFrenzyBonus);
            damage += bonusDamage;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Blood Frenzy (${bloodFrenzyTier})! ${caster.name} deals +${Math.round(bloodFrenzyBonus * 100)}% damage (+${bonusDamage})!`,
                "buff",
                true
              )
            );
          }
        }

        // NOTE: Paladin Faith bonuses are card-specific and applied via applyFaithBonuses()
        // See cardHelpers.ts for parsing logic

        const strengthBuff = currentCaster?.buffs.find(
          (b) => b.type === "strength"
        );
        if (strengthBuff) {
          if (strengthBuff.isPercentage) {
            // Percentage-based strength (e.g., +50% damage)
            const bonusDamage = Math.floor(damage * (strengthBuff.value / 100));
            damage += bonusDamage;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name}'s damage buff adds +${strengthBuff.value}% (+${bonusDamage}) damage!`,
                "buff",
                true
              )
            );
          } else {
            // Flat strength bonus
            damage += strengthBuff.value;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name}'s strength buff adds +${strengthBuff.value} damage!`,
                "buff",
                true
              )
            );
          }
        }

        // ============================================
        // ROGUE - Stealth damage bonus (card-specific)
        // Uses stealthBonus from effect if available, otherwise 50%
        // ============================================
        if (currentCaster?.class === "rogue" && currentCaster.isStealth) {
          // Check for card-specific stealth bonus
          const cardStealthBonus = effect.stealthBonus;
          if (cardStealthBonus !== undefined) {
            damage += cardStealthBonus;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Sneak Attack! ${caster.name} deals +${cardStealthBonus} bonus damage from stealth!`,
                "damage",
                true
              )
            );
          } else {
            // Default 50% stealth bonus for cards without specific bonus
            const stealthBonus = Math.floor(damage * 0.5);
            damage += stealthBonus;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Sneak Attack! ${caster.name} deals +${stealthBonus} bonus damage from stealth!`,
                "damage",
                true
              )
            );
          }
        }

        // ============================================
        // CONDITIONAL BONUSES - Stun, Burn, Frost
        // ============================================
        // Stun bonus (Rogue cards: +damage if target stunned)
        if (effect.stunBonus && monster.debuffs.some(d => d.type === "stun")) {
          damage += effect.stunBonus;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${caster.name} exploits the stunned enemy for +${effect.stunBonus} bonus damage!`,
              "damage",
              true
            )
          );
        }

        // Burn bonus (Mage cards: +damage if target has Burn)
        if (effect.burnBonus && monster.debuffs.some(d => d.type === "burn")) {
          damage += effect.burnBonus;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Combustion! ${caster.name} deals +${effect.burnBonus} bonus damage to burning enemy!`,
              "damage",
              true
            )
          );
        }

        // Frost bonus (Mage cards: +damage if target has Frost)
        if (effect.frostBonus && monster.debuffs.some(d => d.type === "frost")) {
          damage += effect.frostBonus;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Shatter! ${caster.name} deals +${effect.frostBonus} bonus damage to frozen enemy!`,
              "damage",
              true
            )
          );
        }

        // Double damage if target has specific debuff (e.g., Shattering Lance)
        if (effect.doubleDamageIfDebuff) {
          const hasDebuff = monster.debuffs.some(d => d.type === effect.doubleDamageIfDebuff);
          if (hasDebuff) {
            damage *= 2;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name}'s attack doubles damage against ${effect.doubleDamageIfDebuff}ed enemy!`,
                "damage",
                true
              )
            );
            // Consume the debuff if specified
            if (effect.consumeDebuff) {
              updatedMonsters[idx] = {
                ...updatedMonsters[idx],
                debuffs: updatedMonsters[idx].debuffs.filter(d => d.type !== effect.doubleDamageIfDebuff),
              };
              logs.push(
                createLogEntry(
                  turn,
                  "PLAYER_ACTION",
                  `The ${effect.doubleDamageIfDebuff} effect is consumed!`,
                  "debuff",
                  true
                )
              );
            }
          }
        }

        // ============================================
        // CRIT CALCULATION - Class-specific mechanics
        // ============================================
        let isCrit = false;
        let critMultiplier = 1;

        // Archer - Aim-based crit (+10% per Aim stack, guaranteed 2.5x at 5)
        if (currentCaster?.class === "archer") {
          const aimStacks = currentCaster.resource || 0;
          if (aimStacks >= 5) {
            // Guaranteed empowered crit at max Aim
            isCrit = true;
            critMultiplier = ARCHER_MAX_AIM_CRIT_MULTIPLIER;
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Perfect Shot! ${caster.name}'s maximum Aim guarantees a ${critMultiplier}x critical hit!`,
                "damage",
                true
              )
            );
            // Reset Aim after empowered attack
            const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
            if (casterIdx !== -1) {
              updatedPlayers[casterIdx] = {
                ...updatedPlayers[casterIdx],
                resource: 0,
              };
            }
          } else {
            // Normal crit chance based on Aim stacks
            const aimCritChance = aimStacks * ARCHER_CRIT_CHANCE_PER_AIM;
            const baseCrit = rollCrit(caster.attributes);
            const totalCritChance = aimCritChance + (baseCrit.isCrit ? 1 : (BASE_CRIT_CHANCE + (caster.attributes?.LCK || 0) * CRIT_CHANCE_PER_LCK));

            if (Math.random() < totalCritChance) {
              isCrit = true;
              critMultiplier = 2.0; // Standard Archer crit
            }
          }
        }
        // Fighter - Disciplined Strikes (10% crit chance as part of passive)
        else if (currentCaster?.class === "fighter") {
          // Fighter has separate 10% crit from passive, plus normal LCK-based crit
          const fighterCrit = Math.random() < FIGHTER_PROC_CHANCE;
          const lckCrit = rollCrit(caster.attributes);

          if (fighterCrit || lckCrit.isCrit) {
            isCrit = true;
            critMultiplier = fighterCrit ? FIGHTER_CRIT_MULTIPLIER : lckCrit.multiplier;
          }
        }
        // Default - LCK-based crit
        else {
          const critResult = rollCrit(caster.attributes);
          if (critResult.isCrit) {
            isCrit = true;
            critMultiplier = critResult.multiplier;
          }
        }

        if (isCrit) {
          damage = Math.floor(damage * critMultiplier);
          if (currentCaster?.class !== "archer" || (currentCaster?.resource || 0) < 5) {
            // Don't double-log for Archer Perfect Shot
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Critical hit! ${caster.name}'s damage is multiplied by ${critMultiplier.toFixed(2)}x!`,
                "damage",
                true
              )
            );
          }
        }

        // Apply accuracy penalty with AGI mitigation
        const currentAccuracyPenalty = currentCaster?.accuracyPenalty || 0;
        const agiMitigation = calculateAccuracyMitigation(caster.attributes);
        const effectivePenalty = Math.max(0, currentAccuracyPenalty - agiMitigation);
        if (effectivePenalty > 0) {
          const roll = rollD20();
          if (roll <= effectivePenalty) {
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name} misses! (rolled ${roll} ≤ ${effectivePenalty})`,
                "info"
              )
            );
            continue;
          }
        }

        // TODO: Execute bonus logic needs to be implemented via effect type, not card reference

        if (monster.damageReduction) {
          const reducedAmount = Math.floor(damage * monster.damageReduction);
          damage = damage - reducedAmount;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${monster.name}'s armor reduces damage by ${reducedAmount}!`,
              "info",
              true
            )
          );
        }

        let remainingDamage = damage;
        let newShield = monster.shield;

        // Check for ignoreShield buff
        const ignoreShieldBuff = currentCaster?.buffs.find((b) => b.type === "ignoreShield");

        if (newShield > 0 && !ignoreShieldBuff) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
        } else if (ignoreShieldBuff) {
          // Ignore shield entirely - damage goes straight to HP
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Armor Piercing! ${caster.name}'s attack ignores shields!`,
              "damage",
              true
            )
          );
        }

        const newHp = Math.max(0, monster.hp - remainingDamage);
        const isAlive = newHp > 0;

        updatedMonsters[idx] = {
          ...monster,
          hp: newHp,
          shield: newShield,
          isAlive,
        };

        if (monster.isAlive && !isAlive) {
          // Distribute gold
          const goldDistribution = distributeGold(
            updatedPlayers,
            monster.goldReward
          );
          updatedPlayers = goldDistribution.players;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              goldDistribution.message,
              "info",
              true
            )
          );

          // Distribute XP to champions
          const xpDistribution = calculateXPDistribution(
            updatedPlayers,
            monster.xpReward
          );
          // Merge XP into the result map
          for (const [championId, xp] of xpDistribution.championXP) {
            const existing = xpEarned.get(championId) || 0;
            xpEarned.set(championId, existing + xp);
          }
          if (xpDistribution.message) {
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                xpDistribution.message,
                "info",
                true
              )
            );
          }
        }

        if (monster.eliteModifier === "cursed" && currentCaster) {
          const debuffTypes: Array<"poison" | "burn" | "weakness" | "frost"> = [
            "poison",
            "burn",
            "weakness",
            "frost",
          ];
          const randomDebuff =
            debuffTypes[Math.floor(Math.random() * debuffTypes.length)];
          const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
          if (casterIdx !== -1) {
            const existingDebuff = updatedPlayers[casterIdx].debuffs.find(
              (d) => d.type === randomDebuff
            );
            if (existingDebuff) {
              existingDebuff.duration = Math.max(existingDebuff.duration, 2);
            } else {
              updatedPlayers[casterIdx] = {
                ...updatedPlayers[casterIdx],
                debuffs: [
                  ...updatedPlayers[casterIdx].debuffs,
                  { type: randomDebuff, value: 2, duration: 2 },
                ],
              };
            }
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${monster.name}'s curse afflicts ${caster.name} with ${randomDebuff}!`,
                "debuff",
                true
              )
            );
          }
        }

        // ============================================
        // FIGHTER - Disciplined Strikes passive procs
        // 10% chance each for: stun, vulnerable, weakness
        // ============================================
        if (currentCaster?.class === "fighter" && updatedMonsters[idx].isAlive) {
          const fighterProcs: string[] = [];

          // 10% chance to stun
          if (Math.random() < FIGHTER_PROC_CHANCE) {
            updatedMonsters[idx] = {
              ...updatedMonsters[idx],
              debuffs: [
                ...updatedMonsters[idx].debuffs,
                { type: "stun" as EffectType, value: 1, duration: 1, useActionTracking: true },
              ],
            };
            fighterProcs.push("Stunned");
          }

          // 10% chance to apply Vulnerable
          if (Math.random() < FIGHTER_PROC_CHANCE) {
            const existingVuln = updatedMonsters[idx].debuffs.find((d) => d.type === "vulnerable");
            if (existingVuln) {
              existingVuln.duration = Math.max(existingVuln.duration, 2);
            } else {
              updatedMonsters[idx] = {
                ...updatedMonsters[idx],
                debuffs: [
                  ...updatedMonsters[idx].debuffs,
                  { type: "vulnerable" as EffectType, value: 1, duration: 2 },
                ],
              };
            }
            fighterProcs.push("Vulnerable");
          }

          // 10% chance to apply Weakness
          if (Math.random() < FIGHTER_PROC_CHANCE) {
            const existingWeak = updatedMonsters[idx].debuffs.find((d) => d.type === "weakness");
            if (existingWeak) {
              existingWeak.duration = Math.max(existingWeak.duration, 2);
            } else {
              updatedMonsters[idx] = {
                ...updatedMonsters[idx],
                debuffs: [
                  ...updatedMonsters[idx].debuffs,
                  { type: "weakness" as EffectType, value: 20, duration: 2 },
                ],
              };
            }
            fighterProcs.push("Weakened");
          }

          if (fighterProcs.length > 0) {
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Disciplined Strike! ${caster.name} finds weakpoints: ${fighterProcs.join(", ")}!`,
                "debuff",
                true
              )
            );
          }
        }

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${caster.name} deals ${damage} damage to ${monster.name}!${
              !isAlive ? ` ${monster.name} is defeated!` : ""
            }`,
            "damage",
            true
          )
        );
      }

      if (effect.target === "self" && effect.value) {
        const idx = updatedPlayers.findIndex((p) => p.id === caster.id);
        if (idx !== -1) {
          let newHp = Math.max(0, updatedPlayers[idx].hp - effect.value);
          let isAlive = newHp > 0;

          // Check for surviveLethal buff
          const surviveLethalBuff = updatedPlayers[idx].buffs.find((b) => b.type === "surviveLethal");
          if (!isAlive && surviveLethalBuff) {
            newHp = 1;
            isAlive = true;
            // Remove the buff after it triggers
            updatedPlayers[idx] = {
              ...updatedPlayers[idx],
              hp: newHp,
              isAlive,
              buffs: updatedPlayers[idx].buffs.filter((b) => b.type !== "surviveLethal"),
            };
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Death's Door! ${caster.name} survives at 1 HP!`,
                "heal",
                true
              )
            );
          } else {
            updatedPlayers[idx] = {
              ...updatedPlayers[idx],
              hp: newHp,
              isAlive,
            };
          }
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${caster.name} takes ${effect.value} self damage!`,
              "damage"
            )
          );
        }
      }

      // Handle lifesteal and healPerHit buffs after all damage is dealt
      const casterIdxForHealing = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdxForHealing !== -1) {
        const casterForHealing = updatedPlayers[casterIdxForHealing];

        // Lifesteal: heal for percentage of damage dealt
        const lifestealBuff = casterForHealing.buffs.find((b) => b.type === "lifesteal");
        if (lifestealBuff && effect.target !== "self") {
          const totalDamageDealt = monsterTargets.reduce((sum, m) => {
            const monster = updatedMonsters.find((mon) => mon.id === m.id);
            const originalMonster = monsters.find((mon) => mon.id === m.id);
            if (monster && originalMonster) {
              return sum + Math.max(0, originalMonster.hp - monster.hp);
            }
            return sum;
          }, 0);

          const healAmount = Math.floor(totalDamageDealt * (lifestealBuff.value / 100));
          if (healAmount > 0) {
            const newHp = Math.min(casterForHealing.maxHp, casterForHealing.hp + healAmount);
            updatedPlayers[casterIdxForHealing] = {
              ...casterForHealing,
              hp: newHp,
            };
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Lifesteal! ${caster.name} heals for ${healAmount} HP!`,
                "heal",
                true
              )
            );
          }
        }

        // HealPerHit: heal X per enemy hit
        const healPerHitBuff = casterForHealing.buffs.find((b) => b.type === "healPerHit");
        if (healPerHitBuff && effect.target === "allMonsters") {
          const enemiesHit = monsterTargets.filter((m) => {
            const monster = updatedMonsters.find((mon) => mon.id === m.id);
            return monster && monster.isAlive;
          }).length;

          const healAmount = healPerHitBuff.value * Math.max(1, enemiesHit);
          if (healAmount > 0) {
            const currentCasterHp = updatedPlayers[casterIdxForHealing].hp;
            const newHp = Math.min(updatedPlayers[casterIdxForHealing].maxHp, currentCasterHp + healAmount);
            updatedPlayers[casterIdxForHealing] = {
              ...updatedPlayers[casterIdxForHealing],
              hp: newHp,
            };
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Vampiric! ${caster.name} heals for ${healAmount} HP (${enemiesHit} enemies hit)!`,
                "heal",
                true
              )
            );
          }
        }

        // Remove ignoreShield buff after use (single use)
        const ignoreShieldBuff = casterForHealing.buffs.find((b) => b.type === "ignoreShield");
        if (ignoreShieldBuff) {
          updatedPlayers[casterIdxForHealing] = {
            ...updatedPlayers[casterIdxForHealing],
            buffs: updatedPlayers[casterIdxForHealing].buffs.filter((b) => b.type !== "ignoreShield"),
          };
        }
      }

      break;
    }

    case "heal": {
      const targets = getTargets();
      // NOTE: Paladin Faith bonuses are card-specific and applied via applyFaithBonuses()

      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        let healAmount = effect.value || 0;
        // Apply stat scaling based on caster's WIS
        healAmount = calculateScaledHeal(healAmount, caster.attributes);
        healAmount = applyEnvironmentModifier(healAmount, "heal", environment);

        const newHp = Math.min(target.maxHp, target.hp + healAmount);

        updatedPlayers[idx] = {
          ...target,
          hp: newHp,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} heals for ${healAmount}!`,
            "heal"
          )
        );
      }
      break;
    }

    case "shield": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        let shieldAmount = effect.value || 0;
        // Apply stat scaling based on caster's CON
        shieldAmount = calculateScaledShield(shieldAmount, caster.attributes);
        shieldAmount = applyEnvironmentModifier(shieldAmount, "shield", environment);

        updatedPlayers[idx] = {
          ...updatedPlayers[idx],
          shield: updatedPlayers[idx].shield + shieldAmount,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${updatedPlayers[idx].name} gains ${shieldAmount} shield!`,
            "buff"
          )
        );
      }
      break;
    }

    case "stealth":
    case "taunt":
    case "strength":
    case "regen":
    case "block": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        // Apply duration bonus from WIS
        const durationBonus = calculateDurationBonus(caster.attributes);
        const baseDuration = effect.duration || 1;
        const finalDuration = baseDuration + durationBonus;

        // Stealth, Taunt, Strength use action-based tracking
        // Block, Regen use turn-based tracking
        const useActionTracking = ["stealth", "taunt", "strength"].includes(effect.type);

        const newBuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.consumeOnAttack ? baseDuration : finalDuration, // Don't apply WIS bonus to attack-based buffs
          source: caster.name,
          consumeOnAttack: effect.consumeOnAttack,
          attacksRemaining: effect.consumeOnAttack ? baseDuration : undefined,
          isPercentage: effect.isPercentage, // For percentage-based strength buffs
          useActionTracking,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
          isStealth: effect.type === "stealth" || target.isStealth,
          hasTaunt: effect.type === "taunt" || target.hasTaunt,
        };

        const durationUnit = useActionTracking ? "action(s)" : "turns";
        const durationText = effect.consumeOnAttack
          ? ` (${baseDuration} attacks)`
          : durationBonus > 0 ? ` (${baseDuration}+${durationBonus} ${durationUnit})` : "";
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} gains ${effect.type}!${durationText}`,
            "buff"
          )
        );
      }
      break;
    }

    case "poison":
    case "burn":
    case "frost":
    case "weakness":
    case "vulnerable":
    case "stun":
    case "accuracy": {
      // Check if this effect requires stealth
      if (effect.stealthOnly) {
        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);
        if (!currentCaster?.isStealth) {
          // Skip this effect if not stealthed
          break;
        }
      }

      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        // Apply duration bonus from WIS for debuffs too
        const durationBonus = calculateDurationBonus(caster.attributes);
        const baseDuration = effect.duration || 1;
        let finalDuration = baseDuration + durationBonus;

        // Apply stealth duration bonus if stealthed
        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);
        if (effect.stealthDurationBonus && currentCaster?.isStealth) {
          finalDuration += effect.stealthDurationBonus;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Stealth bonus: +${effect.stealthDurationBonus} turn(s) duration!`,
              "buff",
              true
            )
          );
        }

        // Apply stealth value bonus for poison if stealthed
        let finalValue = effect.value || 1;
        if (effect.stealthBonus && currentCaster?.isStealth) {
          finalValue += effect.stealthBonus;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Stealth bonus: +${effect.stealthBonus} ${effect.type}/tick!`,
              "buff",
              true
            )
          );
        }

        // ============================================
        // MAGE - Elemental combo: increase existing debuff tick damage
        // ============================================
        const currentMonster = updatedMonsters[idx];
        let updatedDebuffs = [...currentMonster.debuffs];

        // Burn bonus tick: increase existing burn's tick damage
        if (effect.type === "burn" && effect.burnBonusTick) {
          const existingBurnIdx = updatedDebuffs.findIndex(d => d.type === "burn");
          if (existingBurnIdx !== -1) {
            updatedDebuffs[existingBurnIdx] = {
              ...updatedDebuffs[existingBurnIdx],
              value: updatedDebuffs[existingBurnIdx].value + effect.burnBonusTick,
            };
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Intensified Flames! Existing burn damage increased by +${effect.burnBonusTick}/tick!`,
                "debuff",
                true
              )
            );
          }
        }

        // Frost bonus tick: increase existing frost's tick damage
        if (effect.type === "frost" && effect.frostBonusTick) {
          const existingFrostIdx = updatedDebuffs.findIndex(d => d.type === "frost");
          if (existingFrostIdx !== -1) {
            updatedDebuffs[existingFrostIdx] = {
              ...updatedDebuffs[existingFrostIdx],
              value: updatedDebuffs[existingFrostIdx].value + effect.frostBonusTick,
            };
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `Deep Freeze! Existing frost damage increased by +${effect.frostBonusTick}/tick!`,
                "debuff",
                true
              )
            );
          }
        }

        // Stun, Weakness, Accuracy use action-based tracking
        // Poison, Burn, Frost, Vulnerable use turn-based tracking
        const useActionTracking = ["stun", "weakness", "accuracy"].includes(effect.type);

        // Check if debuff of this type already exists - stack by extending duration
        const existingDebuffIdx = updatedDebuffs.findIndex(d => d.type === effect.type);

        if (existingDebuffIdx !== -1) {
          // Stack: extend duration and take higher value
          const existing = updatedDebuffs[existingDebuffIdx];
          updatedDebuffs[existingDebuffIdx] = {
            ...existing,
            duration: existing.duration + finalDuration,
            value: Math.max(existing.value, finalValue),
          };
        } else {
          // New debuff
          const newDebuff: StatusEffect = {
            type: effect.type,
            value: finalValue,
            duration: finalDuration,
            source: caster.name,
            useActionTracking,
          };
          updatedDebuffs.push(newDebuff);
        }

        updatedMonsters[idx] = {
          ...currentMonster,
          debuffs: updatedDebuffs,
        };

        const durationUnit = useActionTracking ? "action(s)" : "turns";
        const durationText = durationBonus > 0 || effect.stealthDurationBonus
          ? ` for ${finalDuration} ${durationUnit}`
          : "";
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${monster.name} is afflicted with ${effect.type}!${durationText}`,
            "debuff"
          )
        );
      }
      break;
    }

    case "cleanse": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        updatedPlayers[idx] = {
          ...target,
          debuffs: [],
          isStunned: false,
          accuracyPenalty: 0,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} is cleansed of all debuffs!`,
            "buff"
          )
        );
      }
      break;
    }

    case "revive": {
      const deadAllies = updatedPlayers.filter(
        (p) => !p.isAlive && p.id !== caster.id
      );
      if (deadAllies.length > 0) {
        const target = deadAllies[0];
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx !== -1) {
          const reviveHp = Math.floor(
            target.maxHp * ((effect.value || 30) / 100)
          );

          updatedPlayers[idx] = {
            ...target,
            hp: reviveHp,
            isAlive: true,
            debuffs: [],
            isStunned: false,
            accuracyPenalty: 0,
          };

          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${target.name} is revived with ${reviveHp} HP!`,
              "heal"
            )
          );
        }
      }
      break;
    }

    // ============================================
    // NEW CLASS MECHANIC EFFECTS
    // ============================================

    case "gainResource": {
      // Gain class resource (Aim, Fury, Mana, etc.)
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const newResource = Math.min(
          player.maxResource,
          player.resource + (effect.value || 1)
        );
        updatedPlayers[casterIdx] = {
          ...player,
          resource: newResource,
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name} gains +${effect.value} ${player.class === "archer" ? "Aim" : player.class === "barbarian" ? "Fury" : "resource"}!`,
            "buff"
          )
        );
      }
      break;
    }

    case "manaRestore": {
      // Mage-specific: restore mana (the Empowered pool, not Resonance)
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const currentMana = player.mana ?? 0;
        const maxMana = player.maxMana ?? 10;
        const newMana = Math.min(maxMana, currentMana + (effect.value || 1));
        updatedPlayers[casterIdx] = {
          ...player,
          mana: newMana,
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name} restores ${effect.value} mana!`,
            "buff"
          )
        );
      }
      break;
    }

    case "empowered": {
      // Grant empowered buff (bonus damage to next spell) - legacy
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const newBuff: StatusEffect = {
          type: "strength", // Use strength as the underlying mechanic
          value: effect.value || 10,
          duration: effect.duration || 1,
          source: "Empowered",
        };
        updatedPlayers[casterIdx] = {
          ...player,
          buffs: [...player.buffs, newBuff],
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name}'s next spell is Empowered (+${effect.value}% damage)!`,
            "buff"
          )
        );
      }
      break;
    }

    case "forceEmpowered": {
      // Force next spell to be treated as Empowered regardless of mana
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const newBuff: StatusEffect = {
          type: "strength", // Marker buff
          value: 1,
          duration: effect.duration || 1,
          source: "ForceEmpowered",
        };
        updatedPlayers[casterIdx] = {
          ...player,
          buffs: [...player.buffs, newBuff],
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name}'s next spell will be Empowered!`,
            "buff"
          )
        );
      }
      break;
    }

    case "doubleEmpowered": {
      // Double next spell's Empowered bonus
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const newBuff: StatusEffect = {
          type: "strength", // Marker buff
          value: 2, // 2x multiplier
          duration: effect.duration || 1,
          source: "DoubleEmpowered",
        };
        updatedPlayers[casterIdx] = {
          ...player,
          buffs: [...player.buffs, newBuff],
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name}'s next Empowered spell bonus is DOUBLED!`,
            "buff"
          )
        );
      }
      break;
    }

    case "spellDamageBonus": {
      // Add bonus damage to next spell
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx !== -1) {
        const player = updatedPlayers[casterIdx];
        const newBuff: StatusEffect = {
          type: "strength",
          value: effect.value || 5,
          duration: effect.duration || 1,
          source: "SpellDamageBonus",
        };
        updatedPlayers[casterIdx] = {
          ...player,
          buffs: [...player.buffs, newBuff],
        };
        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name}'s next spell deals +${effect.value} damage!`,
            "buff"
          )
        );
      }
      break;
    }

    case "manaSurge": {
      // Spend all mana (the Empowered pool), fire a missile per mana spent
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx === -1) break;

      const player = updatedPlayers[casterIdx];
      const currentMana = player.mana ?? 0;
      const maxMana = player.maxMana ?? 10;
      const damagePerMissile = effect.value || 5;
      const isEmpowered = currentMana >= (maxMana / 2);

      // Spend all mana (the Empowered pool)
      updatedPlayers[casterIdx] = {
        ...player,
        mana: 0,
      };

      logs.push(
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} channels ${currentMana} mana into Mana Surge!`,
          "action"
        )
      );

      // Fire missiles at target(s)
      const monsterTargets = getMonsterTargets();
      const totalDamage = currentMana * damagePerMissile;

      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1 || !updatedMonsters[idx].isAlive) continue;

        // Apply damage
        const newHp = Math.max(0, updatedMonsters[idx].hp - totalDamage);
        const wasAlive = updatedMonsters[idx].isAlive;
        const nowDead = newHp <= 0;

        updatedMonsters[idx] = {
          ...updatedMonsters[idx],
          hp: newHp,
          isAlive: !nowDead,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${currentMana} missiles hit ${monster.name} for ${totalDamage} damage!`,
            "damage"
          )
        );

        // Apply Vulnerable if empowered
        if (isEmpowered) {
          const existingVulnIdx = updatedMonsters[idx].debuffs.findIndex(
            (d) => d.type === "vulnerable"
          );
          if (existingVulnIdx >= 0) {
            updatedMonsters[idx].debuffs[existingVulnIdx] = {
              ...updatedMonsters[idx].debuffs[existingVulnIdx],
              value: updatedMonsters[idx].debuffs[existingVulnIdx].value + currentMana,
            };
          } else {
            updatedMonsters[idx] = {
              ...updatedMonsters[idx],
              debuffs: [
                ...updatedMonsters[idx].debuffs,
                { type: "vulnerable", value: currentMana, duration: 1, source: "Mana Surge" },
              ],
            };
          }
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `Empowered! ${monster.name} gains ${currentMana} Vulnerable!`,
              "debuff"
            )
          );
        }

        // Award XP if killed
        if (wasAlive && nowDead) {
          const xpReward = monster.xpReward || 0;
          if (xpReward > 0 && caster.championId) {
            xpEarned.set(caster.championId, (xpEarned.get(caster.championId) || 0) + xpReward);
          }
        }
      }
      break;
    }

    case "execute": {
      // Kill target if below HP threshold
      const threshold = effect.value || 20; // HP percentage threshold
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1 || !updatedMonsters[idx].isAlive) continue;

        const hpPercent = (updatedMonsters[idx].hp / updatedMonsters[idx].maxHp) * 100;
        if (hpPercent <= threshold) {
          const xpReward = updatedMonsters[idx].xpReward || 0;
          updatedMonsters[idx] = {
            ...updatedMonsters[idx],
            hp: 0,
            isAlive: false,
          };
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `EXECUTE! ${monster.name} is finished off!`,
              "damage",
              true
            )
          );
          if (xpReward > 0 && caster.championId) {
            xpEarned.set(caster.championId, (xpEarned.get(caster.championId) || 0) + xpReward);
          }
        }
      }
      break;
    }

    case "executeBonus": {
      // Bonus damage if target below HP threshold (duration field = threshold %)
      // This is handled in the damage case above, this is just a marker
      break;
    }

    case "lifesteal":
    case "surviveLethal":
    case "ignoreShield":
    case "healPerHit":
    case "repeatOnKill": {
      // These are buff-type effects that modify other actions
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const newBuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.duration || 1,
          source: caster.name,
          consumeOnAttack: effect.consumeOnAttack,
          attacksRemaining: effect.consumeOnAttack ? effect.duration : undefined,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
        };

        const effectName = {
          lifesteal: "Lifesteal",
          surviveLethal: "Death's Door",
          ignoreShield: "Armor Piercing",
          healPerHit: "Vampiric",
          repeatOnKill: "Bloodlust",
        }[effect.type] || effect.type;

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} gains ${effectName}!`,
            "buff"
          )
        );
      }
      break;
    }

    case "removeShield": {
      // Remove all shields from monster targets
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        const shieldRemoved = updatedMonsters[idx].shield;
        if (shieldRemoved > 0) {
          updatedMonsters[idx] = {
            ...updatedMonsters[idx],
            shield: 0,
          };
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${monster.name}'s shield (${shieldRemoved}) is shattered!`,
              "damage",
              true
            )
          );
        }
      }
      break;
    }

    case "stunImmunity": {
      // Grant immunity to stun
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const newBuff: StatusEffect = {
          type: "stunImmunity",
          value: 1,
          duration: effect.duration || 1,
          source: caster.name,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} is immune to stun!`,
            "buff"
          )
        );
      }
      break;
    }

    case "priority": {
      // Mark that this card has priority (handled at card play level)
      // This is primarily a marker effect - actual priority logic is in combat resolution
      logs.push(
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${caster.name}'s action has priority!`,
          "buff",
          true
        )
      );
      break;
    }

    case "transferDebuffs": {
      // Transfer all debuffs from caster to target monster
      const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
      if (casterIdx === -1) break;

      const casterDebuffs = [...updatedPlayers[casterIdx].debuffs];
      if (casterDebuffs.length === 0) break;

      // Clear caster's debuffs
      updatedPlayers[casterIdx] = {
        ...updatedPlayers[casterIdx],
        debuffs: [],
        isStunned: false,
        accuracyPenalty: 0,
      };

      // Apply debuffs to target monster
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        updatedMonsters[idx] = {
          ...updatedMonsters[idx],
          debuffs: [...updatedMonsters[idx].debuffs, ...casterDebuffs],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${caster.name} transfers ${casterDebuffs.length} debuff(s) to ${monster.name}!`,
            "debuff"
          )
        );
      }
      break;
    }

    case "aggroReduction": {
      // Apply aggro reduction buff
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const newBuff: StatusEffect = {
          type: "aggroReduction",
          value: effect.value || 5,
          duration: effect.duration || 2,
          source: caster.name,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name}'s aggro is reduced for ${effect.duration} turns!`,
            "buff"
          )
        );
      }
      break;
    }

    case "bountyMark": {
      // Mark an enemy for bonus gold on kill
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        const newDebuff: StatusEffect = {
          type: "bountyMark",
          value: effect.value || 50, // Bonus gold percentage
          duration: 99, // Permanent until killed
          source: caster.name,
        };

        updatedMonsters[idx] = {
          ...updatedMonsters[idx],
          debuffs: [...updatedMonsters[idx].debuffs, newDebuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${monster.name} is marked for a bounty! (+${effect.value}% gold on kill)`,
            "debuff"
          )
        );
      }
      break;
    }

    case "poisonCoating": {
      // Grant a buff that makes next X attacks apply poison
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        // Check if stealthed for bonus poison
        const isStealth = target.isStealth;
        const poisonValue = isStealth ? (effect.value || 3) + 1 : (effect.value || 3);

        const newBuff: StatusEffect = {
          type: "poisonCoating",
          value: poisonValue,
          duration: effect.duration || 3,
          source: caster.name,
          consumeOnAttack: true,
          attacksRemaining: effect.duration || 3,
          useActionTracking: true, // Prevent turn-based decrement (uses attack-based instead)
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name}'s next ${effect.duration || 3} attacks will apply ${poisonValue} Poison!`,
            "buff"
          )
        );
      }
      break;
    }
  }

  return { players: updatedPlayers, monsters: updatedMonsters, logs, xpEarned };
}
