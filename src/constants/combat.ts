// ============================================
// COMBAT PHASE CONSTANTS
// ============================================

// Number of cards drawn per turn
export const CARDS_DRAWN_PER_TURN = 2;

// ============================================
// ROUND TRANSITION CONSTANTS
// ============================================

// Percentage of missing HP healed between rounds (50%)
export const BETWEEN_ROUND_HEAL_PERCENT = 0.5;

// Gold awarded per alive player at round completion
export const GOLD_PER_ALIVE_PLAYER = 1;

// ============================================
// ELITE MODIFIER CONSTANTS
// ============================================

// Damage multiplier for enraged monsters (150%)
export const ENRAGED_DAMAGE_MULTIPLIER = 1.5;

// HP regenerated per turn for regenerating monsters
export const REGENERATING_HEAL_AMOUNT = 10;

// Shield regeneration percentage for shielded monsters
export const SHIELDED_REGEN_PERCENT = 0.1;

// Maximum shield percentage for shielded monsters
export const SHIELDED_MAX_PERCENT = 0.2;

// ============================================
// RESOURCE GAIN CONSTANTS
// ============================================

// Warrior rage gain per damage dealt: min(maxGain, ceil(damage / divisor))
export const WARRIOR_RAGE_DIVISOR = 10;
export const WARRIOR_RAGE_MAX_GAIN = 2;

// Warrior rage gain when taking damage: min(maxGain, ceil(damage / divisor))
export const WARRIOR_RAGE_DAMAGE_DIVISOR = 15;
export const WARRIOR_RAGE_DAMAGE_MAX_GAIN = 2;

// Rogue combo point gain per card played
export const ROGUE_COMBO_GAIN = 1;

// Paladin Faith gain: base per card + bonus per heal
export const PALADIN_FAITH_BASE_GAIN = 1;
export const PALADIN_FAITH_HEAL_BONUS = 1;

// Cleric Devotion gain when healing
export const HEALER_RESOURCE_GAIN = 2;

// Bard inspiration gain per buff/shield card
export const BARD_INSPIRATION_GAIN = 1;

// Archer focus gain per card played
export const ARCHER_FOCUS_GAIN = 1;

// Archer focus lost when hit
export const ARCHER_FOCUS_LOSS = 1;

// ============================================
// CLASS-SPECIFIC MECHANIC CONSTANTS
// ============================================

// Fighter - Disciplined Strikes passive proc chances (10% each)
export const FIGHTER_PROC_CHANCE = 0.10;
export const FIGHTER_CRIT_MULTIPLIER = 1.5;

// Barbarian - Blood Frenzy HP scaling
export const BARBARIAN_HP_THRESHOLD_75 = 0.75; // +25% damage below this
export const BARBARIAN_HP_THRESHOLD_50 = 0.50; // +50% damage below this
export const BARBARIAN_HP_THRESHOLD_25 = 0.25; // +100% damage below this
export const BARBARIAN_DAMAGE_BONUS_75 = 0.25;
export const BARBARIAN_DAMAGE_BONUS_50 = 0.50;
export const BARBARIAN_DAMAGE_BONUS_25 = 1.00;

// Paladin - Faith thresholds (50% at 4+ Faith, 100% at 8 Faith)
// Actual bonuses are card-specific and parsed from card descriptions
export const PALADIN_FAITH_50_THRESHOLD = 0.50; // 4+ out of 8 Faith
export const PALADIN_FAITH_100_THRESHOLD = 1.00; // 8 out of 8 Faith

// Archer - Aim crit mechanic
export const ARCHER_CRIT_CHANCE_PER_AIM = 0.10; // +10% crit per Aim stack
export const ARCHER_MAX_AIM_CRIT_MULTIPLIER = 2.5; // 2.5x damage at 5 Aim
