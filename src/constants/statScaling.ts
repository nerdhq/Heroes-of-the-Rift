// ============================================
// STAT SCALING CONSTANTS
// ============================================

// Default base stat value for all attributes
export const BASE_STAT_VALUE = 10;

// Physical damage scaling: base * (1 + (STR-10) * multiplier)
export const STR_DAMAGE_MULTIPLIER = 0.03;

// Magical damage scaling: base * (1 + (INT-10) * multiplier)
export const INT_DAMAGE_MULTIPLIER = 0.04;

// Healing scaling: base * (1 + (WIS-10) * multiplier)
export const WIS_HEAL_MULTIPLIER = 0.035;

// Shield scaling: base * (1 + (CON-10) * multiplier)
export const CON_SHIELD_MULTIPLIER = 0.025;

// Duration bonus from WIS: floor((WIS-10) / divisor)
export const DURATION_BONUS_DIVISOR = 10;

// Max HP bonus from CON: (CON-10) * multiplier
export const MAX_HP_BONUS_MULTIPLIER = 2;

// ============================================
// CRIT CONSTANTS
// ============================================

// Base crit chance (5%)
export const BASE_CRIT_CHANCE = 0.05;

// Additional crit chance per LCK point
export const CRIT_CHANCE_PER_LCK = 0.005;

// Base crit damage multiplier (150%)
export const BASE_CRIT_MULTIPLIER = 1.5;

// Additional crit multiplier per LCK point
export const CRIT_MULTIPLIER_PER_LCK = 0.005;

// ============================================
// DODGE/ACCURACY CONSTANTS
// ============================================

// Dodge chance per AGI point above base
export const DODGE_CHANCE_PER_AGI = 0.005;

// Accuracy mitigation divisor for AGI: floor((AGI-10) / divisor)
export const ACCURACY_MITIGATION_DIVISOR = 5;

// ============================================
// DEFAULT ATTRIBUTES
// ============================================

import type { CharacterAttributes } from "../types";

export const DEFAULT_ATTRIBUTES: CharacterAttributes = {
  STR: BASE_STAT_VALUE,
  AGI: BASE_STAT_VALUE,
  CON: BASE_STAT_VALUE,
  INT: BASE_STAT_VALUE,
  WIS: BASE_STAT_VALUE,
  LCK: BASE_STAT_VALUE,
};
