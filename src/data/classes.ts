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
  },
  rogue: {
    type: "rogue",
    name: "Rogue",
    description: "A swift assassin who strikes from the shadows.",
    baseHp: 80,
    resourceName: "Combo",
    maxResource: 5,
    color: "#7c3aed", // purple
  },
  paladin: {
    type: "paladin",
    name: "Paladin",
    description: "A holy knight who protects allies and smites evil.",
    baseHp: 100,
    resourceName: "Faith",
    maxResource: 8,
    color: "#eab308", // yellow
  },
  mage: {
    type: "mage",
    name: "Mage",
    description: "A master of arcane arts dealing devastating spell damage.",
    baseHp: 70,
    resourceName: "Arcane",
    maxResource: 12,
    color: "#3b82f6", // blue
  },
  priest: {
    type: "priest",
    name: "Priest",
    description: "A divine healer who keeps the party alive.",
    baseHp: 75,
    resourceName: "Devotion",
    maxResource: 10,
    color: "#f8fafc", // white
  },
  bard: {
    type: "bard",
    name: "Bard",
    description: "A charismatic performer who buffs allies with songs.",
    baseHp: 85,
    resourceName: "Melody",
    maxResource: 6,
    color: "#ec4899", // pink
  },
  archer: {
    type: "archer",
    name: "Archer",
    description: "A precise marksman who never misses their target.",
    baseHp: 75,
    resourceName: "Focus",
    maxResource: 8,
    color: "#22c55e", // green
  },
  barbarian: {
    type: "barbarian",
    name: "Barbarian",
    description: "A berserker who grows stronger as they take damage.",
    baseHp: 130,
    resourceName: "Fury",
    maxResource: 10,
    color: "#f97316", // orange
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
