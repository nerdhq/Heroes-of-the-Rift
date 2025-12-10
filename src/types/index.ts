// ============================================
// PAPER DUNGEON - TYPE DEFINITIONS
// ============================================

// Class Types
export type ClassType =
  | "warrior"
  | "rogue"
  | "paladin"
  | "mage"
  | "priest"
  | "bard"
  | "archer"
  | "barbarian";

// Rarity
export type Rarity = "common" | "uncommon" | "rare" | "legendary";

// Effect Types
export type EffectType =
  | "damage"
  | "heal"
  | "shield"
  | "cleanse"
  | "stealth"
  | "block"
  | "strength"
  | "revive"
  | "poison"
  | "burn"
  | "ice"
  | "weakness"
  | "stun"
  | "taunt"
  | "disable"
  | "accuracy";

// Target Types
export type TargetType =
  | "self"
  | "ally"
  | "monster"
  | "all"
  | "allAllies"
  | "allMonsters";

// Game Phases
export type GamePhase =
  | "DRAW"
  | "SELECT"
  | "TARGET_SELECT"
  | "AGGRO"
  | "PLAYER_ACTION"
  | "MONSTER_ACTION"
  | "DEBUFF_RESOLUTION"
  | "END_TURN";

// Screen Types
export type ScreenType =
  | "title"
  | "classSelect"
  | "deckBuilder"
  | "game"
  | "cardReward"
  | "victory"
  | "defeat";

// ============================================
// EFFECT
// ============================================
export interface Effect {
  type: EffectType;
  value?: number;
  target: TargetType;
  duration?: number; // for buffs/debuffs
}

// ============================================
// CARD
// ============================================
export interface Card {
  id: string;
  name: string;
  class: ClassType;
  rarity: Rarity;
  aggro: number; // 0-5
  description: string;
  effects: Effect[];
}

// ============================================
// BUFF / DEBUFF
// ============================================
export interface StatusEffect {
  type: EffectType;
  value: number;
  duration: number; // turns remaining
  source?: string; // who applied it
}

// ============================================
// PLAYER
// ============================================
export interface Player {
  id: string;
  name: string;
  class: ClassType;
  hp: number;
  maxHp: number;
  shield: number;
  baseAggro: number;
  diceAggro: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  deck: Card[];
  discard: Card[];
  hand: Card[];
  resource: number; // class-specific meter
  maxResource: number;
  isAlive: boolean;
  isStealth: boolean;
  hasTaunt: boolean;
  isStunned: boolean;
  accuracyPenalty: number;
}

// ============================================
// MONSTER ABILITY
// ============================================
export interface MonsterAbility {
  roll: number; // 1-6
  name: string;
  description: string;
  damage: number;
  target: "single" | "all" | "random";
  debuff?: {
    type: EffectType;
    value: number;
    duration: number;
  };
}

// ============================================
// ELITE MODIFIERS
// ============================================
export type EliteModifier =
  | "fast" // Acts twice per turn
  | "armored" // +50% HP, reduces damage taken
  | "enraged" // +50% damage dealt
  | "regenerating" // Heals 10 HP per turn
  | "cursed" // Applies random debuffs to attackers
  | "shielded"; // Has shield that regenerates

// ============================================
// MONSTER
// ============================================
export interface Monster {
  id: string;
  name: string;
  icon: string; // Emoji icon for the monster (fallback)
  image?: string; // Image path for the monster
  level: number;
  maxHp: number;
  hp: number;
  shield: number; // For shielded elite modifier
  abilities: MonsterAbility[];
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  isAlive: boolean;
  intent?: MonsterAbility; // What the monster plans to do next turn
  eliteModifier?: EliteModifier; // Optional elite modifier
  damageReduction?: number; // For armored modifier
}

// ============================================
// SPECIAL ABILITY
// ============================================
export interface SpecialAbility {
  name: string;
  description: string;
  effects: Effect[];
}

// ============================================
// CLASS CONFIG
// ============================================
export interface ClassConfig {
  type: ClassType;
  name: string;
  description: string;
  baseHp: number;
  resourceName: string;
  maxResource: number;
  color: string;
  specialAbility: SpecialAbility;
  enhanceBonus: {
    damageBonus: number;
    healBonus: number;
    shieldBonus: number;
  };
}

// ============================================
// GAME LOG ENTRY
// ============================================
export interface LogEntry {
  id: string;
  turn: number;
  phase: GamePhase;
  message: string;
  type: "info" | "damage" | "heal" | "buff" | "debuff" | "roll" | "action";
  timestamp: number;
  isSubEntry?: boolean; // For indented entries within a turn
}

// ============================================
// ACTION MESSAGE
// ============================================
export interface ActionMessage {
  id: string;
  text: string;
  type: "action" | "damage" | "heal" | "buff" | "debuff" | "roll";
  timestamp: number;
}

// ============================================
// ANIMATION STATE
// ============================================
export interface AnimationState {
  isAnimating: boolean;
  diceRoll: number | null;
  diceRolling: boolean;
  actionMessages: ActionMessage[];
  damageNumbers: {
    id: string;
    value: number;
    type: "damage" | "heal" | "shield";
    targetId: string;
  }[];
}

// ============================================
// SPEED SETTINGS
// ============================================
export type GameSpeed = "normal" | "fast" | "instant";

// ============================================
// SAVED PARTY (for quick restart)
// ============================================
export interface SavedParty {
  classes: ClassType[];
  names: string[];
}

// ============================================
// GAME STATE
// ============================================
export interface GameState {
  // Screen management
  currentScreen: ScreenType;

  // Game state
  phase: GamePhase;
  players: Player[];
  monsters: Monster[];
  currentPlayerIndex: number;
  turn: number;
  level: number;
  round: number;
  maxRounds: number;

  // Selection state
  selectedCardId: string | null;
  selectedTargetId: string | null;

  // Cards drawn this turn
  drawnCards: Card[];

  // Game log
  log: LogEntry[];

  // Class selection state
  selectedClasses: ClassType[];
  heroNames: string[];

  // Deck building state
  deckBuildingPlayerIndex: number;
  availableCards: Card[];
  selectedDeckCards: string[];

  // Card reward state (after round victory)
  rewardPlayerIndex: number;
  rewardCards: Card[];
  selectedRewardCardId: string | null;

  // Animation state
  animation: AnimationState;

  // Speed settings
  gameSpeed: GameSpeed;
  skipAnimations: boolean;

  // Saved party for quick restart
  savedParty: SavedParty | null;

  // Enhancement mode (spend resources to boost cards)
  enhanceMode: boolean;
}
