import type { Card, ClassType } from "../types";

// ============================================
// FIGHTER CARDS (10 cards)
// ============================================
const fighterCards: Card[] = [
  {
    id: "fighter-1",
    name: "Slash",
    class: "fighter",
    rarity: "common",
    aggro: 2,
    description: "Deal 8 damage to a monster.",
    effects: [{ type: "damage", value: 8, target: "monster" }],
  },
  {
    id: "fighter-2",
    name: "Shield Bash",
    class: "fighter",
    rarity: "common",
    aggro: 3,
    description: "Deal 5 damage and gain 5 shield.",
    effects: [
      { type: "damage", value: 5, target: "monster" },
      { type: "shield", value: 5, target: "self" },
    ],
  },
  {
    id: "fighter-3",
    name: "Raise Shields",
    class: "fighter",
    rarity: "common",
    aggro: 4,
    description: "Gain 12 shield and Taunt for 1 turn.",
    effects: [
      { type: "shield", value: 12, target: "self" },
      { type: "taunt", value: 1, target: "self", duration: 1 },
    ],
  },
  {
    id: "fighter-4",
    name: "Cleave",
    class: "fighter",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 6 damage to all monsters.",
    effects: [{ type: "damage", value: 6, target: "allMonsters" }],
  },
  {
    id: "fighter-5",
    name: "Battle Cry",
    class: "fighter",
    rarity: "uncommon",
    aggro: 2,
    description: "All allies gain 3 Strength for 2 turns.",
    effects: [{ type: "strength", value: 3, target: "allAllies", duration: 2 }],
  },
  {
    id: "fighter-6",
    name: "Execute",
    class: "fighter",
    rarity: "rare",
    aggro: 4,
    description: "Deal 15 damage to a monster.",
    effects: [{ type: "damage", value: 15, target: "monster" }],
  },
  {
    id: "fighter-7",
    name: "Iron Will",
    class: "fighter",
    rarity: "common",
    aggro: 1,
    description: "Gain 8 shield.",
    effects: [{ type: "shield", value: 8, target: "self" }],
  },
  {
    id: "fighter-8",
    name: "Reckless Strike",
    class: "fighter",
    rarity: "uncommon",
    aggro: 5,
    description: "Deal 20 damage but take 5 damage.",
    effects: [
      { type: "damage", value: 20, target: "monster" },
      { type: "damage", value: 5, target: "self" },
    ],
  },
  {
    id: "fighter-9",
    name: "Rally",
    class: "fighter",
    rarity: "rare",
    aggro: 2,
    description: "All allies gain 5 shield.",
    effects: [{ type: "shield", value: 5, target: "allAllies" }],
  },
  {
    id: "fighter-10",
    name: "Shattering Blow",
    class: "fighter",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 25 damage, remove all shields, and reduce armor for 3 turns.",
    effects: [
      { type: "damage", value: 25, target: "monster" },
      { type: "weakness", value: 5, target: "monster", duration: 3 },
    ],
  },
  // Additional common cards (21-25)
  {
    id: "fighter-21",
    name: "Heavy Swing",
    class: "fighter",
    rarity: "common",
    aggro: 3,
    description: "Deal 10 damage to a monster.",
    effects: [{ type: "damage", value: 10, target: "monster" }],
  },
  {
    id: "fighter-22",
    name: "Brace for Impact",
    class: "fighter",
    rarity: "common",
    aggro: 2,
    description: "Gain 10 shield.",
    effects: [{ type: "shield", value: 10, target: "self" }],
  },
  {
    id: "fighter-23",
    name: "Pommel Strike",
    class: "fighter",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage and gain 4 shield.",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "shield", value: 4, target: "self" },
    ],
  },
  {
    id: "fighter-24",
    name: "Disarm",
    class: "fighter",
    rarity: "common",
    aggro: 3,
    description: "Stun a monster for 1 turn.",
    effects: [{ type: "stun", value: 1, target: "monster", duration: 1 }],
  },
  {
    id: "fighter-25",
    name: "Fortify",
    class: "fighter",
    rarity: "common",
    aggro: 1,
    description: "Gain 6 shield and Taunt for 1 turn.",
    effects: [
      { type: "shield", value: 6, target: "self" },
      { type: "taunt", value: 1, target: "self", duration: 1 },
    ],
  },
  // Advanced cards (11-15)
  {
    id: "fighter-11",
    name: "Blade Sweep",
    class: "fighter",
    rarity: "uncommon",
    aggro: 4,
    description: "Deal 8 damage to all monsters.",
    effects: [{ type: "damage", value: 8, target: "allMonsters" }],
  },
  {
    id: "fighter-12",
    name: "Final Stand",
    class: "fighter",
    rarity: "rare",
    aggro: 5,
    description: "Gain 20 shield and Taunt for 2 turns.",
    effects: [
      { type: "shield", value: 20, target: "self" },
      { type: "taunt", value: 1, target: "self", duration: 2 },
    ],
  },
  {
    id: "fighter-13",
    name: "Intimidate",
    class: "fighter",
    rarity: "uncommon",
    aggro: 3,
    description: "Apply 3 Weakness to all monsters for 2 turns.",
    effects: [
      { type: "weakness", value: 3, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "fighter-14",
    name: "Siphoning Blow",
    class: "fighter",
    rarity: "rare",
    aggro: 4,
    description: "Deal 12 damage and heal for 6.",
    effects: [
      { type: "damage", value: 12, target: "monster" },
      { type: "heal", value: 6, target: "self" },
    ],
  },
  {
    id: "fighter-15",
    name: "Riposte",
    class: "fighter",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 30 damage. Prevent all damage to you this turn. This card has priority.",
    effects: [
      { type: "damage", value: 30, target: "monster" },
      { type: "block", value: 1, target: "self", duration: 1 },
    ],
  },
  // Legendary cards (16-20)
  {
    id: "fighter-16",
    name: "Juggernaut",
    class: "fighter",
    rarity: "legendary",
    aggro: 7,
    description: "Deal 40 damage and gain 15 shield. Cannot be stunned this turn.",
    effects: [
      { type: "damage", value: 40, target: "monster" },
      { type: "shield", value: 15, target: "self" },
    ],
  },
  {
    id: "fighter-17",
    name: "Warlord's Command",
    class: "fighter",
    rarity: "legendary",
    aggro: 5,
    description: "All allies gain 6 Strength and 8 shield for 2 turns.",
    effects: [
      { type: "strength", value: 6, target: "allAllies", duration: 2 },
      { type: "shield", value: 8, target: "allAllies" },
    ],
  },
  {
    id: "fighter-18",
    name: "Bladestorm",
    class: "fighter",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 18 damage to all monsters twice.",
    effects: [
      { type: "damage", value: 18, target: "allMonsters" },
      { type: "damage", value: 18, target: "allMonsters" },
    ],
  },
  {
    id: "fighter-19",
    name: "Immortal Stand",
    class: "fighter",
    rarity: "legendary",
    aggro: 4,
    description: "Gain 30 shield, Taunt for 2 turns, and heal 15 HP.",
    effects: [
      { type: "shield", value: 30, target: "self" },
      { type: "taunt", value: 1, target: "self", duration: 2 },
      { type: "heal", value: 15, target: "self" },
    ],
  },
  {
    id: "fighter-20",
    name: "Champion's Fury",
    class: "fighter",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 35 damage and gain 8 Strength for 2 turns.",
    effects: [
      { type: "damage", value: 35, target: "monster" },
      { type: "strength", value: 8, target: "self", duration: 2 },
    ],
  },
];

// ============================================
// ROGUE CARDS (15 cards)
// ============================================
const rogueCards: Card[] = [
  // ============================================
  // COMMON (7 cards)
  // ============================================
  {
    id: "rogue-1",
    name: "Shadowstep",
    class: "rogue",
    rarity: "common",
    aggro: 0,
    description: "Gain Stealth for 1 turn.",
    effects: [{ type: "stealth", value: 1, target: "self", duration: 1 }],
  },
  {
    id: "rogue-2",
    name: "Apply Poison",
    class: "rogue",
    rarity: "common",
    aggro: 1,
    description: "Your next 3 damaging cards apply 3 Poison for 3 turns. (+1 poison/tick if stealthed)",
    effects: [{ type: "strength", value: 3, target: "self", duration: 3 }], // TODO: Implement poison buff mechanic
  },
  {
    id: "rogue-3",
    name: "Stab",
    class: "rogue",
    rarity: "common",
    aggro: 1,
    description: "Deal 8 damage. (+4 if stealthed or target stunned)",
    effects: [{ type: "damage", value: 8, target: "monster" }],
  },
  {
    id: "rogue-4",
    name: "Cloak of Shadows",
    class: "rogue",
    rarity: "common",
    aggro: 0,
    description: "Gain 5 shield and Stealth for 1 turn.",
    effects: [
      { type: "shield", value: 5, target: "self" },
      { type: "stealth", value: 1, target: "self", duration: 1 },
    ],
  },
  {
    id: "rogue-5",
    name: "Venomous Strike",
    class: "rogue",
    rarity: "common",
    aggro: 2,
    description: "Deal 5 damage and apply 3 Poison for 2 turns. (+1 poison/tick if stealthed)",
    effects: [
      { type: "damage", value: 5, target: "monster" },
      { type: "poison", value: 3, target: "monster", duration: 2 },
    ],
  },
  {
    id: "rogue-6",
    name: "Double Strike",
    class: "rogue",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage twice. (+1 extra hit if stealthed)",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "damage", value: 6, target: "monster" },
    ],
  },
  {
    id: "rogue-7",
    name: "Distraction",
    class: "rogue",
    rarity: "common",
    aggro: 0,
    description: "Reduce your aggro significantly for your next 2 cards.",
    effects: [{ type: "stealth", value: 1, target: "self", duration: 2 }], // TODO: Implement aggro reduction mechanic
  },
  // ============================================
  // UNCOMMON (6 cards)
  // ============================================
  {
    id: "rogue-8",
    name: "Sneak Attack",
    class: "rogue",
    rarity: "uncommon",
    aggro: 1,
    description: "Deal 10 damage. (+5 if stealthed or target stunned)",
    effects: [{ type: "damage", value: 10, target: "monster" }],
  },
  {
    id: "rogue-9",
    name: "Dagger Cleave",
    class: "rogue",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 4 damage to all monsters. (+2 AOE damage if stealthed)",
    effects: [{ type: "damage", value: 4, target: "allMonsters" }],
  },
  {
    id: "rogue-10",
    name: "Hit 'em Where It Hurts",
    class: "rogue",
    rarity: "uncommon",
    aggro: 1,
    description: "Deal 6 damage and apply 2 Weakness for 2 turns. (+1 turn stun if stealthed)",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "weakness", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "rogue-11",
    name: "Pocket Sand",
    class: "rogue",
    rarity: "uncommon",
    aggro: 0,
    description: "Gain Stealth for 1 turn and apply 1 Weakness to all enemies for 1 turn.",
    effects: [
      { type: "stealth", value: 1, target: "self", duration: 1 },
      { type: "weakness", value: 1, target: "allMonsters", duration: 1 },
    ],
  },
  {
    id: "rogue-12",
    name: "Toxic Swipe",
    class: "rogue",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 3 damage to all monsters and apply 3 Poison for 3 turns. (+1 poison/tick if stealthed)",
    effects: [
      { type: "damage", value: 3, target: "allMonsters" },
      { type: "poison", value: 3, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "rogue-13",
    name: "Night Walk",
    class: "rogue",
    rarity: "uncommon",
    aggro: 0,
    description: "Gain Stealth for 1 turn and 8 shield.",
    effects: [
      { type: "stealth", value: 1, target: "self", duration: 1 },
      { type: "shield", value: 8, target: "self" },
    ],
  },
  // ============================================
  // RARE (5 cards)
  // ============================================
  {
    id: "rogue-14",
    name: "Night Blade",
    class: "rogue",
    rarity: "rare",
    aggro: 2,
    description: "Deal 18 damage and gain Stealth for 1 turn. (+8 damage if stealthed)",
    effects: [
      { type: "damage", value: 18, target: "monster" },
      { type: "stealth", value: 1, target: "self", duration: 1 },
    ],
  },
  {
    id: "rogue-15",
    name: "Blinding Strike",
    class: "rogue",
    rarity: "rare",
    aggro: 2,
    description: "Deal 12 damage and apply 2 Accuracy penalty for 2 turns. (+1 turn if stealthed)",
    effects: [
      { type: "damage", value: 12, target: "monster" },
      { type: "accuracy", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "rogue-16",
    name: "Toxic Strike",
    class: "rogue",
    rarity: "rare",
    aggro: 1,
    description: "Deal 1 damage and apply 6 Poison for 4 turns. (+1 turn if stealthed)",
    effects: [
      { type: "damage", value: 1, target: "monster" },
      { type: "poison", value: 6, target: "monster", duration: 4 },
    ],
  },
  {
    id: "rogue-17",
    name: "Acid Splash",
    class: "rogue",
    rarity: "rare",
    aggro: 2,
    description: "Deal 5 AOE damage and apply 2 Poison for 2 turns. (+1 turn if stealthed)",
    effects: [
      { type: "damage", value: 5, target: "allMonsters" },
      { type: "poison", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "rogue-18",
    name: "Open a Bounty",
    class: "rogue",
    rarity: "rare",
    aggro: 1,
    description: "Mark an enemy: gain bonus gold if you get the killing blow.",
    effects: [{ type: "weakness", value: 2, target: "monster", duration: 99 }], // TODO: Implement bounty mechanic
  },
  // ============================================
  // LEGENDARY (4 cards)
  // ============================================
  {
    id: "rogue-19",
    name: "Secret Recipe",
    class: "rogue",
    rarity: "legendary",
    aggro: 3,
    description: "Deal 10 damage and apply 10 Poison for 4 turns. (+4 Weakness 4 turns if stealthed)",
    effects: [
      { type: "damage", value: 10, target: "monster" },
      { type: "poison", value: 10, target: "monster", duration: 4 },
    ],
  },
  {
    id: "rogue-20",
    name: "Toxic Cloud",
    class: "rogue",
    rarity: "legendary",
    aggro: 4,
    description: "Deal 15 damage to all monsters and apply 5 Poison for 4 turns. (+1 poison/tick if stealthed)",
    effects: [
      { type: "damage", value: 15, target: "allMonsters" },
      { type: "poison", value: 5, target: "allMonsters", duration: 4 },
    ],
  },
  {
    id: "rogue-21",
    name: "Deathblow",
    class: "rogue",
    rarity: "legendary",
    aggro: 3,
    description: "Deal 40 damage. (+20 damage if stealthed)",
    effects: [{ type: "damage", value: 40, target: "monster" }],
  },
  {
    id: "rogue-22",
    name: "Umbral Shroud",
    class: "rogue",
    rarity: "legendary",
    aggro: 1,
    description: "All allies gain Stealth for 1 turn. Their next attack deals +10 damage.",
    effects: [
      { type: "stealth", value: 1, target: "allAllies", duration: 1 },
      { type: "strength", value: 10, target: "allAllies", duration: 1 },
    ],
  },
];

// ============================================
// PALADIN CARDS (22 cards) - Faith Scaling mechanic
// Core Mechanic: Cards gain bonuses at 50% Faith (4+) and 100% Faith (8)
// ============================================
const paladinCards: Card[] = [
  // ============================================
  // COMMON (7 cards)
  // ============================================
  {
    id: "paladin-1",
    name: "Shield Bash",
    class: "paladin",
    rarity: "common",
    aggro: 3,
    description: "Deal 6 damage and Stun for 1 turn. Faith 50%: +3 damage. Faith 100%: +1 turn stun.",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
    ],
  },
  {
    id: "paladin-2",
    name: "Blessed Shield",
    class: "paladin",
    rarity: "common",
    aggro: 2,
    description: "Gain 10 shield. Faith 50%: +4 shield. Faith 100%: +5 heal.",
    effects: [{ type: "shield", value: 10, target: "self" }],
  },
  {
    id: "paladin-3",
    name: "Healing Word",
    class: "paladin",
    rarity: "common",
    aggro: 1,
    description: "Heal an ally for 12 HP. Faith 50%: +4 shield. Faith 100%: +cleanse.",
    effects: [{ type: "heal", value: 12, target: "ally" }],
  },
  {
    id: "paladin-4",
    name: "Righteous Blow",
    class: "paladin",
    rarity: "common",
    aggro: 2,
    description: "Deal 9 damage. Faith 50%: +4 self heal. Faith 100%: +5 damage.",
    effects: [{ type: "damage", value: 9, target: "monster" }],
  },
  {
    id: "paladin-5",
    name: "Prayer of Mending",
    class: "paladin",
    rarity: "common",
    aggro: 1,
    description: "Heal all allies for 5 HP. Faith 50%: +3 shield to all. Faith 100%: +3 AOE damage.",
    effects: [{ type: "heal", value: 5, target: "allAllies" }],
  },
  {
    id: "paladin-6",
    name: "Lesser Smite",
    class: "paladin",
    rarity: "common",
    aggro: 2,
    description: "Deal 8 damage (+4 vs undead/demons). Faith 50%: +4 self heal. Faith 100%: +4 damage.",
    effects: [{ type: "damage", value: 8, target: "monster" }],
  },
  {
    id: "paladin-7",
    name: "Inspiring Blow",
    class: "paladin",
    rarity: "common",
    aggro: 2,
    description: "Deal 7 damage. An ally gains +2 Strength for 1 turn. Faith 50%: +3 heal. Faith 100%: +4 damage.",
    effects: [
      { type: "damage", value: 7, target: "monster" },
      { type: "strength", value: 2, target: "ally", duration: 1 },
    ],
  },
  // ============================================
  // UNCOMMON (6 cards)
  // ============================================
  {
    id: "paladin-8",
    name: "Consecrate Ground",
    class: "paladin",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 5 AOE damage. Apply 3 Burn for 3 turns to all enemies. Faith 50%: +5 AOE heal. Faith 100%: +3 AOE damage.",
    effects: [
      { type: "damage", value: 5, target: "allMonsters" },
      { type: "burn", value: 3, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "paladin-9",
    name: "Bless Armor",
    class: "paladin",
    rarity: "uncommon",
    aggro: 2,
    description: "Give an ally 12 shield. Faith 50%: +5 heal. Faith 100%: +Block for 1 turn.",
    effects: [{ type: "shield", value: 12, target: "ally" }],
  },
  {
    id: "paladin-10",
    name: "Heal Sickness",
    class: "paladin",
    rarity: "uncommon",
    aggro: 1,
    description: "Cleanse all debuffs from an ally. Faith 50%: +8 heal. Faith 100%: +3 Strength for 1 turn.",
    effects: [{ type: "cleanse", target: "ally" }],
  },
  {
    id: "paladin-11",
    name: "Holy Strike",
    class: "paladin",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 10 damage and heal self for 6. Faith 50%: +4 damage. Faith 100%: +4 heal.",
    effects: [
      { type: "damage", value: 10, target: "monster" },
      { type: "heal", value: 6, target: "self" },
    ],
  },
  {
    id: "paladin-12",
    name: "Greater Smite",
    class: "paladin",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 6 AOE damage (+3 vs undead/demons). Faith 50%: +5 self heal. Faith 100%: +4 AOE damage.",
    effects: [{ type: "damage", value: 6, target: "allMonsters" }],
  },
  {
    id: "paladin-13",
    name: "Turn Evil",
    class: "paladin",
    rarity: "uncommon",
    aggro: 2,
    description: "Stun a monster for 1 turn. Apply 3 Weakness for 2 turns. Faith 50%: +5 damage. Faith 100%: Weakness lasts 3 turns.",
    effects: [
      { type: "stun", value: 1, target: "monster", duration: 1 },
      { type: "weakness", value: 3, target: "monster", duration: 2 },
    ],
  },
  // ============================================
  // RARE (5 cards)
  // ============================================
  {
    id: "paladin-14",
    name: "Blinding Light",
    class: "paladin",
    rarity: "rare",
    aggro: 4,
    description: "Deal 8 AOE damage and stun all enemies for 1 turn. Faith 50%: +2 AOE Weakness 2 turns. Faith 100%: +6 AOE heal.",
    effects: [
      { type: "damage", value: 8, target: "allMonsters" },
      { type: "stun", value: 1, target: "allMonsters", duration: 1 },
    ],
  },
  {
    id: "paladin-15",
    name: "Test of Faith",
    class: "paladin",
    rarity: "rare",
    aggro: 5,
    description: "Gain 15 shield and Taunt for 2 turns. Faith 50%: +8 damage to attacker. Faith 100%: AOE Taunt.",
    effects: [
      { type: "shield", value: 15, target: "self" },
      { type: "taunt", value: 1, target: "self", duration: 2 },
    ],
  },
  {
    id: "paladin-16",
    name: "Resurrect",
    class: "paladin",
    rarity: "rare",
    aggro: 3,
    description: "Revive a fallen ally at 30% HP. Faith 50%: Revive at 50% HP. Faith 100%: +10 shield after revive.",
    effects: [{ type: "revive", value: 30, target: "ally" }],
  },
  {
    id: "paladin-17",
    name: "Righteous Aura",
    class: "paladin",
    rarity: "rare",
    aggro: 4,
    description: "All allies gain 10 shield. Faith 50%: +8 AOE heal. Faith 100%: +5 AOE damage.",
    effects: [{ type: "shield", value: 10, target: "allAllies" }],
  },
  {
    id: "paladin-18",
    name: "Righteous Judgment",
    class: "paladin",
    rarity: "rare",
    aggro: 4,
    description: "Deal 15 damage and apply 3 Weakness for 2 turns. Faith 50%: +6 damage. Faith 100%: +1 turn stun.",
    effects: [
      { type: "damage", value: 15, target: "monster" },
      { type: "weakness", value: 3, target: "monster", duration: 2 },
    ],
  },
  // ============================================
  // LEGENDARY (4 cards)
  // ============================================
  {
    id: "paladin-19",
    name: "Divine Shield",
    class: "paladin",
    rarity: "legendary",
    aggro: 3,
    description: "Become immune to damage and effects for 2 turns. Faith 50%: +10 heal. Faith 100%: +5 Strength for 2 turns.",
    effects: [{ type: "block", value: 1, target: "self", duration: 2 }],
  },
  {
    id: "paladin-20",
    name: "Archangel's Blessing",
    class: "paladin",
    rarity: "legendary",
    aggro: 5,
    description: "All allies gain +6 Strength for 2 turns. Faith 50%: Next attack applies 5 Burn for 3 turns. Faith 100%: Next attack heals for damage dealt.",
    effects: [{ type: "strength", value: 6, target: "allAllies", duration: 2 }],
  },
  {
    id: "paladin-21",
    name: "Redeem Allies",
    class: "paladin",
    rarity: "legendary",
    aggro: 4,
    description: "Revive all fallen allies at 30% HP. Faith 50%: +8 shield after revive. Faith 100%: Revive at 50% HP.",
    effects: [{ type: "revive", value: 30, target: "allAllies" }],
  },
  {
    id: "paladin-22",
    name: "Divine Wrath",
    class: "paladin",
    rarity: "legendary",
    aggro: 7,
    description: "Deal 25 AOE damage and heal all allies for 15 HP. Faith 50%: +Consecrate Ground 3 turns. Faith 100%: +1 turn AOE stun.",
    effects: [
      { type: "damage", value: 25, target: "allMonsters" },
      { type: "heal", value: 15, target: "allAllies" },
    ],
  },
];

// ============================================
// MAGE CARDS (22 cards) - Mana Mastery mechanic
// Core Mechanic: Empowered (5+ mana) = cost +1, bonus effects
// Recovery (0-4 mana) = restore mana, weaker effects
// Mana costs: Common 1, Uncommon 2, Rare 3, Legendary 4, Utility 0
// ============================================
const mageCards: Card[] = [
  // ============================================
  // COMMON (7 cards) - 1 mana base
  // ============================================
  {
    id: "mage-1",
    name: "Arcane Bolt",
    class: "mage",
    rarity: "common",
    aggro: 2,
    description: "Deal 10 damage. Empowered: +4 damage. Depowered: -4 damage. [1 mana]",
    effects: [{ type: "damage", value: 10, target: "monster" }],
  },
  {
    id: "mage-2",
    name: "Magic Missile",
    class: "mage",
    rarity: "common",
    aggro: 2,
    description: "Deal 4 damage x3 to random enemies. Empowered: +1 missile. Depowered: -1 missile. [1 mana]",
    effects: [
      { type: "damage", value: 4, target: "monster" },
      { type: "damage", value: 4, target: "monster" },
      { type: "damage", value: 4, target: "monster" },
    ],
  },
  {
    id: "mage-3",
    name: "Mana Shield",
    class: "mage",
    rarity: "common",
    aggro: 1,
    description: "Gain 8 shield. Empowered: +4 shield. Depowered: -4 shield. [1 mana]",
    effects: [{ type: "shield", value: 8, target: "self" }],
  },
  {
    id: "mage-4",
    name: "Firebolt",
    class: "mage",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage + 2 Burn 2 turns. If has Burn: +1 Burn/tick. Empowered: +2 Burn/tick. Depowered: -1 Burn/tick. [1 mana]",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "burn", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "mage-5",
    name: "Ray of Frost",
    class: "mage",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage + 2 Ice 2 turns. If has Frost: +3 damage. Empowered: +2 damage. Depowered: -2 damage. [1 mana]",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "ice", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "mage-6",
    name: "Evocation",
    class: "mage",
    rarity: "common",
    aggro: 0,
    description: "Restore 3 mana. Empowered: Also +5 damage to next spell. [0 mana]",
    effects: [{ type: "heal", value: 3, target: "self" }], // TODO: Implement mana restore
  },
  {
    id: "mage-7",
    name: "Concentration",
    class: "mage",
    rarity: "common",
    aggro: 0,
    description: "Next spell is Empowered (even in Recovery). Empowered: Double next spell's Empowered bonus. [0 mana]",
    effects: [{ type: "strength", value: 1, target: "self", duration: 1 }], // TODO: Implement concentration buff
  },
  // ============================================
  // UNCOMMON (6 cards) - 2 mana base
  // ============================================
  {
    id: "mage-8",
    name: "Fireball",
    class: "mage",
    rarity: "uncommon",
    aggro: 4,
    description: "Deal 8 AOE damage + 2 Burn 2 turns. If has Burn: +2 Burn/tick. Empowered: +4 AOE damage. Depowered: -4 AOE damage. [2 mana]",
    effects: [
      { type: "damage", value: 8, target: "allMonsters" },
      { type: "burn", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "mage-9",
    name: "Icy Blast",
    class: "mage",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 8 AOE damage + 2 Ice 2 turns. If has Frost: +4 damage. Empowered: +1 Ice/tick. Depowered: -1 Ice/tick. [2 mana]",
    effects: [
      { type: "damage", value: 8, target: "allMonsters" },
      { type: "ice", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "mage-10",
    name: "Counterspell",
    class: "mage",
    rarity: "uncommon",
    aggro: 2,
    description: "Stun 1 enemy for 1 turn. Empowered: +1 turn stun. Depowered: No stun, apply 2 Weakness instead. [2 mana]",
    effects: [{ type: "stun", value: 1, target: "monster", duration: 1 }],
  },
  {
    id: "mage-11",
    name: "Magical Might",
    class: "mage",
    rarity: "uncommon",
    aggro: 2,
    description: "Grant ally or self +3 primary stat for 2 turns. Empowered: +2 stat. Depowered: -1 stat. [2 mana]",
    effects: [{ type: "strength", value: 3, target: "ally", duration: 2 }],
  },
  {
    id: "mage-12",
    name: "Mirror Image",
    class: "mage",
    rarity: "uncommon",
    aggro: 1,
    description: "Gain Taunt + Stealth for 1 turn. Empowered: +1 turn duration. Depowered: No Taunt, Stealth only. [2 mana]",
    effects: [
      { type: "taunt", value: 1, target: "self", duration: 1 },
      { type: "stealth", value: 1, target: "self", duration: 1 },
    ],
  },
  {
    id: "mage-13",
    name: "Arcane Explosion",
    class: "mage",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 5 AOE damage + 2 Vulnerable 2 turns. Empowered: +2 AOE damage. Depowered: -2 AOE damage. [2 mana]",
    effects: [
      { type: "damage", value: 5, target: "allMonsters" },
      { type: "vulnerable", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  // ============================================
  // RARE (5 cards) - 3 mana base
  // ============================================
  {
    id: "mage-14",
    name: "Shattering Lance",
    class: "mage",
    rarity: "rare",
    aggro: 4,
    description: "Deal 15 damage. Double damage if target has Frost. Empowered: +2 Frost duration. Depowered: Removes Frost. [3 mana]",
    effects: [{ type: "damage", value: 15, target: "monster" }],
  },
  {
    id: "mage-15",
    name: "Mana Bomb",
    class: "mage",
    rarity: "rare",
    aggro: 4,
    description: "Deal 12 damage + 6 splash to all + 2 Vulnerable 2 turns. Empowered: +4 primary, +2 splash. Depowered: -4 primary, -2 splash. [3 mana]",
    effects: [
      { type: "damage", value: 12, target: "monster" },
      { type: "damage", value: 6, target: "allMonsters" },
      { type: "vulnerable", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "mage-16",
    name: "Polymorph",
    class: "mage",
    rarity: "rare",
    aggro: 2,
    description: "Stun until damaged or 3 turns. Attack that breaks stun deals +10 bonus damage. Empowered: +5 bonus. Depowered: -5 bonus. [3 mana]",
    effects: [{ type: "stun", value: 1, target: "monster", duration: 3 }],
  },
  {
    id: "mage-17",
    name: "Invisibility",
    class: "mage",
    rarity: "rare",
    aggro: 0,
    description: "Stealth 1 turn + restore 4 mana. Empowered: Next attack +8 damage. Depowered: Next attack -4 damage. [3 mana]",
    effects: [{ type: "stealth", value: 1, target: "self", duration: 1 }],
  },
  {
    id: "mage-18",
    name: "Meteor",
    class: "mage",
    rarity: "rare",
    aggro: 5,
    description: "Deal 15 AOE damage + 3 Burn 3 turns. If has Burn: +3 Burn/tick. Empowered: +5 AOE damage. Depowered: -5 AOE damage. [3 mana]",
    effects: [
      { type: "damage", value: 15, target: "allMonsters" },
      { type: "burn", value: 3, target: "allMonsters", duration: 3 },
    ],
  },
  // ============================================
  // LEGENDARY (4 cards) - 4 mana base
  // ============================================
  {
    id: "mage-19",
    name: "Arcane Infusion",
    class: "mage",
    rarity: "legendary",
    aggro: 2,
    description: "Reset mana to 10 + next spell is Empowered. Empowered: Double next Empowered bonus. Depowered: +5 damage next spell. [4 mana]",
    effects: [{ type: "strength", value: 5, target: "self", duration: 1 }], // TODO: Implement mana reset
  },
  {
    id: "mage-20",
    name: "Inferno",
    class: "mage",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 20 AOE + 5 Burn 3 turns. If has Burn: +10 damage, +4 Burn/tick. Empowered: +5 AOE damage. Depowered: -5 AOE damage. [4 mana]",
    effects: [
      { type: "damage", value: 20, target: "allMonsters" },
      { type: "burn", value: 5, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "mage-21",
    name: "Blizzard",
    class: "mage",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 20 AOE + 5 Ice 3 turns. If has Frost: +20 damage, +2 Ice/tick. Empowered: +5 AOE damage. Depowered: -5 AOE damage. [4 mana]",
    effects: [
      { type: "damage", value: 20, target: "allMonsters" },
      { type: "ice", value: 5, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "mage-22",
    name: "Arcane Torrent",
    class: "mage",
    rarity: "legendary",
    aggro: 5,
    description: "Fire 10 missiles (3 damage each). Each applies 1 Vulnerable 1 turn. Empowered: +2 missiles. Depowered: -4 missiles. [4 mana]",
    effects: [
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "damage", value: 3, target: "monster" },
      { type: "vulnerable", value: 1, target: "monster", duration: 1 },
    ],
  },
];

// ============================================
// CLERIC CARDS (22 cards) - Prayer Cycle mechanic
// Card Types: Judgment (damage/debuff), Benediction (heal/shield/buff/cleanse/revive), Hybrid (both)
// ============================================
const clericCards: Card[] = [
  // ============================================
  // COMMON (7 cards)
  // ============================================
  {
    id: "cleric-1",
    name: "Sacred Flame",
    class: "cleric",
    rarity: "common",
    aggro: 2,
    description: "Deal 8 damage + 2 Burn 2 turns. [Judgment]",
    effects: [
      { type: "damage", value: 8, target: "monster" },
      { type: "burn", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "cleric-2",
    name: "Admonish Wickedness",
    class: "cleric",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage + 2 Weakness 2 turns. [Judgment]",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "weakness", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "cleric-3",
    name: "Cure Wounds",
    class: "cleric",
    rarity: "common",
    aggro: 1,
    description: "Heal ally 12 HP. [Benediction]",
    effects: [{ type: "heal", value: 12, target: "ally" }],
  },
  {
    id: "cleric-4",
    name: "Healing Word",
    class: "cleric",
    rarity: "common",
    aggro: 1,
    description: "Heal all allies 5 HP. [Benediction]",
    effects: [{ type: "heal", value: 5, target: "allAllies" }],
  },
  {
    id: "cleric-5",
    name: "Prayer of Protection",
    class: "cleric",
    rarity: "common",
    aggro: 1,
    description: "Grant ally 10 shield. [Benediction]",
    effects: [{ type: "shield", value: 10, target: "ally" }],
  },
  {
    id: "cleric-6",
    name: "Bless",
    class: "cleric",
    rarity: "common",
    aggro: 1,
    description: "Grant ally +3 Strength 2 turns. [Benediction]",
    effects: [{ type: "strength", value: 3, target: "ally", duration: 2 }],
  },
  {
    id: "cleric-7",
    name: "Righteous Reprimand",
    class: "cleric",
    rarity: "common",
    aggro: 2,
    description: "Deal 5 damage + heal self 5 HP. [Hybrid]",
    effects: [
      { type: "damage", value: 5, target: "monster" },
      { type: "heal", value: 5, target: "self" },
    ],
  },
  // ============================================
  // UNCOMMON (6 cards)
  // ============================================
  {
    id: "cleric-8",
    name: "Pillar of Light",
    class: "cleric",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 10 damage + Stun 1 turn + 2 Weakness AOE 1 turn. [Judgment]",
    effects: [
      { type: "damage", value: 10, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
      { type: "weakness", value: 2, target: "allMonsters", duration: 1 },
    ],
  },
  {
    id: "cleric-9",
    name: "Deific Blast",
    class: "cleric",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 6 AOE damage. [Judgment]",
    effects: [{ type: "damage", value: 6, target: "allMonsters" }],
  },
  {
    id: "cleric-10",
    name: "Prayer of Healing",
    class: "cleric",
    rarity: "uncommon",
    aggro: 1,
    description: "Heal all allies 8 HP. [Benediction]",
    effects: [{ type: "heal", value: 8, target: "allAllies" }],
  },
  {
    id: "cleric-11",
    name: "Purity Seal",
    class: "cleric",
    rarity: "uncommon",
    aggro: 2,
    description: "Grant ally +3 Strength 2 turns + 8 shield (reapplies 2 turns). [Benediction]",
    effects: [
      { type: "strength", value: 3, target: "ally", duration: 2 },
      { type: "shield", value: 8, target: "ally" },
    ],
  },
  {
    id: "cleric-12",
    name: "Holy Fire",
    class: "cleric",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 8 damage + heal lowest ally 8 HP. [Hybrid]",
    effects: [
      { type: "damage", value: 8, target: "monster" },
      { type: "heal", value: 8, target: "ally" },
    ],
  },
  {
    id: "cleric-13",
    name: "Angelic Assist",
    class: "cleric",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 10 damage + grant self 6 shield. [Hybrid]",
    effects: [
      { type: "damage", value: 10, target: "monster" },
      { type: "shield", value: 6, target: "self" },
    ],
  },
  // ============================================
  // RARE (5 cards)
  // ============================================
  {
    id: "cleric-14",
    name: "War Angel's Sermon",
    class: "cleric",
    rarity: "rare",
    aggro: 4,
    description: "Deal 12 AOE damage + 2 Vulnerable 2 turns. [Judgment]",
    effects: [
      { type: "damage", value: 12, target: "allMonsters" },
      { type: "vulnerable", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "cleric-15",
    name: "Penance",
    class: "cleric",
    rarity: "rare",
    aggro: 3,
    description: "Deal 10 damage to enemy (5 to self) + transfer all debuffs to enemy. [Judgment]",
    effects: [
      { type: "damage", value: 10, target: "monster" },
      { type: "damage", value: 5, target: "self" },
      { type: "cleanse", target: "self" },
    ],
  },
  {
    id: "cleric-16",
    name: "Purifying Light",
    class: "cleric",
    rarity: "rare",
    aggro: 2,
    description: "Heal all allies 12 HP + cleanse. [Benediction]",
    effects: [
      { type: "heal", value: 12, target: "allAllies" },
      { type: "cleanse", target: "allAllies" },
    ],
  },
  {
    id: "cleric-17",
    name: "Revivify",
    class: "cleric",
    rarity: "rare",
    aggro: 3,
    description: "Revive ally at 40% HP. [Benediction]",
    effects: [{ type: "revive", value: 40, target: "ally" }],
  },
  {
    id: "cleric-18",
    name: "Holy Nova",
    class: "cleric",
    rarity: "rare",
    aggro: 4,
    description: "Deal 12 AOE damage + heal all allies 10 HP. [Hybrid]",
    effects: [
      { type: "damage", value: 12, target: "allMonsters" },
      { type: "heal", value: 10, target: "allAllies" },
    ],
  },
  // ============================================
  // LEGENDARY (4 cards)
  // ============================================
  {
    id: "cleric-19",
    name: "Damnation",
    class: "cleric",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 20 AOE damage. Below 25% HP: instant death. Above: 4 Burn 3 turns. [Judgment]",
    effects: [
      { type: "damage", value: 20, target: "allMonsters" },
      { type: "burn", value: 4, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "cleric-20",
    name: "Archangel's Descent",
    class: "cleric",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 20 AOE damage + heal all 15 HP + Stun enemies 1 turn + cleanse allies. [Hybrid]",
    effects: [
      { type: "damage", value: 20, target: "allMonsters" },
      { type: "heal", value: 15, target: "allAllies" },
      { type: "stun", value: 1, target: "allMonsters", duration: 1 },
      { type: "cleanse", target: "allAllies" },
    ],
  },
  {
    id: "cleric-21",
    name: "Divine Intervention",
    class: "cleric",
    rarity: "legendary",
    aggro: 5,
    description: "Revive all fallen at 50% HP + heal all 20 HP. [Benediction]",
    effects: [
      { type: "revive", value: 50, target: "allAllies" },
      { type: "heal", value: 20, target: "allAllies" },
    ],
  },
  {
    id: "cleric-22",
    name: "Angelic Blessing",
    class: "cleric",
    rarity: "legendary",
    aggro: 4,
    description: "Heal ally 20 HP + 15 shield + +4 Strength 2 turns + cleanse. [Benediction]",
    effects: [
      { type: "heal", value: 20, target: "ally" },
      { type: "shield", value: 15, target: "ally" },
      { type: "strength", value: 4, target: "ally", duration: 2 },
      { type: "cleanse", target: "ally" },
    ],
  },
];

// ============================================
// BARD CARDS (22 cards) - Rhythm & Riot mechanic
// Song Types: Harmony (ally buffs), Riot (enemy debuffs)
// Matching song type: +1 stack. Opposite type: reset to 1.
// At 5 stacks: Crescendo triggers (special ability)
// ============================================
const bardCards: Card[] = [
  // ============================================
  // COMMON (7 cards) - 4 Harmony / 3 Riot
  // ============================================
  {
    id: "bard-1",
    name: "Vicious Mockery",
    class: "bard",
    rarity: "common",
    aggro: 1,
    description: "Deal 4 damage, apply Weakness 2 (2 turns). [Riot]",
    effects: [
      { type: "damage", value: 4, target: "monster" },
      { type: "weakness", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "bard-2",
    name: "Lean on Me",
    class: "bard",
    rarity: "common",
    aggro: 1,
    description: "Heal one ally for 12 HP. [Harmony]",
    effects: [{ type: "heal", value: 12, target: "ally" }],
  },
  {
    id: "bard-3",
    name: "Thunderstruck",
    class: "bard",
    rarity: "common",
    aggro: 2,
    description: "Deal 4 damage, Stun 1 turn. [Riot]",
    effects: [
      { type: "damage", value: 4, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
    ],
  },
  {
    id: "bard-4",
    name: "Eye of the Tiger",
    class: "bard",
    rarity: "common",
    aggro: 1,
    description: "Grant one ally +20% damage (2 turns). [Harmony]",
    effects: [{ type: "strength", value: 20, target: "ally", duration: 2 }],
  },
  {
    id: "bard-5",
    name: "Heal the World",
    class: "bard",
    rarity: "common",
    aggro: 1,
    description: "Heal all allies for 6 HP. [Harmony]",
    effects: [{ type: "heal", value: 6, target: "allAllies" }],
  },
  {
    id: "bard-6",
    name: "Shout",
    class: "bard",
    rarity: "common",
    aggro: 2,
    description: "Deal 4 damage to all enemies, apply Weakness 1 (1 turn) to all. [Riot]",
    effects: [
      { type: "damage", value: 4, target: "allMonsters" },
      { type: "weakness", value: 1, target: "allMonsters", duration: 1 },
    ],
  },
  {
    id: "bard-7",
    name: "Titanium",
    class: "bard",
    rarity: "common",
    aggro: 1,
    description: "Shield one ally for 10. [Harmony]",
    effects: [{ type: "shield", value: 10, target: "ally" }],
  },
  // ============================================
  // UNCOMMON (6 cards) - 3 Harmony / 3 Riot
  // ============================================
  {
    id: "bard-8",
    name: "Livin' on a Prayer",
    class: "bard",
    rarity: "uncommon",
    aggro: 1,
    description: "Heal one ally for 10 HP, Shield for 10. [Harmony]",
    effects: [
      { type: "heal", value: 10, target: "ally" },
      { type: "shield", value: 10, target: "ally" },
    ],
  },
  {
    id: "bard-9",
    name: "Bardic Inspiration",
    class: "bard",
    rarity: "uncommon",
    aggro: 1,
    description: "Grant one ally Inspired: next attack deals +50% damage. [Harmony]",
    effects: [{ type: "strength", value: 50, target: "ally", duration: 1 }],
  },
  {
    id: "bard-10",
    name: "We Are the Champions",
    class: "bard",
    rarity: "uncommon",
    aggro: 1,
    description: "Shield all allies for 8. [Harmony]",
    effects: [{ type: "shield", value: 8, target: "allAllies" }],
  },
  {
    id: "bard-11",
    name: "Another One Bites the Dust",
    class: "bard",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 4 damage. Instant kill if enemy below 20% HP. [Riot]",
    effects: [{ type: "damage", value: 4, target: "monster" }],
    // TODO: Implement execute mechanic
  },
  {
    id: "bard-12",
    name: "Poison",
    class: "bard",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 3 damage, apply Poison 3 (3 turns). [Riot]",
    effects: [
      { type: "damage", value: 3, target: "monster" },
      { type: "poison", value: 3, target: "monster", duration: 3 },
    ],
  },
  {
    id: "bard-13",
    name: "Enter Sandman",
    class: "bard",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 4 damage, Stun 1 turn, Weakness 1 (2 turns). [Riot]",
    effects: [
      { type: "damage", value: 4, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
      { type: "weakness", value: 1, target: "monster", duration: 2 },
    ],
  },
  // ============================================
  // RARE (5 cards) - 3 Harmony / 2 Riot
  // ============================================
  {
    id: "bard-14",
    name: "Sound of Silence",
    class: "bard",
    rarity: "rare",
    aggro: 3,
    description: "Stun all enemies for 1 turn. [Riot]",
    effects: [{ type: "stun", value: 1, target: "allMonsters", duration: 1 }],
  },
  {
    id: "bard-15",
    name: "Stayin' Alive",
    class: "bard",
    rarity: "rare",
    aggro: 2,
    description: "Grant one ally: if lethal damage this turn, survive at 1 HP and heal 20. [Harmony]",
    effects: [
      { type: "block", value: 1, target: "ally", duration: 1 },
      { type: "heal", value: 20, target: "ally" },
    ],
    // TODO: Implement death prevention mechanic
  },
  {
    id: "bard-16",
    name: "Here Comes the Sun",
    class: "bard",
    rarity: "rare",
    aggro: 1,
    description: "Heal all allies for 12 HP, cleanse all debuffs. [Harmony]",
    effects: [
      { type: "heal", value: 12, target: "allAllies" },
      { type: "cleanse", target: "allAllies" },
    ],
  },
  {
    id: "bard-17",
    name: "Paint It Black",
    class: "bard",
    rarity: "rare",
    aggro: 3,
    description: "Apply Vulnerable 2 + Weakness 2 + Burn 2 to all enemies (2 turns). [Riot]",
    effects: [
      { type: "vulnerable", value: 2, target: "allMonsters", duration: 2 },
      { type: "weakness", value: 2, target: "allMonsters", duration: 2 },
      { type: "burn", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "bard-18",
    name: "Don't Stop Believin'",
    class: "bard",
    rarity: "rare",
    aggro: 2,
    description: "Grant all allies +30% damage (2 turns). [Harmony]",
    effects: [{ type: "strength", value: 30, target: "allAllies", duration: 2 }],
  },
  // ============================================
  // LEGENDARY (4 cards) - 2 Harmony / 2 Riot
  // ============================================
  {
    id: "bard-19",
    name: "Holding Out for a Hero",
    class: "bard",
    rarity: "legendary",
    aggro: 3,
    description: "Heal all allies 15 HP, Shield all 15, +30% damage (2 turns). [Harmony]",
    effects: [
      { type: "heal", value: 15, target: "allAllies" },
      { type: "shield", value: 15, target: "allAllies" },
      { type: "strength", value: 30, target: "allAllies", duration: 2 },
    ],
  },
  {
    id: "bard-20",
    name: "Stairway to Heaven",
    class: "bard",
    rarity: "legendary",
    aggro: 4,
    description: "Revive all dead allies at 50% HP. [Harmony]",
    effects: [{ type: "revive", value: 50, target: "allAllies" }],
  },
  {
    id: "bard-21",
    name: "Killshot",
    class: "bard",
    rarity: "legendary",
    aggro: 4,
    description: "Apply Vulnerable 3 + Weakness 3 + Burn 3 to all enemies. [Riot]",
    effects: [
      { type: "vulnerable", value: 3, target: "allMonsters", duration: 3 },
      { type: "weakness", value: 3, target: "allMonsters", duration: 3 },
      { type: "burn", value: 3, target: "allMonsters", duration: 3 },
    ],
  },
  {
    id: "bard-22",
    name: "Comfortably Numb",
    class: "bard",
    rarity: "legendary",
    aggro: 4,
    description: "Stun all enemies for 2 turns. [Riot]",
    effects: [{ type: "stun", value: 1, target: "allMonsters", duration: 2 }],
  },
];

// ============================================
// ARCHER CARDS (22 cards) - Aim mechanic
// +10% crit per Aim stack. +1 Aim at end of turn.
// At 5 Aim: guaranteed 2.5x damage crit, then reset.
// ============================================
const archerCards: Card[] = [
  // ============================================
  // COMMON (7 cards)
  // ============================================
  {
    id: "archer-1",
    name: "Snipe Shot",
    class: "archer",
    rarity: "common",
    aggro: 1,
    description: "Deal 6 damage, +1 Aim.",
    effects: [{ type: "damage", value: 6, target: "monster" }],
    // TODO: +1 Aim handled in game logic
  },
  {
    id: "archer-2",
    name: "Quick Shot",
    class: "archer",
    rarity: "common",
    aggro: 2,
    description: "Deal 10 damage.",
    effects: [{ type: "damage", value: 10, target: "monster" }],
  },
  {
    id: "archer-3",
    name: "Poisoned Arrow",
    class: "archer",
    rarity: "common",
    aggro: 2,
    description: "Deal 5 damage, Poison 2 (2 turns).",
    effects: [
      { type: "damage", value: 5, target: "monster" },
      { type: "poison", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "archer-4",
    name: "Hunter's Mark",
    class: "archer",
    rarity: "common",
    aggro: 1,
    description: "+1 Aim, target takes +20% damage (2 turns).",
    effects: [{ type: "vulnerable", value: 20, target: "monster", duration: 2 }],
    // TODO: +1 Aim handled in game logic
  },
  {
    id: "archer-5",
    name: "Prepare Trap",
    class: "archer",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage, Vulnerable 1 (1 turn).",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "vulnerable", value: 1, target: "monster", duration: 1 },
    ],
  },
  {
    id: "archer-6",
    name: "Camouflage",
    class: "archer",
    rarity: "common",
    aggro: 0,
    description: "Gain Stealth 1 turn.",
    effects: [{ type: "stealth", value: 1, target: "self", duration: 1 }],
  },
  {
    id: "archer-7",
    name: "Barbed Arrow",
    class: "archer",
    rarity: "common",
    aggro: 2,
    description: "Deal 7 damage, Weakness 1 (1 turn).",
    effects: [
      { type: "damage", value: 7, target: "monster" },
      { type: "weakness", value: 1, target: "monster", duration: 1 },
    ],
  },
  // ============================================
  // UNCOMMON (6 cards)
  // ============================================
  {
    id: "archer-8",
    name: "Buckshot",
    class: "archer",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 6 damage to all enemies.",
    effects: [{ type: "damage", value: 6, target: "allMonsters" }],
  },
  {
    id: "archer-9",
    name: "Take Aim",
    class: "archer",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 12 damage, +2 Aim.",
    effects: [{ type: "damage", value: 12, target: "monster" }],
    // TODO: +2 Aim handled in game logic
  },
  {
    id: "archer-10",
    name: "Bear Trap",
    class: "archer",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 8 damage, Stun 1 turn.",
    effects: [
      { type: "damage", value: 8, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
    ],
  },
  {
    id: "archer-11",
    name: "Fiery Arrow",
    class: "archer",
    rarity: "uncommon",
    aggro: 2,
    description: "Deal 8 damage, Burn 2 (2 turns).",
    effects: [
      { type: "damage", value: 8, target: "monster" },
      { type: "burn", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "archer-12",
    name: "Freezing Trap",
    class: "archer",
    rarity: "uncommon",
    aggro: 3,
    description: "Stun all enemies 1 turn, Ice 2 (2 turns) to all.",
    effects: [
      { type: "stun", value: 1, target: "allMonsters", duration: 1 },
      { type: "ice", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "archer-13",
    name: "Hawkeye",
    class: "archer",
    rarity: "uncommon",
    aggro: 1,
    description: "+3 Aim, +20% damage (2 turns).",
    effects: [{ type: "strength", value: 20, target: "self", duration: 2 }],
    // TODO: +3 Aim handled in game logic
  },
  // ============================================
  // RARE (5 cards)
  // ============================================
  {
    id: "archer-14",
    name: "Piercing Shot",
    class: "archer",
    rarity: "rare",
    aggro: 3,
    description: "Deal 18 damage (ignores shields).",
    effects: [{ type: "damage", value: 18, target: "monster" }],
    // TODO: Ignore shields handled in game logic
  },
  {
    id: "archer-15",
    name: "Rain of Arrows",
    class: "archer",
    rarity: "rare",
    aggro: 4,
    description: "Deal 8 damage to all enemies, persists for 2 turns.",
    effects: [{ type: "damage", value: 8, target: "allMonsters" }],
    // TODO: Persist effect handled in game logic
  },
  {
    id: "archer-16",
    name: "Explosive Shot",
    class: "archer",
    rarity: "rare",
    aggro: 4,
    description: "Deal 10 damage to all enemies, Burn 2 (2 turns) to all.",
    effects: [
      { type: "damage", value: 10, target: "allMonsters" },
      { type: "burn", value: 2, target: "allMonsters", duration: 2 },
    ],
  },
  {
    id: "archer-17",
    name: "Arrow to the Knee",
    class: "archer",
    rarity: "rare",
    aggro: 2,
    description: "Stun 2 turns, Poison 2 (2 turns), Vulnerable 2 (2 turns).",
    effects: [
      { type: "stun", value: 1, target: "monster", duration: 2 },
      { type: "poison", value: 2, target: "monster", duration: 2 },
      { type: "vulnerable", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "archer-18",
    name: "Sniper's Nest",
    class: "archer",
    rarity: "rare",
    aggro: 1,
    description: "Gain Stealth 1 turn, next attack +50% damage.",
    effects: [
      { type: "stealth", value: 1, target: "self", duration: 1 },
      { type: "strength", value: 50, target: "self", duration: 1 },
    ],
  },
  // ============================================
  // LEGENDARY (4 cards)
  // ============================================
  {
    id: "archer-19",
    name: "Heartseeker",
    class: "archer",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 50 damage to one enemy, +2 Aim.",
    effects: [{ type: "damage", value: 50, target: "monster" }],
    // TODO: +2 Aim handled in game logic
  },
  {
    id: "archer-20",
    name: "AP Shot",
    class: "archer",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 35 damage (ignores shields), Deal 15 damage to all enemies.",
    effects: [
      { type: "damage", value: 35, target: "monster" },
      { type: "damage", value: 15, target: "allMonsters" },
    ],
    // TODO: Ignore shields on primary target handled in game logic
  },
  {
    id: "archer-21",
    name: "Black Arrow",
    class: "archer",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 20 damage (+30 vs Dragons), Poison 4 + Burn 4 + Vulnerable 3 (3 turns).",
    effects: [
      { type: "damage", value: 20, target: "monster" },
      { type: "poison", value: 4, target: "monster", duration: 3 },
      { type: "burn", value: 4, target: "monster", duration: 3 },
      { type: "vulnerable", value: 3, target: "monster", duration: 3 },
    ],
    // TODO: Dragon bonus damage handled in game logic
  },
  {
    id: "archer-22",
    name: "Giant Slayer",
    class: "archer",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 25 damage (+1 per 10 enemy max HP), +5 Aim.",
    effects: [{ type: "damage", value: 25, target: "monster" }],
    // TODO: HP scaling and +5 Aim handled in game logic
  },
];

// ============================================
// BARBARIAN CARDS (22 cards) - Blood Frenzy mechanic
// Lower HP = higher damage: 75-50% +25%, 50-25% +50%, <25% +100%
// Fury builds from taking/dealing damage. At max Fury: Bloodbath special.
// ============================================
const barbarianCards: Card[] = [
  // ============================================
  // COMMON (7 cards)
  // ============================================
  {
    id: "barbarian-1",
    name: "Reckless Attack",
    class: "barbarian",
    rarity: "common",
    aggro: 3,
    description: "Deal 14 damage, take 3 damage.",
    effects: [
      { type: "damage", value: 14, target: "monster" },
      { type: "damage", value: 3, target: "self" },
    ],
  },
  {
    id: "barbarian-2",
    name: "Blood Price",
    class: "barbarian",
    rarity: "common",
    aggro: 2,
    description: "Deal 6 damage, take 8 damage, +3 Fury.",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "damage", value: 8, target: "self" },
    ],
    // TODO: +3 Fury handled in game logic
  },
  {
    id: "barbarian-3",
    name: "Ground Slam",
    class: "barbarian",
    rarity: "common",
    aggro: 3,
    description: "Deal 5 damage to all enemies.",
    effects: [{ type: "damage", value: 5, target: "allMonsters" }],
  },
  {
    id: "barbarian-4",
    name: "Thick Skin",
    class: "barbarian",
    rarity: "common",
    aggro: 1,
    description: "Gain 12 shield.",
    effects: [{ type: "shield", value: 12, target: "self" }],
  },
  {
    id: "barbarian-5",
    name: "Skull Bash",
    class: "barbarian",
    rarity: "common",
    aggro: 3,
    description: "Deal 6 damage, Stun 1 turn.",
    effects: [
      { type: "damage", value: 6, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
    ],
  },
  {
    id: "barbarian-6",
    name: "Intimidate",
    class: "barbarian",
    rarity: "common",
    aggro: 2,
    description: "Deal 4 damage, Weakness 2 (2 turns).",
    effects: [
      { type: "damage", value: 4, target: "monster" },
      { type: "weakness", value: 2, target: "monster", duration: 2 },
    ],
  },
  {
    id: "barbarian-7",
    name: "Expose Weakness",
    class: "barbarian",
    rarity: "common",
    aggro: 2,
    description: "Apply Vulnerable 2 to enemy AND self (2 turns).",
    effects: [
      { type: "vulnerable", value: 2, target: "monster", duration: 2 },
      { type: "vulnerable", value: 2, target: "self", duration: 2 },
    ],
  },
  // ============================================
  // UNCOMMON (6 cards)
  // ============================================
  {
    id: "barbarian-8",
    name: "Cleave",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 4,
    description: "Deal 10 damage to all enemies, +1 Fury per enemy hit.",
    effects: [{ type: "damage", value: 10, target: "allMonsters" }],
    // TODO: +1 Fury per enemy hit handled in game logic
  },
  {
    id: "barbarian-9",
    name: "Bloodthirst",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 12 damage, heal for 6.",
    effects: [
      { type: "damage", value: 12, target: "monster" },
      { type: "heal", value: 6, target: "self" },
    ],
  },
  {
    id: "barbarian-10",
    name: "Berserker Rage",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 2,
    description: "+50% damage (next 2 attacks), immune to status effects (2 turns).",
    effects: [
      { type: "strength", value: 50, target: "self", duration: 2 },
      { type: "block", value: 1, target: "self", duration: 2 },
    ],
    // TODO: Status immunity handled in game logic
  },
  {
    id: "barbarian-11",
    name: "War Cry",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 2,
    description: "All allies +20% damage (next 2 attacks), +2 Fury.",
    effects: [{ type: "strength", value: 20, target: "allAllies", duration: 2 }],
    // TODO: +2 Fury handled in game logic
  },
  {
    id: "barbarian-12",
    name: "Final Blow",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 3,
    description: "Deal 10 damage, +15 damage if enemy below 50% HP.",
    effects: [{ type: "damage", value: 10, target: "monster" }],
    // TODO: Execute bonus handled in game logic
  },
  {
    id: "barbarian-13",
    name: "Frenzy",
    class: "barbarian",
    rarity: "uncommon",
    aggro: 4,
    description: "Deal 5 damage x3, take 4 damage.",
    effects: [
      { type: "damage", value: 5, target: "monster" },
      { type: "damage", value: 5, target: "monster" },
      { type: "damage", value: 5, target: "monster" },
      { type: "damage", value: 4, target: "self" },
    ],
  },
  // ============================================
  // RARE (5 cards)
  // ============================================
  {
    id: "barbarian-14",
    name: "Provoking Shout",
    class: "barbarian",
    rarity: "rare",
    aggro: 5,
    description: "Gain Taunt (1 turn), +15 shield.",
    effects: [
      { type: "taunt", value: 1, target: "self", duration: 1 },
      { type: "shield", value: 15, target: "self" },
    ],
  },
  {
    id: "barbarian-15",
    name: "Undying Rage",
    class: "barbarian",
    rarity: "rare",
    aggro: 3,
    description: "If lethal damage this turn, survive at 1 HP, +5 Fury.",
    effects: [{ type: "block", value: 1, target: "self", duration: 1 }],
    // TODO: Survive at 1 HP and +5 Fury handled in game logic
  },
  {
    id: "barbarian-16",
    name: "Blood Sacrifice",
    class: "barbarian",
    rarity: "rare",
    aggro: 3,
    description: "Take 15 damage, +50% damage (next 2 attacks), lifesteal (next 2 attacks).",
    effects: [
      { type: "damage", value: 15, target: "self" },
      { type: "strength", value: 50, target: "self", duration: 2 },
    ],
    // TODO: Lifesteal buff handled in game logic
  },
  {
    id: "barbarian-17",
    name: "Carnage",
    class: "barbarian",
    rarity: "rare",
    aggro: 4,
    description: "Deal 12 damage to all enemies, heal 4 per enemy hit.",
    effects: [{ type: "damage", value: 12, target: "allMonsters" }],
    // TODO: Heal per enemy hit handled in game logic
  },
  {
    id: "barbarian-18",
    name: "Berserking Slash",
    class: "barbarian",
    rarity: "rare",
    aggro: 4,
    description: "Deal 20 damage, +1 damage per 5% HP missing.",
    effects: [{ type: "damage", value: 20, target: "monster" }],
    // TODO: HP scaling handled in game logic
  },
  // ============================================
  // LEGENDARY (4 cards)
  // ============================================
  {
    id: "barbarian-19",
    name: "Rampage",
    class: "barbarian",
    rarity: "legendary",
    aggro: 6,
    description: "Deal 25 damage to all enemies, if any enemy dies, repeat this attack.",
    effects: [{ type: "damage", value: 25, target: "allMonsters" }],
    // TODO: Repeat on kill handled in game logic
  },
  {
    id: "barbarian-20",
    name: "Blood for the Blood God",
    class: "barbarian",
    rarity: "legendary",
    aggro: 5,
    description: "Take 20 damage, +100% damage (next 3 attacks), lifesteal (next 3 attacks), +5 Fury.",
    effects: [
      { type: "damage", value: 20, target: "self" },
      { type: "strength", value: 100, target: "self", duration: 3 },
    ],
    // TODO: Lifesteal and +5 Fury handled in game logic
  },
  {
    id: "barbarian-21",
    name: "Prey on the Weak",
    class: "barbarian",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 15 damage (+1 per 5% enemy HP missing), Stun 1 turn, Vulnerable 2 (2 turns), gain 15 shield, +3 Fury.",
    effects: [
      { type: "damage", value: 15, target: "monster" },
      { type: "stun", value: 1, target: "monster", duration: 1 },
      { type: "vulnerable", value: 2, target: "monster", duration: 2 },
      { type: "shield", value: 15, target: "self" },
    ],
    // TODO: HP scaling and +3 Fury handled in game logic
  },
  {
    id: "barbarian-22",
    name: "Death's Door",
    class: "barbarian",
    rarity: "legendary",
    aggro: 5,
    description: "Deal 30 damage (+2 per 5% self HP missing), heal for damage dealt.",
    effects: [{ type: "damage", value: 30, target: "monster" }],
    // TODO: HP scaling and lifesteal handled in game logic
  },
];

// ============================================
// ALL CARDS BY CLASS
// ============================================
export const CARDS_BY_CLASS: Record<ClassType, Card[]> = {
  fighter: fighterCards,
  rogue: rogueCards,
  paladin: paladinCards,
  mage: mageCards,
  cleric: clericCards,
  bard: bardCards,
  archer: archerCards,
  barbarian: barbarianCards,
};

export const getAllCards = (): Card[] => {
  return Object.values(CARDS_BY_CLASS).flat();
};

export const getCardsByClass = (classType: ClassType): Card[] => {
  return CARDS_BY_CLASS[classType] || [];
};
