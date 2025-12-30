import type { GamePhase, LogEntry, Card, Player, Monster, Environment, EffectType, Effect, StatusEffect } from "../types";
import { CLASS_CONFIGS } from "../data/classes";

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
  deck: Card[]
): Player => {
  const config = CLASS_CONFIGS[classType];
  return {
    id,
    name,
    class: classType,
    hp: config.baseHp,
    maxHp: config.baseHp,
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
    gold: 0,
    isAlive: true,
    isStealth: false,
    hasTaunt: false,
    isStunned: false,
    accuracyPenalty: 0,
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
): { players: Player[]; monsters: Monster[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  let updatedPlayers = [...players];
  const updatedMonsters = [...monsters];

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

        damage = applyEnvironmentModifier(damage, "damage", environment);

        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);
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

        const currentAccuracyPenalty = currentCaster?.accuracyPenalty || 0;
        if (currentAccuracyPenalty > 0) {
          const roll = rollD20();
          if (roll <= currentAccuracyPenalty) {
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name} misses! (rolled ${roll} ≤ ${currentAccuracyPenalty})`,
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
    case "block": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const newBuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.duration || 1,
          source: caster.name,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
          isStealth: effect.type === "stealth" || target.isStealth,
          hasTaunt: effect.type === "taunt" || target.hasTaunt,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} gains ${effect.type}!`,
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
    case "stun":
    case "accuracy": {
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        const newDebuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.duration || 1,
          source: caster.name,
        };

        updatedMonsters[idx] = {
          ...monster,
          debuffs: [...monster.debuffs, newDebuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${monster.name} is afflicted with ${effect.type}!`,
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

  return { players: updatedPlayers, monsters: updatedMonsters, logs };
}
