import type { Monster, MonsterAbility } from "../types";

// ============================================
// MONSTER TEMPLATES
// ============================================

interface MonsterTemplate {
  id: string;
  name: string;
  baseHp: number;
  abilities: MonsterAbility[];
}

// ============================================
// GOBLIN (Starter Monster)
// ============================================
const goblinAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Stumble",
    description: "The goblin trips and does nothing.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Scratch",
    description: "A weak scratch attack.",
    damage: 4,
    target: "single",
  },
  {
    roll: 3,
    name: "Stab",
    description: "A quick stab with a rusty dagger.",
    damage: 6,
    target: "single",
  },
  {
    roll: 4,
    name: "Poison Spit",
    description: "Spits poison at a hero.",
    damage: 3,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Frenzy",
    description: "Wild slashing attack.",
    damage: 8,
    target: "single",
  },
  {
    roll: 6,
    name: "Call Reinforcements",
    description: "Attacks all heroes in a panic.",
    damage: 4,
    target: "all",
  },
];

// ============================================
// SKELETON
// ============================================
const skeletonAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Bone Rattle",
    description: "Bones clatter harmlessly.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Bone Throw",
    description: "Throws a bone at a hero.",
    damage: 5,
    target: "single",
  },
  {
    roll: 3,
    name: "Sword Slash",
    description: "Slashes with a rusted sword.",
    damage: 7,
    target: "single",
  },
  {
    roll: 4,
    name: "Chilling Touch",
    description: "A cold touch that slows.",
    damage: 4,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Bone Storm",
    description: "Bones fly everywhere.",
    damage: 5,
    target: "all",
  },
  {
    roll: 6,
    name: "Death Strike",
    description: "A powerful overhead strike.",
    damage: 10,
    target: "single",
  },
];

// ============================================
// WEREWOLF
// ============================================
const werewolfAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Howl",
    description: "A terrifying howl that weakens resolve.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Claw Swipe",
    description: "Quick claw attack.",
    damage: 8,
    target: "single",
  },
  {
    roll: 3,
    name: "Bite",
    description: "A vicious bite.",
    damage: 10,
    target: "single",
  },
  {
    roll: 4,
    name: "Savage Leap",
    description: "Leaps at a random target.",
    damage: 12,
    target: "random",
  },
  {
    roll: 5,
    name: "Rending Claws",
    description: "Deep wounds that bleed.",
    damage: 8,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
  {
    roll: 6,
    name: "Feral Frenzy",
    description: "Attacks everyone in a blood rage.",
    damage: 7,
    target: "all",
  },
];

// ============================================
// TROLL
// ============================================
const trollAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Regenerate",
    description: "The troll heals itself.",
    damage: -10, // negative = heal self
    target: "single",
  },
  {
    roll: 2,
    name: "Club Smash",
    description: "Smashes with a massive club.",
    damage: 12,
    target: "single",
  },
  {
    roll: 3,
    name: "Ground Pound",
    description: "Pounds the ground, hitting all.",
    damage: 6,
    target: "all",
  },
  {
    roll: 4,
    name: "Grab and Throw",
    description: "Grabs and throws a hero.",
    damage: 14,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Roar",
    description: "A deafening roar.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 3, duration: 2 },
  },
  {
    roll: 6,
    name: "Devastating Blow",
    description: "A crushing overhead strike.",
    damage: 18,
    target: "single",
  },
];

// ============================================
// VAMPIRE
// ============================================
const vampireAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Mesmerize",
    description: "Hypnotic gaze stuns a hero.",
    damage: 0,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 2,
    name: "Claw Strike",
    description: "Sharp claws slash.",
    damage: 9,
    target: "single",
  },
  {
    roll: 3,
    name: "Life Drain",
    description: "Drains life from a hero.",
    damage: 8,
    target: "single",
  },
  {
    roll: 4,
    name: "Shadow Step",
    description: "Appears behind a random hero.",
    damage: 11,
    target: "random",
  },
  {
    roll: 5,
    name: "Blood Curse",
    description: "Curses a hero with burning blood.",
    damage: 5,
    target: "single",
    debuff: { type: "burn", value: 4, duration: 3 },
  },
  {
    roll: 6,
    name: "Crimson Feast",
    description: "Bites and drains all heroes.",
    damage: 6,
    target: "all",
  },
];

// ============================================
// CERBERUS (Boss)
// ============================================
const cerberusAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Triple Bark",
    description: "All three heads bark menacingly.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Fire Breath",
    description: "One head breathes fire.",
    damage: 10,
    target: "single",
    debuff: { type: "burn", value: 3, duration: 2 },
  },
  {
    roll: 3,
    name: "Triple Bite",
    description: "All heads bite one target.",
    damage: 15,
    target: "single",
  },
  {
    roll: 4,
    name: "Hellfire",
    description: "Flames engulf all heroes.",
    damage: 8,
    target: "all",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
  {
    roll: 5,
    name: "Savage Mauling",
    description: "Brutal attack on random hero.",
    damage: 18,
    target: "random",
  },
  {
    roll: 6,
    name: "Infernal Rampage",
    description: "All heads attack all heroes.",
    damage: 12,
    target: "all",
  },
];

// ============================================
// ANCIENT DRAGON (Final Boss)
// ============================================
const dragonAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Terrifying Roar",
    description: "A deafening roar that shakes the very ground.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 3, duration: 2 },
  },
  {
    roll: 2,
    name: "Claw Swipe",
    description: "Massive claws tear through armor.",
    damage: 18,
    target: "single",
  },
  {
    roll: 3,
    name: "Dragon Breath",
    description: "A torrent of flames engulfs all heroes.",
    damage: 12,
    target: "all",
    debuff: { type: "burn", value: 5, duration: 3 },
  },
  {
    roll: 4,
    name: "Tail Sweep",
    description: "The dragon sweeps its massive tail.",
    damage: 10,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 5,
    name: "Inferno",
    description: "The dragon unleashes a devastating inferno.",
    damage: 15,
    target: "all",
    debuff: { type: "burn", value: 4, duration: 2 },
  },
  {
    roll: 6,
    name: "Apocalyptic Fury",
    description: "The dragon enters a berserker rage!",
    damage: 25,
    target: "random",
    debuff: { type: "burn", value: 6, duration: 3 },
  },
];

// ============================================
// ORC WARLORD (Round 2 Boss)
// ============================================
const orcWarlordAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "War Cry",
    description: "A rallying cry that intimidates heroes.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Axe Slash",
    description: "A brutal axe attack.",
    damage: 12,
    target: "single",
  },
  {
    roll: 3,
    name: "Shield Bash",
    description: "Bashes with a massive shield.",
    damage: 8,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Whirlwind",
    description: "Spins with axes extended.",
    damage: 9,
    target: "all",
  },
  {
    roll: 5,
    name: "Execute",
    description: "A devastating finishing blow.",
    damage: 16,
    target: "single",
  },
  {
    roll: 6,
    name: "Blood Frenzy",
    description: "Goes into a blood-crazed frenzy.",
    damage: 11,
    target: "all",
  },
];

// ============================================
// DARK KNIGHT (Round 1 Mini-Boss)
// ============================================
const darkKnightAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Dark Aura",
    description: "Emanates a weakening darkness.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Sword Strike",
    description: "A precise sword attack.",
    damage: 10,
    target: "single",
  },
  {
    roll: 3,
    name: "Shadow Blade",
    description: "Strikes with dark energy.",
    damage: 8,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Dark Shield",
    description: "Absorbs damage and retaliates.",
    damage: 6,
    target: "single",
  },
  {
    roll: 5,
    name: "Soul Drain",
    description: "Drains life force.",
    damage: 12,
    target: "single",
  },
  {
    roll: 6,
    name: "Darkness Falls",
    description: "Engulfs all in shadow.",
    damage: 7,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
];

// ============================================
// MONSTER TEMPLATES
// ============================================
export const MONSTER_TEMPLATES: MonsterTemplate[] = [
  { id: "goblin", name: "Goblin", baseHp: 30, abilities: goblinAbilities },
  {
    id: "skeleton",
    name: "Skeleton",
    baseHp: 40,
    abilities: skeletonAbilities,
  },
  {
    id: "werewolf",
    name: "Werewolf",
    baseHp: 60,
    abilities: werewolfAbilities,
  },
  { id: "troll", name: "Troll", baseHp: 80, abilities: trollAbilities },
  { id: "vampire", name: "Vampire", baseHp: 70, abilities: vampireAbilities },
  {
    id: "cerberus",
    name: "Cerberus",
    baseHp: 120,
    abilities: cerberusAbilities,
  },
  {
    id: "dark-knight",
    name: "Dark Knight",
    baseHp: 100,
    abilities: darkKnightAbilities,
  },
  {
    id: "orc-warlord",
    name: "Orc Warlord",
    baseHp: 150,
    abilities: orcWarlordAbilities,
  },
  {
    id: "dragon",
    name: "Ancient Dragon",
    baseHp: 250,
    abilities: dragonAbilities,
  },
];

// ============================================
// CREATE MONSTER INSTANCE
// ============================================
export const createMonster = (templateId: string, level: number): Monster => {
  const template = MONSTER_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Monster template not found: ${templateId}`);
  }

  const scaledHp = Math.floor(template.baseHp * (1 + (level - 1) * 0.5));

  return {
    id: `${template.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`,
    name: template.name,
    level,
    maxHp: scaledHp,
    hp: scaledHp,
    abilities: template.abilities,
    buffs: [],
    debuffs: [],
    isAlive: true,
  };
};

// ============================================
// ROUND CONFIGURATION
// ============================================
export interface RoundConfig {
  round: number;
  name: string;
  description: string;
  monsters: { templateId: string; level: number }[];
  isBoss: boolean;
}

export const ROUNDS: RoundConfig[] = [
  {
    round: 1,
    name: "The Dark Passage",
    description: "Goblins and undead block your path...",
    monsters: [
      { templateId: "goblin", level: 1 },
      { templateId: "skeleton", level: 1 },
    ],
    isBoss: false,
  },
  {
    round: 2,
    name: "The Orc Stronghold",
    description: "An Orc Warlord commands his forces!",
    monsters: [{ templateId: "orc-warlord", level: 2 }],
    isBoss: true,
  },
  {
    round: 3,
    name: "The Dragon's Lair",
    description: "Face the Ancient Dragon... if you dare!",
    monsters: [{ templateId: "dragon", level: 3 }],
    isBoss: true,
  },
];

// ============================================
// GET MONSTERS FOR ROUND
// ============================================
export const getMonstersForRound = (round: number): Monster[] => {
  const roundConfig = ROUNDS.find((r) => r.round === round);
  if (!roundConfig) {
    // Default fallback
    return [createMonster("goblin", 1)];
  }

  return roundConfig.monsters.map((m) => createMonster(m.templateId, m.level));
};

// Legacy function for backwards compatibility
export const getMonstersForLevel = (level: number): Monster[] => {
  return getMonstersForRound(level);
};
