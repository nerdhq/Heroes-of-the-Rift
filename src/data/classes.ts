import type { ClassConfig, ClassType } from "../types";

export const CLASS_CONFIGS: Record<ClassType, ClassConfig> = {
  warrior: {
    type: "warrior",
    name: "Warrior",
    description: "A stalwart defender with high HP and powerful melee attacks.",
    baseHp: 120,
    resourceName: "Rage",
    maxResource: 10,
    color: "#dc2626", // red
    specialAbility: {
      name: "Berserker Strike",
      description: "Deal 25 damage to all enemies",
      effects: [{ type: "damage", value: 25, target: "allMonsters" }],
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
      name: "Divine Shield",
      description: "Grant 15 shield to all allies",
      effects: [{ type: "shield", value: 15, target: "allAllies" }],
    },
    enhanceBonus: { damageBonus: 5, healBonus: 8, shieldBonus: 10 },
  },
  mage: {
    type: "mage",
    name: "Mage",
    description: "A master of arcane arts dealing devastating spell damage.",
    baseHp: 70,
    resourceName: "Arcane",
    maxResource: 12,
    color: "#3b82f6", // blue
    specialAbility: {
      name: "Arcane Blast",
      description: "Deal 35 damage to all enemies",
      effects: [{ type: "damage", value: 35, target: "allMonsters" }],
    },
    enhanceBonus: { damageBonus: 12, healBonus: 0, shieldBonus: 0 },
  },
  priest: {
    type: "priest",
    name: "Priest",
    description: "A divine healer who keeps the party alive.",
    baseHp: 75,
    resourceName: "Devotion",
    maxResource: 10,
    color: "#f8fafc", // white
    specialAbility: {
      name: "Mass Heal",
      description: "Heal all allies for 20 HP and cleanse debuffs",
      effects: [
        { type: "heal", value: 20, target: "allAllies" },
        { type: "cleanse", target: "allAllies" },
      ],
    },
    enhanceBonus: { damageBonus: 0, healBonus: 12, shieldBonus: 5 },
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
  "priest",
  "bard",
  "archer",
  "barbarian",
];
