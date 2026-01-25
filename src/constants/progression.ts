// ============================================
// STAT ALLOCATION CONSTANTS
// ============================================

// Stat soft cap - costs double above this
export const STAT_SOFT_CAP = 50;

// Stat hard cap - cannot exceed
export const STAT_HARD_CAP = 99;

// Cost to allocate a stat point below soft cap
export const STAT_POINT_COST_NORMAL = 1;

// Cost to allocate a stat point above soft cap
export const STAT_POINT_COST_ABOVE_CAP = 2;

// ============================================
// XP FORMULA CONSTANTS
// ============================================

// Base XP for level 2
export const XP_BASE = 100;

// XP growth rate for levels 2-10
export const XP_EARLY_GROWTH_RATE = 1.5;

// XP per level for levels 11-20
export const XP_MID_BASE = 5000;
export const XP_MID_PER_LEVEL = 1000;

// XP per level for levels 21+
export const XP_LATE_BASE = 15000;
export const XP_LATE_PER_LEVEL = 2000;

// ============================================
// STAT POINTS PER LEVEL
// ============================================

// Stat points gained per level (levels 1-10)
export const STAT_POINTS_EARLY = 3;

// Stat points gained per level (levels 11-20)
export const STAT_POINTS_MID = 2;

// Stat points gained per level (levels 21+)
export const STAT_POINTS_LATE = 1;

// ============================================
// CHAMPION DEFAULTS
// ============================================

// Starting gold for new champions
export const STARTING_GOLD = 50;

// Starting XP to next level
export const STARTING_XP_TO_LEVEL = 100;

// Maximum champion slots per account
export const MAX_CHAMPION_SLOTS = 3;

// ============================================
// STARTER CARD GENERATION
// ============================================

// Number of guaranteed common cards
export const STARTER_CARDS_COMMON_COUNT = 5;

// Number of cards with uncommon chance
export const STARTER_CARDS_UNCOMMON_SLOTS = 2;

// Chance for uncommon in uncommon slots (50%)
export const STARTER_CARDS_UNCOMMON_CHANCE = 0.5;

// Chance for rare in the bonus slot (5%)
export const STARTER_CARDS_RARE_CHANCE = 0.05;

// Total starter cards
export const STARTER_CARDS_TOTAL = 8;

// ============================================
// STORAGE KEYS
// ============================================

export const PROGRESSION_STORAGE_KEY = "heroes-progression";
