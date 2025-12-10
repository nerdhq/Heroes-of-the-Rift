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
// MONSTER
// ============================================
export interface Monster {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  abilities: MonsterAbility[];
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  isAlive: boolean;
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
}
