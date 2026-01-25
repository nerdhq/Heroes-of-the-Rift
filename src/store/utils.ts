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
        if (effectType === "ice") {
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

        const strengthBuff = currentCaster?.buffs.find(
          (b) => b.type === "strength"
        );
        if (strengthBuff) {
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
        if (newShield > 0) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
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
          const debuffTypes: Array<"poison" | "burn" | "weakness" | "ice"> = [
            "poison",
            "burn",
            "weakness",
            "ice",
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
                { type: "stun" as EffectType, value: 1, duration: 1 },
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
          const newHp = Math.max(0, updatedPlayers[idx].hp - effect.value);
          updatedPlayers[idx] = {
            ...updatedPlayers[idx],
            hp: newHp,
            isAlive: newHp > 0,
          };
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
      break;
    }

    case "heal": {
      const targets = getTargets();
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

        const newBuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: finalDuration,
          source: caster.name,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
          isStealth: effect.type === "stealth" || target.isStealth,
          hasTaunt: effect.type === "taunt" || target.hasTaunt,
        };

        const durationText = durationBonus > 0 ? ` (${baseDuration}+${durationBonus} turns)` : "";
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
    case "ice":
    case "weakness":
    case "vulnerable":
    case "stun":
    case "accuracy": {
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        // Apply duration bonus from WIS for debuffs too
        const durationBonus = calculateDurationBonus(caster.attributes);
        const baseDuration = effect.duration || 1;
        const finalDuration = baseDuration + durationBonus;

        const newDebuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: finalDuration,
          source: caster.name,
        };

        updatedMonsters[idx] = {
          ...monster,
          debuffs: [...monster.debuffs, newDebuff],
        };

        const durationText = durationBonus > 0 ? ` for ${finalDuration} turns` : "";
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
  }

  return { players: updatedPlayers, monsters: updatedMonsters, logs, xpEarned };
}
