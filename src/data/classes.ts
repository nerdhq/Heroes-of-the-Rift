import type { ClassConfig, ClassType } from "../types";

export const CLASS_CONFIGS: Record<ClassType, ClassConfig> = {
  warrior: {
    type: "warrior",
    name: "Warrior",
    description: "A disciplined martial fighter with high HP and tactical prowess.",
    baseHp: 120,
    resourceName: "Discipline",
    maxResource: 10,
    color: "#dc2626", // red
    specialAbility: {
      name: "Martial Supremacy",
      description: "Deal 25 damage to all enemies. Enemies deal 20% less damage on their next card.",
      effects: [
        { type: "damage", value: 25, target: "allMonsters" },
        { type: "weakness", value: 20, target: "allMonsters", duration: 1 },
      ],
    },
    enhanceBonus: { damageBonus: 8, healBonus: 0, shieldBonus: 5 },
  },
  rogue: {
    type: "rogue",
    name: "Rogue",
    description: "A swift assassin who strikes from the shadows.",
    baseHp: 80,
    resourceName: "Combo",
    maxResource: 5,
    color: "#7c3aed", // purple
    specialAbility: {
      name: "Assassinate",
      description: "Deal 40 damage to one enemy and gain stealth",
      effects: [
        { type: "damage", value: 40, target: "monster" },
        { type: "stealth", value: 2, target: "self", duration: 2 },
      ],
    },
    enhanceBonus: { damageBonus: 10, healBonus: 0, shieldBonus: 0 },
  },
  paladin: {
    type: "paladin",
    name: "Paladin",
    description: "A holy knight who protects allies and smites evil.",
    baseHp: 100,
    resourceName: "Faith",
    maxResource: 8,
    color: "#eab308", // yellow
    specialAbility: {
      name: "Shield of Faith",
      description: "Heal and shield all allies. Party is immune to damage and effects until end of next turn.",
      effects: [
        { type: "heal", value: 10, target: "allAllies" },
        { type: "shield", value: 15, target: "allAllies" },
        { type: "block", value: 1, target: "allAllies", duration: 1 },
      ],
    },
    enhanceBonus: { damageBonus: 5, healBonus: 8, shieldBonus: 10 },
  },
  mage: {
    type: "mage",
    name: "Mage",
    description: "Scholarly arcanist who bends reality through mastery of magic. High damage and utility, but fragile.",
    baseHp: 70,
    resourceName: "Mana",
    maxResource: 10,
    color: "#3b82f6", // blue
    specialAbility: {
      name: "Mana Overload",
      description: "Deal 36 damage to all enemies. Apply 2 Burn, 2 Ice, and 2 Vulnerable for 2 turns. Reset mana to 10. Unlocks after spending 20 mana.",
      effects: [
        { type: "damage", value: 36, target: "allMonsters" },
        { type: "burn", value: 2, target: "allMonsters", duration: 2 },
        { type: "ice", value: 2, target: "allMonsters", duration: 2 },
        { type: "vulnerable", value: 2, target: "allMonsters", duration: 2 },
      ],
    },
    enhanceBonus: { damageBonus: 12, healBonus: 0, shieldBonus: 0 },
  },
  cleric: {
    type: "cleric",
    name: "Cleric",
    description: "Divine servant who channels their deity's power through prayer. Switches between Judgment and Benediction modes.",
    baseHp: 75,
    resourceName: "Devotion",
    maxResource: 5,
    color: "#f8fafc", // white
    specialAbility: {
      name: "Prayer Cycle",
      description: "Switch modes. At 5 Devotion: Judgment deals 10 AOE damage + 50% damage buff. Benediction heals 15 AOE + 50% healing buff.",
      effects: [
        { type: "damage", value: 10, target: "allMonsters" },
        { type: "heal", value: 15, target: "allAllies" },
      ],
    },
    enhanceBonus: { damageBonus: 6, healBonus: 10, shieldBonus: 5 },
  },
  bard: {
    type: "bard",
    name: "Bard",
    description: "A charismatic performer who buffs allies with songs.",
    baseHp: 85,
    resourceName: "Melody",
    maxResource: 6,
    color: "#ec4899", // pink
    specialAbility: {
      name: "Battle Hymn",
      description: "Grant +5 strength to all allies for 3 turns",
      effects: [
        { type: "strength", value: 5, target: "allAllies", duration: 3 },
      ],
    },
    enhanceBonus: { damageBonus: 3, healBonus: 5, shieldBonus: 5 },
  },
  archer: {
    type: "archer",
    name: "Archer",
    description: "A precise marksman who never misses their target.",
    baseHp: 75,
    resourceName: "Focus",
    maxResource: 8,
    color: "#22c55e", // green
    specialAbility: {
      name: "Piercing Shot",
      description: "Deal 30 damage to all enemies (ignores shields)",
      effects: [{ type: "damage", value: 30, target: "allMonsters" }],
    },
    enhanceBonus: { damageBonus: 10, healBonus: 0, shieldBonus: 0 },
  },
  barbarian: {
    type: "barbarian",
    name: "Barbarian",
    description: "A berserker who grows stronger as they take damage.",
    baseHp: 130,
    resourceName: "Fury",
    maxResource: 10,
    color: "#f97316", // orange
    specialAbility: {
      name: "Rampage",
      description: "Deal 20 damage to all enemies and gain 10 HP",
      effects: [
        { type: "damage", value: 20, target: "allMonsters" },
        { type: "heal", value: 10, target: "self" },
      ],
    },
    enhanceBonus: { damageBonus: 8, healBonus: 5, shieldBonus: 0 },
  },
};

export const AVAILABLE_CLASSES: ClassType[] = [
  "warrior",
  "rogue",
  "paladin",
  "mage",
  "cleric",
  "bard",
  "archer",
  "barbarian",
];
