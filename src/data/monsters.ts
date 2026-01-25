import type { Monster, MonsterAbility, EliteModifier } from "../types";
import { MONSTER_IMAGES } from "../assets/monsters";

// ============================================
// MONSTER TEMPLATES
// ============================================

interface MonsterTemplate {
  id: string;
  name: string;
  icon: string; // Emoji icon (fallback)
  baseHp: number;
  baseGoldReward: number; // Base gold reward for defeating
  baseXPReward: number; // Base XP reward for defeating
  abilities: MonsterAbility[];
}

// ============================================
// ELITE MODIFIER CONFIG
// ============================================
export interface EliteModifierConfig {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const ELITE_MODIFIERS: Record<EliteModifier, EliteModifierConfig> = {
  fast: {
    name: "Fast",
    icon: "\u26A1",
    description: "Acts twice per turn",
    color: "#fbbf24", // yellow
  },
  armored: {
    name: "Armored",
    icon: "\uD83D\uDEE1\uFE0F",
    description: "+50% HP, reduces damage taken by 25%",
    color: "#6b7280", // gray
  },
  enraged: {
    name: "Enraged",
    icon: "\uD83D\uDD25",
    description: "+50% damage dealt",
    color: "#ef4444", // red
  },
  regenerating: {
    name: "Regenerating",
    icon: "\uD83D\uDC9A",
    description: "Heals 10 HP per turn",
    color: "#22c55e", // green
  },
  cursed: {
    name: "Cursed",
    icon: "\uD83D\uDC80",
    description: "Applies random debuffs to attackers",
    color: "#a855f7", // purple
  },
  shielded: {
    name: "Shielded",
    icon: "\uD83D\uDD30",
    description: "Has shield that regenerates each turn",
    color: "#3b82f6", // blue
  },
};

// ============================================
// ARCANE MONSTERS
// ============================================

// ARCHMAGE - Powerful magic user
const archmageAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Channel Power",
    description: "The archmage gathers magical energy.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Arcane Bolt",
    description: "A bolt of pure arcane energy.",
    damage: 10,
    target: "single",
  },
  {
    roll: 3,
    name: "Mana Burn",
    description: "Burns away magical defenses.",
    damage: 8,
    target: "single",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Arcane Missiles",
    description: "Multiple missiles seek out targets.",
    damage: 6,
    target: "all",
  },
  {
    roll: 5,
    name: "Power Word: Pain",
    description: "A word of power that causes agony.",
    damage: 12,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 2 },
  },
  {
    roll: 6,
    name: "Meteor Strike",
    description: "Calls down a devastating meteor.",
    damage: 14,
    target: "all",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
];

// GLIMMERSHELL - Magical turtle creature
const glimmershellAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Retreat",
    description: "Hides in its glowing shell.",
    damage: -8,
    target: "single",
  },
  {
    roll: 2,
    name: "Shell Bash",
    description: "Rams with its hard shell.",
    damage: 7,
    target: "single",
  },
  {
    roll: 3,
    name: "Shimmer Spray",
    description: "Sprays blinding light particles.",
    damage: 5,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Crystal Spike",
    description: "Launches a crystalline projectile.",
    damage: 9,
    target: "single",
  },
  {
    roll: 5,
    name: "Prismatic Beam",
    description: "A beam of rainbow light.",
    damage: 8,
    target: "single",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Shell Nova",
    description: "Explodes with magical energy.",
    damage: 10,
    target: "all",
  },
];

// SLUGMANCER - Slug necromancer
const slugmancerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Slime Trail",
    description: "Leaves a trail of acidic slime.",
    damage: 0,
    target: "all",
    debuff: { type: "poison", value: 1, duration: 3 },
  },
  {
    roll: 2,
    name: "Acid Spit",
    description: "Spits corrosive acid.",
    damage: 6,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 3,
    name: "Dark Binding",
    description: "Tendrils of darkness grab a hero.",
    damage: 5,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Necrotic Wave",
    description: "A wave of death energy.",
    damage: 7,
    target: "all",
  },
  {
    roll: 5,
    name: "Soul Drain",
    description: "Drains life force.",
    damage: 8,
    target: "single",
  },
  {
    roll: 6,
    name: "Plague Cloud",
    description: "Releases a cloud of disease.",
    damage: 6,
    target: "all",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
];

// ============================================
// BEAST MONSTERS
// ============================================

// BAT - Fast flying attacker
const batAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Screech",
    description: "A disorienting screech.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Bite",
    description: "A quick bite attack.",
    damage: 5,
    target: "single",
  },
  {
    roll: 3,
    name: "Wing Slash",
    description: "Slashes with sharp wing edges.",
    damage: 6,
    target: "single",
  },
  {
    roll: 4,
    name: "Dive Attack",
    description: "Dives from above.",
    damage: 8,
    target: "random",
  },
  {
    roll: 5,
    name: "Blood Drain",
    description: "Drains blood to heal.",
    damage: 4,
    target: "single",
  },
  {
    roll: 6,
    name: "Swarm Strike",
    description: "Calls other bats to attack.",
    damage: 5,
    target: "all",
  },
];

// DIREWOLF - Fierce pack hunter
const direwolfAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Howl",
    description: "A terrifying howl.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Bite",
    description: "A powerful bite.",
    damage: 8,
    target: "single",
  },
  {
    roll: 3,
    name: "Claw Swipe",
    description: "Rakes with sharp claws.",
    damage: 7,
    target: "single",
  },
  {
    roll: 4,
    name: "Pounce",
    description: "Leaps at a target.",
    damage: 10,
    target: "random",
  },
  {
    roll: 5,
    name: "Savage Bite",
    description: "A vicious bite that causes bleeding.",
    damage: 9,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Pack Frenzy",
    description: "Goes into a hunting frenzy.",
    damage: 8,
    target: "all",
  },
];

// WHOLLY SPIDER - Giant venomous spider
const whollySpiderAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Web Shot",
    description: "Shoots sticky webbing.",
    damage: 0,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 2,
    name: "Fang Strike",
    description: "Bites with venomous fangs.",
    damage: 6,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 3,
    name: "Leg Slash",
    description: "Slashes with sharp legs.",
    damage: 7,
    target: "single",
  },
  {
    roll: 4,
    name: "Venom Spray",
    description: "Sprays venom at multiple targets.",
    damage: 5,
    target: "all",
    debuff: { type: "poison", value: 1, duration: 2 },
  },
  {
    roll: 5,
    name: "Cocoon",
    description: "Wraps a hero in webbing.",
    damage: 4,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Death Bite",
    description: "A deadly venomous bite.",
    damage: 10,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
];

// ============================================
// EARTH MONSTERS
// ============================================

// MUSHROOM - Poisonous fungus creature
const mushroomAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Spore Cloud",
    description: "Releases confusing spores.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Fungal Slap",
    description: "Slaps with a rubbery cap.",
    damage: 4,
    target: "single",
  },
  {
    roll: 3,
    name: "Toxic Spores",
    description: "Releases poisonous spores.",
    damage: 3,
    target: "all",
    debuff: { type: "poison", value: 2, duration: 3 },
  },
  {
    roll: 4,
    name: "Root Grab",
    description: "Roots grab at heroes.",
    damage: 5,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Decompose",
    description: "Spreads decay.",
    damage: 6,
    target: "single",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Mushroom Burst",
    description: "Explodes in a cloud of toxins.",
    damage: 7,
    target: "all",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
];

// ROCKMAN - Stone golem
const rockmanAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Stone Form",
    description: "Hardens body to heal.",
    damage: -10,
    target: "single",
  },
  {
    roll: 2,
    name: "Rock Punch",
    description: "A heavy stone fist.",
    damage: 10,
    target: "single",
  },
  {
    roll: 3,
    name: "Boulder Throw",
    description: "Throws a large boulder.",
    damage: 12,
    target: "random",
  },
  {
    roll: 4,
    name: "Ground Pound",
    description: "Slams the ground.",
    damage: 8,
    target: "all",
  },
  {
    roll: 5,
    name: "Crushing Grip",
    description: "Grabs and crushes a hero.",
    damage: 14,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Earthquake",
    description: "Causes a localized earthquake.",
    damage: 10,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
];

// THE BOULDER - Massive rock creature (Boss-tier)
const theBoulderAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Regenerate",
    description: "Reforms damaged rock.",
    damage: -15,
    target: "single",
  },
  {
    roll: 2,
    name: "Massive Slam",
    description: "A devastating slam attack.",
    damage: 16,
    target: "single",
  },
  {
    roll: 3,
    name: "Rock Slide",
    description: "Causes rocks to fall on all heroes.",
    damage: 10,
    target: "all",
  },
  {
    roll: 4,
    name: "Rolling Charge",
    description: "Rolls into heroes.",
    damage: 14,
    target: "all",
  },
  {
    roll: 5,
    name: "Seismic Toss",
    description: "Throws a hero.",
    damage: 18,
    target: "random",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Meteor Crash",
    description: "Leaps up and crashes down.",
    damage: 15,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
];

// ============================================
// MILITARY MONSTERS
// ============================================

// ARBALIST - Crossbow soldier
const arbalistAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Reload",
    description: "Reloads the crossbow.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Quick Shot",
    description: "A fast crossbow bolt.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Aimed Shot",
    description: "A carefully aimed shot.",
    damage: 10,
    target: "single",
  },
  {
    roll: 4,
    name: "Poison Bolt",
    description: "A bolt coated in poison.",
    damage: 7,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Multi-Shot",
    description: "Fires multiple bolts.",
    damage: 5,
    target: "all",
  },
  {
    roll: 6,
    name: "Piercing Shot",
    description: "A bolt that pierces armor.",
    damage: 12,
    target: "single",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
];

// CAPTAIN - Military leader
const captainAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Rally",
    description: "Rallies troops, healing self.",
    damage: -8,
    target: "single",
  },
  {
    roll: 2,
    name: "Sword Slash",
    description: "A skilled sword attack.",
    damage: 9,
    target: "single",
  },
  {
    roll: 3,
    name: "Shield Bash",
    description: "Bashes with a shield.",
    damage: 7,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "War Cry",
    description: "A demoralizing war cry.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Execute",
    description: "A brutal finishing move.",
    damage: 14,
    target: "single",
  },
  {
    roll: 6,
    name: "Command Strike",
    description: "Leads a coordinated attack.",
    damage: 8,
    target: "all",
  },
];

// SOLDIER - Basic military unit
const soldierAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Defensive Stance",
    description: "Takes a defensive position.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Spear Thrust",
    description: "Thrusts with a spear.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Shield Block",
    description: "Blocks and counterattacks.",
    damage: 5,
    target: "single",
  },
  {
    roll: 4,
    name: "Charge",
    description: "Charges at a hero.",
    damage: 8,
    target: "single",
  },
  {
    roll: 5,
    name: "Formation Strike",
    description: "Attacks in formation.",
    damage: 7,
    target: "single",
  },
  {
    roll: 6,
    name: "Sweep Attack",
    description: "Sweeps through enemies.",
    damage: 5,
    target: "all",
  },
];

// ============================================
// MYSTIC MONSTERS
// ============================================

// CHANNELER - Spirit medium
const channelerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Spirit Link",
    description: "Channels healing spirits.",
    damage: -6,
    target: "single",
  },
  {
    roll: 2,
    name: "Spirit Bolt",
    description: "A bolt of spirit energy.",
    damage: 7,
    target: "single",
  },
  {
    roll: 3,
    name: "Curse",
    description: "Places a curse on a hero.",
    damage: 4,
    target: "single",
    debuff: { type: "weakness", value: 2, duration: 3 },
  },
  {
    roll: 4,
    name: "Ghost Touch",
    description: "A chilling ghostly touch.",
    damage: 6,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Spirit Drain",
    description: "Drains life energy.",
    damage: 8,
    target: "single",
  },
  {
    roll: 6,
    name: "Summon Spirits",
    description: "Calls spirits to attack all.",
    damage: 6,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
];

// FORTUNETELLER - Mystical seer
const fortunetellerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Read Fate",
    description: "Glimpses the future.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Crystal Shard",
    description: "Throws a crystal shard.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Hex",
    description: "Places a hex on a hero.",
    damage: 4,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 3 },
  },
  {
    roll: 4,
    name: "Mind Blast",
    description: "A psychic attack.",
    damage: 8,
    target: "single",
  },
  {
    roll: 5,
    name: "Doom Prediction",
    description: "Predicts doom for a hero.",
    damage: 5,
    target: "single",
    debuff: { type: "weakness", value: 3, duration: 2 },
  },
  {
    roll: 6,
    name: "Fate Storm",
    description: "Reality warps around all heroes.",
    damage: 7,
    target: "all",
  },
];

// SEER - All-seeing mystic
const seerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Third Eye",
    description: "Opens the third eye to see weakness.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Vision Strike",
    description: "Strikes at a predicted location.",
    damage: 9,
    target: "single",
  },
  {
    roll: 3,
    name: "Blinding Light",
    description: "Emits blinding light.",
    damage: 5,
    target: "all",
    debuff: { type: "accuracy", value: 3, duration: 2 },
  },
  {
    roll: 4,
    name: "Psychic Scream",
    description: "A mental assault.",
    damage: 8,
    target: "all",
  },
  {
    roll: 5,
    name: "Future Sight",
    description: "Attacks with foreknowledge.",
    damage: 12,
    target: "single",
  },
  {
    roll: 6,
    name: "Reality Tear",
    description: "Tears at the fabric of reality.",
    damage: 10,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
];

// ============================================
// NATURE MONSTERS
// ============================================

// BIG BROOT - Giant tree creature
const bigBrootAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Root",
    description: "Takes root to heal.",
    damage: -12,
    target: "single",
  },
  {
    roll: 2,
    name: "Branch Whip",
    description: "Whips with a branch.",
    damage: 9,
    target: "single",
  },
  {
    roll: 3,
    name: "Root Grab",
    description: "Roots grab at heroes.",
    damage: 7,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Leaf Storm",
    description: "Sends leaves flying.",
    damage: 6,
    target: "all",
  },
  {
    roll: 5,
    name: "Crushing Grasp",
    description: "Crushes a hero in branches.",
    damage: 14,
    target: "single",
  },
  {
    roll: 6,
    name: "Nature's Wrath",
    description: "Unleashes nature's fury.",
    damage: 10,
    target: "all",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
];

// BUPLING - Small plant creature
const buplingAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Sprout",
    description: "Sprouts new leaves.",
    damage: -5,
    target: "single",
  },
  {
    roll: 2,
    name: "Seed Shot",
    description: "Shoots seeds at a hero.",
    damage: 4,
    target: "single",
  },
  {
    roll: 3,
    name: "Pollen Cloud",
    description: "Releases itchy pollen.",
    damage: 3,
    target: "all",
    debuff: { type: "accuracy", value: 1, duration: 2 },
  },
  {
    roll: 4,
    name: "Vine Whip",
    description: "Whips with a small vine.",
    damage: 5,
    target: "single",
  },
  {
    roll: 5,
    name: "Toxic Nectar",
    description: "Sprays toxic nectar.",
    damage: 4,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Overgrowth",
    description: "Causes rapid plant growth.",
    damage: 4,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
];

// BUTTERFLY - Mystical butterfly
const butterflyAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Dazzle",
    description: "Dazzles with beautiful wings.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Wing Dust",
    description: "Scatters magical dust.",
    damage: 4,
    target: "single",
    debuff: { type: "poison", value: 1, duration: 2 },
  },
  {
    roll: 3,
    name: "Flutter Strike",
    description: "A quick flutter attack.",
    damage: 5,
    target: "single",
  },
  {
    roll: 4,
    name: "Sleep Powder",
    description: "Releases sleep-inducing powder.",
    damage: 0,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Mystic Scales",
    description: "Scales cause burning.",
    damage: 6,
    target: "single",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Chaos Wings",
    description: "Wings cause reality distortion.",
    damage: 5,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
];

// ============================================
// OUTLAW MONSTERS
// ============================================

// BERSERKER - Rage-filled warrior
const berserkerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "War Cry",
    description: "Roars with battle rage.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Axe Swing",
    description: "A wild axe swing.",
    damage: 10,
    target: "single",
  },
  {
    roll: 3,
    name: "Rage Strike",
    description: "Attacks in a fury.",
    damage: 12,
    target: "single",
  },
  {
    roll: 4,
    name: "Whirlwind",
    description: "Spins with axe extended.",
    damage: 8,
    target: "all",
  },
  {
    roll: 5,
    name: "Blood Frenzy",
    description: "Enters a blood rage.",
    damage: 14,
    target: "single",
  },
  {
    roll: 6,
    name: "Rampage",
    description: "Goes on a destructive rampage.",
    damage: 10,
    target: "all",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
];

// BRAWLER - Street fighter
const brawlerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Taunt",
    description: "Taunts the heroes.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Punch",
    description: "A solid punch.",
    damage: 7,
    target: "single",
  },
  {
    roll: 3,
    name: "Kick",
    description: "A powerful kick.",
    damage: 8,
    target: "single",
  },
  {
    roll: 4,
    name: "Headbutt",
    description: "A stunning headbutt.",
    damage: 6,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Combo",
    description: "A series of punches.",
    damage: 11,
    target: "single",
  },
  {
    roll: 6,
    name: "Haymaker",
    description: "A devastating haymaker.",
    damage: 13,
    target: "single",
  },
];

// SCOUNDREL - Sneaky thief
const scoundrelAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Vanish",
    description: "Disappears into shadows.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Quick Stab",
    description: "A quick dagger stab.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Poison Blade",
    description: "Attacks with a poisoned blade.",
    damage: 5,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 2 },
  },
  {
    roll: 4,
    name: "Backstab",
    description: "Strikes from behind.",
    damage: 12,
    target: "random",
  },
  {
    roll: 5,
    name: "Dirty Trick",
    description: "Throws dirt in eyes.",
    damage: 4,
    target: "single",
    debuff: { type: "accuracy", value: 3, duration: 2 },
  },
  {
    roll: 6,
    name: "Assassinate",
    description: "A deadly precise strike.",
    damage: 14,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
];

// ============================================
// UNDEAD MONSTERS
// ============================================

// ECTOSKULL - Flying skull ghost
const ectoskullAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Haunt",
    description: "Haunts the heroes.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Skull Bash",
    description: "Rams with its skull.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Ghostly Wail",
    description: "A terrifying wail.",
    damage: 5,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Soul Drain",
    description: "Drains soul energy.",
    damage: 7,
    target: "single",
  },
  {
    roll: 5,
    name: "Ethereal Bite",
    description: "Bites with spectral teeth.",
    damage: 8,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Death Screech",
    description: "A deadly screech.",
    damage: 7,
    target: "all",
  },
];

// FALLEN WARRIOR - Undead knight
const fallenWarriorAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Undying Will",
    description: "Draws on undeath to heal.",
    damage: -8,
    target: "single",
  },
  {
    roll: 2,
    name: "Rusted Blade",
    description: "Slashes with a rusted sword.",
    damage: 9,
    target: "single",
    debuff: { type: "poison", value: 1, duration: 2 },
  },
  {
    roll: 3,
    name: "Shield Slam",
    description: "Slams with a battered shield.",
    damage: 7,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Death Strike",
    description: "A powerful undead strike.",
    damage: 12,
    target: "single",
  },
  {
    roll: 5,
    name: "Cursed Touch",
    description: "Spreads undeath.",
    damage: 6,
    target: "single",
    debuff: { type: "weakness", value: 2, duration: 3 },
  },
  {
    roll: 6,
    name: "Grave Cleave",
    description: "Cleaves through all heroes.",
    damage: 8,
    target: "all",
  },
];

// SPECTRE - Ghostly apparition
const spectreAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Phase",
    description: "Phases through attacks.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Life Drain",
    description: "Drains life force.",
    damage: 6,
    target: "single",
  },
  {
    roll: 3,
    name: "Spectral Touch",
    description: "A freezing touch.",
    damage: 7,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Fear Aura",
    description: "Emanates fear.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Soul Siphon",
    description: "Siphons soul energy.",
    damage: 9,
    target: "single",
  },
  {
    roll: 6,
    name: "Death Touch",
    description: "A touch of death.",
    damage: 12,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
];

// ============================================
// BOSS MONSTERS
// ============================================

// JEFFREY - Giant demon boss
const jeffreyAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Demonic Presence",
    description: "Aura of dread weakens all.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 3, duration: 2 },
  },
  {
    roll: 2,
    name: "Claw Rend",
    description: "Massive claws tear flesh.",
    damage: 16,
    target: "single",
  },
  {
    roll: 3,
    name: "Hellfire Breath",
    description: "Breathes hellfire on all.",
    damage: 12,
    target: "all",
    debuff: { type: "burn", value: 4, duration: 2 },
  },
  {
    roll: 4,
    name: "Tail Sweep",
    description: "Sweeps with massive tail.",
    damage: 10,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Soul Crush",
    description: "Crushes a hero's soul.",
    damage: 20,
    target: "random",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 6,
    name: "Apocalypse",
    description: "Brings forth apocalyptic fury.",
    damage: 15,
    target: "all",
    debuff: { type: "burn", value: 5, duration: 3 },
  },
];

// TOWER KNIGHT - Massive armored knight boss
const towerKnightAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Raise Shield",
    description: "Takes a defensive stance.",
    damage: -20,
    target: "single",
  },
  {
    roll: 2,
    name: "Colossal Slash",
    description: "A massive sword slash.",
    damage: 18,
    target: "single",
  },
  {
    roll: 3,
    name: "Shield Charge",
    description: "Charges with shield forward.",
    damage: 12,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Ground Slam",
    description: "Slams sword into ground.",
    damage: 14,
    target: "all",
  },
  {
    roll: 5,
    name: "Execute",
    description: "A devastating finishing blow.",
    damage: 22,
    target: "single",
  },
  {
    roll: 6,
    name: "Devastation",
    description: "Unleashes full power.",
    damage: 16,
    target: "all",
    debuff: { type: "weakness", value: 3, duration: 2 },
  },
];

// ============================================
// MONSTER TEMPLATES
// ============================================
export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  // Tier 1 - Early game (Rounds 1-2)
  {
    id: "bat",
    name: "Bat",
    icon: "\uD83E\uDD87",
    baseHp: 25,
    baseGoldReward: 5,
    baseXPReward: 12,
    abilities: batAbilities,
  },
  {
    id: "bupling",
    name: "Bupling",
    icon: "\uD83C\uDF31",
    baseHp: 30,
    baseGoldReward: 6,
    baseXPReward: 15,
    abilities: buplingAbilities,
  },
  {
    id: "mushroom",
    name: "Mushroom",
    icon: "\uD83C\uDF44",
    baseHp: 35,
    baseGoldReward: 7,
    baseXPReward: 18,
    abilities: mushroomAbilities,
  },
  {
    id: "soldier",
    name: "Soldier",
    icon: "\u2694\uFE0F",
    baseHp: 40,
    baseGoldReward: 8,
    baseXPReward: 20,
    abilities: soldierAbilities,
  },
  {
    id: "ectoskull",
    name: "Ectoskull",
    icon: "\uD83D\uDC80",
    baseHp: 30,
    baseGoldReward: 7,
    baseXPReward: 16,
    abilities: ectoskullAbilities,
  },

  // Tier 2 - Mid game (Rounds 2-3)
  {
    id: "direwolf",
    name: "Direwolf",
    icon: "\uD83D\uDC3A",
    baseHp: 50,
    baseGoldReward: 12,
    baseXPReward: 35,
    abilities: direwolfAbilities,
  },
  {
    id: "whollySpider",
    name: "Wholly Spider",
    icon: "\uD83D\uDD77\uFE0F",
    baseHp: 45,
    baseGoldReward: 11,
    baseXPReward: 32,
    abilities: whollySpiderAbilities,
  },
  {
    id: "butterfly",
    name: "Mystic Butterfly",
    icon: "\uD83E\uDD8B",
    baseHp: 40,
    baseGoldReward: 10,
    baseXPReward: 28,
    abilities: butterflyAbilities,
  },
  {
    id: "scoundrel",
    name: "Scoundrel",
    icon: "\uD83D\uDDE1\uFE0F",
    baseHp: 45,
    baseGoldReward: 14,
    baseXPReward: 38,
    abilities: scoundrelAbilities,
  },
  {
    id: "fallenWarrior",
    name: "Fallen Warrior",
    icon: "\u2620\uFE0F",
    baseHp: 55,
    baseGoldReward: 13,
    baseXPReward: 40,
    abilities: fallenWarriorAbilities,
  },

  // Tier 3 - Late game (Rounds 3-4)
  {
    id: "berserker",
    name: "Berserker",
    icon: "\uD83D\uDCA2",
    baseHp: 70,
    baseGoldReward: 18,
    baseXPReward: 55,
    abilities: berserkerAbilities,
  },
  {
    id: "brawler",
    name: "Brawler",
    icon: "\uD83E\uDD4A",
    baseHp: 75,
    baseGoldReward: 17,
    baseXPReward: 50,
    abilities: brawlerAbilities,
  },
  {
    id: "rockman",
    name: "Rockman",
    icon: "\uD83E\uDEA8",
    baseHp: 90,
    baseGoldReward: 20,
    baseXPReward: 60,
    abilities: rockmanAbilities,
  },
  {
    id: "spectre",
    name: "Spectre",
    icon: "\uD83D\uDC7B",
    baseHp: 60,
    baseGoldReward: 16,
    baseXPReward: 45,
    abilities: spectreAbilities,
  },

  // Tier 4 - Elite (Rounds 4-5)
  {
    id: "archmage",
    name: "Archmage",
    icon: "\uD83E\uDDD9",
    baseHp: 80,
    baseGoldReward: 25,
    baseXPReward: 80,
    abilities: archmageAbilities,
  },
  {
    id: "glimmershell",
    name: "Glimmershell",
    icon: "\uD83D\uDC22",
    baseHp: 100,
    baseGoldReward: 22,
    baseXPReward: 70,
    abilities: glimmershellAbilities,
  },
  {
    id: "slugmancer",
    name: "Slugmancer",
    icon: "\uD83D\uDC0C",
    baseHp: 85,
    baseGoldReward: 24,
    baseXPReward: 75,
    abilities: slugmancerAbilities,
  },
  {
    id: "bigBroot",
    name: "Big Broot",
    icon: "\uD83C\uDF33",
    baseHp: 120,
    baseGoldReward: 28,
    baseXPReward: 90,
    abilities: bigBrootAbilities,
  },
  {
    id: "captain",
    name: "Captain",
    icon: "\uD83C\uDFC5",
    baseHp: 90,
    baseGoldReward: 26,
    baseXPReward: 85,
    abilities: captainAbilities,
  },
  {
    id: "arbalist",
    name: "Arbalist",
    icon: "\uD83C\uDFF9",
    baseHp: 70,
    baseGoldReward: 23,
    baseXPReward: 72,
    abilities: arbalistAbilities,
  },
  {
    id: "channeler",
    name: "Channeler",
    icon: "\uD83D\uDD2E",
    baseHp: 75,
    baseGoldReward: 24,
    baseXPReward: 78,
    abilities: channelerAbilities,
  },
  {
    id: "fortuneteller",
    name: "Fortuneteller",
    icon: "\uD83C\uDFB4",
    baseHp: 65,
    baseGoldReward: 22,
    baseXPReward: 68,
    abilities: fortunetellerAbilities,
  },
  {
    id: "seer",
    name: "Seer",
    icon: "\uD83D\uDC41\uFE0F",
    baseHp: 70,
    baseGoldReward: 23,
    baseXPReward: 74,
    abilities: seerAbilities,
  },

  // Bosses
  {
    id: "theBoulder",
    name: "The Boulder",
    icon: "\uD83E\uDEA8",
    baseHp: 180,
    baseGoldReward: 50,
    baseXPReward: 150,
    abilities: theBoulderAbilities,
  },
  {
    id: "jeffrey",
    name: "Jeffrey the Demon",
    icon: "\uD83D\uDC7F",
    baseHp: 250,
    baseGoldReward: 80,
    baseXPReward: 250,
    abilities: jeffreyAbilities,
  },
  {
    id: "towerKnight",
    name: "Tower Knight",
    icon: "\uD83D\uDEE1\uFE0F",
    baseHp: 300,
    baseGoldReward: 100,
    baseXPReward: 350,
    abilities: towerKnightAbilities,
  },
];

// ============================================
// MONSTER TIERS FOR RANDOM SELECTION
// ============================================
export const MONSTER_TIERS = {
  tier1: ["bat", "bupling", "mushroom", "soldier", "ectoskull"],
  tier2: ["direwolf", "whollySpider", "butterfly", "scoundrel", "fallenWarrior"],
  tier3: ["berserker", "brawler", "rockman", "spectre"],
  tier4: ["archmage", "glimmershell", "slugmancer", "bigBroot", "captain", "arbalist", "channeler", "fortuneteller", "seer"],
  bosses: ["theBoulder", "jeffrey", "towerKnight"],
};

// ============================================
// CREATE MONSTER INSTANCE
// ============================================
export const createMonster = (
  templateId: string,
  level: number,
  eliteModifier?: EliteModifier
): Monster => {
  const template = MONSTER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Monster template not found: ${templateId}`);
  }

  let scaledHp = Math.floor(template.baseHp * (1 + (level - 1) * 0.5));
  let damageReduction = 0;
  let shield = 0;

  // Calculate gold reward (scales with level and elite modifier)
  let goldReward = Math.floor(template.baseGoldReward * (1 + (level - 1) * 0.3));
  if (eliteModifier) {
    goldReward = Math.floor(goldReward * 1.5); // +50% gold for elite monsters
  }

  // Calculate XP reward (scales with level and elite modifier)
  let xpReward = Math.floor(template.baseXPReward * (1 + (level - 1) * 0.1));
  if (eliteModifier) {
    xpReward = Math.floor(xpReward * 1.5); // +50% XP for elite monsters
  }

  // Apply elite modifier effects
  if (eliteModifier === "armored") {
    scaledHp = Math.floor(scaledHp * 1.5); // +50% HP
    damageReduction = 0.25; // 25% damage reduction
  }
  if (eliteModifier === "shielded") {
    shield = Math.floor(scaledHp * 0.2); // 20% of HP as shield
  }

  const modifierConfig = eliteModifier ? ELITE_MODIFIERS[eliteModifier] : null;
  const displayName = modifierConfig
    ? `${modifierConfig.icon} ${template.name}`
    : template.name;

  return {
    id: `${template.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`,
    name: displayName,
    icon: template.icon,
    image: MONSTER_IMAGES[template.id],
    level,
    maxHp: scaledHp,
    hp: scaledHp,
    shield,
    abilities: template.abilities,
    buffs: [],
    debuffs: [],
    isAlive: true,
    eliteModifier,
    damageReduction: damageReduction > 0 ? damageReduction : undefined,
    goldReward,
    xpReward,
  };
};

// ============================================
// ELITE MODIFIER CHANCE BY ROUND
// ============================================
const ELITE_CHANCE_BY_ROUND: Record<number, number> = {
  1: 0, // No elites in round 1
  2: 0.15, // 15% chance
  3: 0.25, // 25% chance
  4: 0.3, // 30% chance
  5: 0.35, // 35% chance
  6: 0, // Boss round - no random elites
};

const ALL_ELITE_MODIFIERS: EliteModifier[] = [
  "fast",
  "armored",
  "enraged",
  "regenerating",
  "cursed",
  "shielded",
];

export const getRandomEliteModifier = (
  round: number
): EliteModifier | undefined => {
  const chance = ELITE_CHANCE_BY_ROUND[round] || 0;
  if (Math.random() < chance) {
    return ALL_ELITE_MODIFIERS[
      Math.floor(Math.random() * ALL_ELITE_MODIFIERS.length)
    ];
  }
  return undefined;
};

// ============================================
// ROUND CONFIGURATION (6 rounds total)
// ============================================
export interface RoundConfig {
  round: number;
  name: string;
  descriptions: string[]; // Multiple descriptions for variety
  monsterTiers: string[]; // Which tiers to pull from
  monsterCount: number; // How many monsters
  level: number; // Monster level scaling
  isBoss: boolean;
  bossPool?: string[]; // Optional boss pool for boss rounds
}

export const ROUNDS: RoundConfig[] = [
  {
    round: 1,
    name: "The Dark Passage",
    descriptions: [
      "Creatures stir in the darkness...",
      "Something moves in the gloom...",
      "The dungeon awakens...",
      "Danger lurks ahead...",
    ],
    monsterTiers: ["tier1"],
    monsterCount: 2,
    level: 1,
    isBoss: false,
  },
  {
    round: 2,
    name: "The Haunted Halls",
    descriptions: [
      "More dangerous foes await...",
      "The dungeon grows more treacherous...",
      "Stronger creatures block your path...",
      "The air grows thick with menace...",
    ],
    monsterTiers: ["tier1", "tier2"],
    monsterCount: 2,
    level: 1,
    isBoss: false,
  },
  {
    round: 3,
    name: "The Chamber of Horrors",
    descriptions: [
      "Powerful monsters guard this place...",
      "Elite creatures sense your presence...",
      "The dungeon's guardians emerge...",
      "Ancient evils stir...",
    ],
    monsterTiers: ["tier2", "tier3"],
    monsterCount: 2,
    level: 2,
    isBoss: false,
  },
  {
    round: 4,
    name: "The Boulder's Den",
    descriptions: [
      "The ground trembles with immense weight!",
      "A massive stone creature awakens!",
      "The very earth rises against you!",
    ],
    monsterTiers: ["tier3"],
    monsterCount: 1,
    level: 2,
    isBoss: true,
    bossPool: ["theBoulder"],
  },
  {
    round: 5,
    name: "The Demon Gate",
    descriptions: [
      "Jeffrey the Demon awaits!",
      "Hellfire burns as demons pour forth!",
      "The gates of hell have opened!",
    ],
    monsterTiers: ["tier4"],
    monsterCount: 1,
    level: 3,
    isBoss: true,
    bossPool: ["jeffrey"],
  },
  {
    round: 6,
    name: "The Tower Knight's Arena",
    descriptions: [
      "The Tower Knight awaits in its domain!",
      "Face the ultimate challenge... if you dare!",
      "The mightiest warrior guards the exit!",
    ],
    monsterTiers: [],
    monsterCount: 0,
    level: 4,
    isBoss: true,
    bossPool: ["towerKnight"],
  },
];

// ============================================
// HELPER: Pick random from array
// ============================================
const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// ============================================
// GET RANDOM MONSTERS FOR ROUND
// ============================================
export const getMonstersForRound = (round: number): Monster[] => {
  const roundConfig = ROUNDS.find((r) => r.round === round);
  if (!roundConfig) {
    // Default fallback
    return [createMonster("bat", 1)];
  }

  const monsters: Monster[] = [];

  // Add boss if it's a boss round (bosses don't get random elite modifiers)
  if (roundConfig.isBoss && roundConfig.bossPool) {
    const bossId = pickRandom(roundConfig.bossPool);
    monsters.push(createMonster(bossId, roundConfig.level));
  }

  // Add random monsters from tiers
  const availableMonsters: string[] = [];
  for (const tier of roundConfig.monsterTiers) {
    const tierMonsters = MONSTER_TIERS[tier as keyof typeof MONSTER_TIERS];
    if (tierMonsters) {
      availableMonsters.push(...tierMonsters);
    }
  }

  // Pick random monsters (avoid duplicates)
  const selectedIds = new Set<string>();
  for (
    let i = 0;
    i < roundConfig.monsterCount && availableMonsters.length > 0;
    i++
  ) {
    // Filter out already selected
    const remaining = availableMonsters.filter((id) => !selectedIds.has(id));
    if (remaining.length === 0) break;

    const monsterId = pickRandom(remaining);
    selectedIds.add(monsterId);

    // Chance for elite modifier based on round
    const eliteModifier = getRandomEliteModifier(round);
    monsters.push(createMonster(monsterId, roundConfig.level, eliteModifier));
  }

  return monsters;
};

// ============================================
// GET ROUND DESCRIPTION (random)
// ============================================
export const getRoundDescription = (round: number): string => {
  const roundConfig = ROUNDS.find((r) => r.round === round);
  if (!roundConfig) return "Unknown dangers await...";
  return pickRandom(roundConfig.descriptions);
};

// ============================================
// GET ROUND NAME
// ============================================
export const getRoundName = (round: number): string => {
  const roundConfig = ROUNDS.find((r) => r.round === round);
  if (!roundConfig) return "Unknown";
  return roundConfig.name;
};

// Legacy function for backwards compatibility
export const getMonstersForLevel = (level: number): Monster[] => {
  return getMonstersForRound(level);
};
