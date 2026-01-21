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

// Paladin/Priest holy power gain when healing
export const HEALER_RESOURCE_GAIN = 2;

// Bard inspiration gain per buff/shield card
export const BARD_INSPIRATION_GAIN = 1;

// Archer focus gain per card played
export const ARCHER_FOCUS_GAIN = 1;

// Archer focus lost when hit
export const ARCHER_FOCUS_LOSS = 1;
