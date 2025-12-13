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
    icon: "⚡",
    description: "Acts twice per turn",
    color: "#fbbf24", // yellow
  },
  armored: {
    name: "Armored",
    icon: "🛡️",
    description: "+50% HP, reduces damage taken by 25%",
    color: "#6b7280", // gray
  },
  enraged: {
    name: "Enraged",
    icon: "🔥",
    description: "+50% damage dealt",
    color: "#ef4444", // red
  },
  regenerating: {
    name: "Regenerating",
    icon: "💚",
    description: "Heals 10 HP per turn",
    color: "#22c55e", // green
  },
  cursed: {
    name: "Cursed",
    icon: "💀",
    description: "Applies random debuffs to attackers",
    color: "#a855f7", // purple
  },
  shielded: {
    name: "Shielded",
    icon: "🔰",
    description: "Has shield that regenerates each turn",
    color: "#3b82f6", // blue
  },
};

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
// IMP (Fast attacker, low damage)
// ============================================
const impAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Cackle",
    description: "The imp laughs mockingly.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Fire Spit",
    description: "Spits a small fireball.",
    damage: 4,
    target: "single",
    debuff: { type: "burn", value: 1, duration: 1 },
  },
  {
    roll: 3,
    name: "Quick Slash",
    description: "A rapid claw attack.",
    damage: 5,
    target: "single",
  },
  {
    roll: 4,
    name: "Mischief",
    description: "Steals resources from a hero.",
    damage: 3,
    target: "single",
  },
  {
    roll: 5,
    name: "Double Strike",
    description: "Two quick attacks.",
    damage: 7,
    target: "single",
  },
  {
    roll: 6,
    name: "Infernal Dash",
    description: "Dashes through all heroes.",
    damage: 4,
    target: "all",
  },
];

// ============================================
// SLIME (Splits when damaged - high HP)
// ============================================
const slimeAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Wobble",
    description: "The slime jiggles harmlessly.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Acid Splash",
    description: "Splashes corrosive acid.",
    damage: 5,
    target: "single",
    debuff: { type: "poison", value: 2, duration: 2 },
  },
  {
    roll: 3,
    name: "Engulf",
    description: "Attempts to engulf a hero.",
    damage: 7,
    target: "single",
  },
  {
    roll: 4,
    name: "Toxic Cloud",
    description: "Releases a toxic cloud.",
    damage: 4,
    target: "all",
    debuff: { type: "poison", value: 1, duration: 2 },
  },
  {
    roll: 5,
    name: "Absorb",
    description: "Absorbs damage and heals.",
    damage: -8,
    target: "single",
  },
  {
    roll: 6,
    name: "Acid Wave",
    description: "A wave of acid hits everyone.",
    damage: 6,
    target: "all",
  },
];

// ============================================
// NECROMANCER (Summons skeletons, dark magic)
// ============================================
const necromancerAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Dark Ritual",
    description: "Channels dark energy.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 1, duration: 2 },
  },
  {
    roll: 2,
    name: "Shadow Bolt",
    description: "Fires a bolt of shadow.",
    damage: 8,
    target: "single",
  },
  {
    roll: 3,
    name: "Life Tap",
    description: "Drains life to heal.",
    damage: 6,
    target: "single",
  },
  {
    roll: 4,
    name: "Curse of Decay",
    description: "Curses a hero with decay.",
    damage: 4,
    target: "single",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
  {
    roll: 5,
    name: "Soul Harvest",
    description: "Harvests soul energy.",
    damage: 10,
    target: "single",
  },
  {
    roll: 6,
    name: "Death Wave",
    description: "A wave of death energy.",
    damage: 7,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
];

// ============================================
// GARGOYLE (High armor, stone form)
// ============================================
const gargoyleAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Stone Form",
    description: "Hardens into stone, healing.",
    damage: -12,
    target: "single",
  },
  {
    roll: 2,
    name: "Claw Rake",
    description: "Stone claws rake a hero.",
    damage: 9,
    target: "single",
  },
  {
    roll: 3,
    name: "Wing Buffet",
    description: "Powerful wing attack.",
    damage: 7,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 4,
    name: "Dive Attack",
    description: "Dives from above.",
    damage: 12,
    target: "random",
  },
  {
    roll: 5,
    name: "Stone Gaze",
    description: "Petrifying gaze.",
    damage: 0,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Crushing Descent",
    description: "Crashes down on all heroes.",
    damage: 8,
    target: "all",
  },
];

// ============================================
// BANSHEE (Fear debuff, drains resources)
// ============================================
const bansheeAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Wail",
    description: "A terrifying wail.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Ghostly Touch",
    description: "A chilling touch.",
    damage: 6,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 3,
    name: "Soul Scream",
    description: "Screams pierce the soul.",
    damage: 8,
    target: "single",
  },
  {
    roll: 4,
    name: "Drain Essence",
    description: "Drains life essence.",
    damage: 7,
    target: "single",
  },
  {
    roll: 5,
    name: "Terrify",
    description: "Induces pure terror.",
    damage: 5,
    target: "all",
    debuff: { type: "accuracy", value: 3, duration: 2 },
  },
  {
    roll: 6,
    name: "Death Shriek",
    description: "A deadly shriek.",
    damage: 10,
    target: "all",
  },
];

// ============================================
// MIMIC (Copies player abilities)
// ============================================
const mimicAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Disguise",
    description: "Shifts form confusingly.",
    damage: 0,
    target: "all",
    debuff: { type: "accuracy", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Copied Strike",
    description: "Mimics a hero's attack.",
    damage: 8,
    target: "single",
  },
  {
    roll: 3,
    name: "Tongue Lash",
    description: "A sticky tongue attack.",
    damage: 7,
    target: "single",
  },
  {
    roll: 4,
    name: "Devour",
    description: "Attempts to devour a hero.",
    damage: 12,
    target: "single",
  },
  {
    roll: 5,
    name: "Reflect",
    description: "Reflects damage back.",
    damage: 6,
    target: "random",
  },
  {
    roll: 6,
    name: "True Form",
    description: "Reveals monstrous true form.",
    damage: 9,
    target: "all",
  },
];

// ============================================
// ELEMENTAL (Rotates immunities)
// ============================================
const elementalAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Elemental Shift",
    description: "Changes elemental form.",
    damage: 0,
    target: "single",
  },
  {
    roll: 2,
    name: "Fire Burst",
    description: "Erupts in flames.",
    damage: 10,
    target: "single",
    debuff: { type: "burn", value: 3, duration: 2 },
  },
  {
    roll: 3,
    name: "Ice Shard",
    description: "Launches ice shards.",
    damage: 9,
    target: "single",
    debuff: { type: "ice", value: 2, duration: 2 },
  },
  {
    roll: 4,
    name: "Lightning Strike",
    description: "Strikes with lightning.",
    damage: 12,
    target: "random",
  },
  {
    roll: 5,
    name: "Earth Slam",
    description: "Slams the ground.",
    damage: 8,
    target: "all",
  },
  {
    roll: 6,
    name: "Elemental Storm",
    description: "Unleashes all elements.",
    damage: 11,
    target: "all",
    debuff: { type: "burn", value: 2, duration: 2 },
  },
];

// ============================================
// HYDRA (Multiple attacks per turn)
// ============================================
const hydraAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Regenerate Head",
    description: "A head regrows, healing.",
    damage: -15,
    target: "single",
  },
  {
    roll: 2,
    name: "Triple Bite",
    description: "Three heads bite.",
    damage: 12,
    target: "single",
  },
  {
    roll: 3,
    name: "Poison Spray",
    description: "Sprays venom everywhere.",
    damage: 6,
    target: "all",
    debuff: { type: "poison", value: 3, duration: 3 },
  },
  {
    roll: 4,
    name: "Head Slam",
    description: "Slams with multiple heads.",
    damage: 14,
    target: "single",
  },
  {
    roll: 5,
    name: "Constrict",
    description: "Wraps around a hero.",
    damage: 10,
    target: "single",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Hydra Fury",
    description: "All heads attack all heroes.",
    damage: 10,
    target: "all",
  },
];

// ============================================
// DEMON (Curses players)
// ============================================
const demonAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Demonic Presence",
    description: "Aura of dread.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 3 },
  },
  {
    roll: 2,
    name: "Hellfire Slash",
    description: "Flaming sword attack.",
    damage: 14,
    target: "single",
    debuff: { type: "burn", value: 3, duration: 2 },
  },
  {
    roll: 3,
    name: "Soul Rend",
    description: "Tears at the soul.",
    damage: 12,
    target: "single",
  },
  {
    roll: 4,
    name: "Curse",
    description: "Places a dark curse.",
    damage: 8,
    target: "single",
    debuff: { type: "poison", value: 4, duration: 3 },
  },
  {
    roll: 5,
    name: "Infernal Charge",
    description: "Charges through heroes.",
    damage: 10,
    target: "all",
  },
  {
    roll: 6,
    name: "Apocalypse",
    description: "Unleashes hellish fury.",
    damage: 16,
    target: "all",
    debuff: { type: "burn", value: 4, duration: 2 },
  },
];

// ============================================
// WRAITH (High evasion, drains life)
// ============================================
const wraithAbilities: MonsterAbility[] = [
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
// LICH KING (Boss - Undead master)
// ============================================
const lichKingAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Raise Dead",
    description: "Summons undead energy.",
    damage: 0,
    target: "all",
    debuff: { type: "weakness", value: 2, duration: 2 },
  },
  {
    roll: 2,
    name: "Frost Bolt",
    description: "A bolt of freezing death.",
    damage: 12,
    target: "single",
    debuff: { type: "ice", value: 3, duration: 2 },
  },
  {
    roll: 3,
    name: "Death Coil",
    description: "Dark energy coil.",
    damage: 14,
    target: "single",
  },
  {
    roll: 4,
    name: "Plague",
    description: "Spreads a deadly plague.",
    damage: 8,
    target: "all",
    debuff: { type: "poison", value: 4, duration: 3 },
  },
  {
    roll: 5,
    name: "Soul Freeze",
    description: "Freezes souls solid.",
    damage: 10,
    target: "all",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Army of the Dead",
    description: "Unleashes undead fury.",
    damage: 15,
    target: "all",
    debuff: { type: "weakness", value: 3, duration: 2 },
  },
];

// ============================================
// DEMON LORD (Boss - Ultimate demon)
// ============================================
const demonLordAbilities: MonsterAbility[] = [
  {
    roll: 1,
    name: "Hellgate",
    description: "Opens a gate to hell.",
    damage: 0,
    target: "all",
    debuff: { type: "burn", value: 3, duration: 3 },
  },
  {
    roll: 2,
    name: "Doom Blade",
    description: "A blade of pure doom.",
    damage: 18,
    target: "single",
  },
  {
    roll: 3,
    name: "Corruption",
    description: "Corrupts body and soul.",
    damage: 12,
    target: "single",
    debuff: { type: "poison", value: 5, duration: 3 },
  },
  {
    roll: 4,
    name: "Inferno Wave",
    description: "A wave of hellfire.",
    damage: 14,
    target: "all",
    debuff: { type: "burn", value: 4, duration: 2 },
  },
  {
    roll: 5,
    name: "Soul Crush",
    description: "Crushes the soul.",
    damage: 20,
    target: "random",
    debuff: { type: "stun", value: 1, duration: 1 },
  },
  {
    roll: 6,
    name: "Armageddon",
    description: "Brings forth armageddon.",
    damage: 16,
    target: "all",
    debuff: { type: "burn", value: 5, duration: 3 },
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
  // Tier 1 - Early game (Rounds 1-2)
  {
    id: "goblin",
    name: "Goblin",
    icon: "👺",
    baseHp: 30,
    baseGoldReward: 5,
    abilities: goblinAbilities,
  },
  {
    id: "skeleton",
    name: "Skeleton",
    icon: "💀",
    baseHp: 40,
    baseGoldReward: 7,
    abilities: skeletonAbilities,
  },
  {
    id: "imp",
    name: "Imp",
    icon: "😈",
    baseHp: 25,
    baseGoldReward: 6,
    abilities: impAbilities,
  },
  {
    id: "slime",
    name: "Slime",
    icon: "🟢",
    baseHp: 50,
    baseGoldReward: 8,
    abilities: slimeAbilities,
  },
  {
    id: "wraith",
    name: "Wraith",
    icon: "👻",
    baseHp: 40,
    baseGoldReward: 10,
    abilities: wraithAbilities,
  },

  // Tier 2 - Mid game (Rounds 2-3)
  {
    id: "werewolf",
    name: "Werewolf",
    icon: "🐺",
    baseHp: 60,
    baseGoldReward: 15,
    abilities: werewolfAbilities,
  },
  {
    id: "necromancer",
    name: "Necromancer",
    icon: "🧙",
    baseHp: 60,
    baseGoldReward: 16,
    abilities: necromancerAbilities,
  },
  {
    id: "gargoyle",
    name: "Gargoyle",
    icon: "🗿",
    baseHp: 80,
    baseGoldReward: 18,
    abilities: gargoyleAbilities,
  },
  {
    id: "banshee",
    name: "Banshee",
    icon: "👰",
    baseHp: 55,
    baseGoldReward: 14,
    abilities: bansheeAbilities,
  },
  {
    id: "mimic",
    name: "Mimic",
    icon: "📦",
    baseHp: 70,
    baseGoldReward: 12,
    abilities: mimicAbilities,
  },

  // Tier 3 - Late game (Rounds 3-4)
  {
    id: "troll",
    name: "Troll",
    icon: "🧌",
    baseHp: 80,
    baseGoldReward: 22,
    abilities: trollAbilities,
  },
  {
    id: "vampire",
    name: "Vampire",
    icon: "🧛",
    baseHp: 70,
    baseGoldReward: 20,
    abilities: vampireAbilities,
  },
  {
    id: "elemental",
    name: "Elemental",
    icon: "🌀",
    baseHp: 90,
    baseGoldReward: 24,
    abilities: elementalAbilities,
  },
  {
    id: "dark-knight",
    name: "Dark Knight",
    icon: "⚔️",
    baseHp: 100,
    baseGoldReward: 25,
    abilities: darkKnightAbilities,
  },

  // Tier 4 - Elite (Rounds 4-5)
  {
    id: "hydra",
    name: "Hydra",
    icon: "🐍",
    baseHp: 120,
    baseGoldReward: 35,
    abilities: hydraAbilities,
  },
  {
    id: "demon",
    name: "Demon",
    icon: "👿",
    baseHp: 150,
    baseGoldReward: 40,
    abilities: demonAbilities,
  },
  {
    id: "cerberus",
    name: "Cerberus",
    icon: "🐕",
    baseHp: 120,
    baseGoldReward: 32,
    abilities: cerberusAbilities,
  },
  {
    id: "orc-warlord",
    name: "Orc Warlord",
    icon: "👹",
    baseHp: 150,
    baseGoldReward: 38,
    abilities: orcWarlordAbilities,
  },

  // Bosses (Rounds 4, 5, 6)
  {
    id: "lich-king",
    name: "Lich King",
    icon: "👑",
    baseHp: 200,
    baseGoldReward: 60,
    abilities: lichKingAbilities,
  },
  {
    id: "demon-lord",
    name: "Demon Lord",
    icon: "😡",
    baseHp: 280,
    baseGoldReward: 80,
    abilities: demonLordAbilities,
  },
  {
    id: "dragon",
    name: "Ancient Dragon",
    icon: "🐉",
    baseHp: 300,
    baseGoldReward: 100,
    abilities: dragonAbilities,
  },
];

// ============================================
// MONSTER TIERS FOR RANDOM SELECTION
// ============================================
export const MONSTER_TIERS = {
  tier1: ["goblin", "skeleton", "imp", "slime", "wraith"],
  tier2: ["werewolf", "necromancer", "gargoyle", "banshee", "mimic"],
  tier3: ["troll", "vampire", "elemental", "dark-knight"],
  tier4: ["hydra", "demon", "cerberus", "orc-warlord"],
  bosses: ["lich-king", "demon-lord", "dragon"],
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
      "Goblins lurk in the shadows...",
      "Undead rise from the depths...",
      "Creatures stir in the darkness...",
      "Something moves in the gloom...",
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
    name: "The Lich King's Crypt",
    descriptions: [
      "The Lich King rises with his skeleton army!",
      "Undead legions answer their master's call!",
      "Death itself awaits in this cursed place!",
    ],
    monsterTiers: ["tier3"],
    monsterCount: 1,
    level: 2,
    isBoss: true,
    bossPool: ["lich-king"],
  },
  {
    round: 5,
    name: "The Demon Gate",
    descriptions: [
      "A Demon Lord commands his lesser demons!",
      "Hellfire burns as demons pour forth!",
      "The gates of hell have opened!",
    ],
    monsterTiers: ["tier4"],
    monsterCount: 1,
    level: 3,
    isBoss: true,
    bossPool: ["demon-lord"],
  },
  {
    round: 6,
    name: "The Dragon's Lair",
    descriptions: [
      "The Ancient Dragon awaits in its evolved form!",
      "Face the ultimate challenge... if you dare!",
      "The most powerful creature in the dungeon!",
    ],
    monsterTiers: [],
    monsterCount: 0,
    level: 4,
    isBoss: true,
    bossPool: ["dragon"],
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
    return [createMonster("goblin", 1)];
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
