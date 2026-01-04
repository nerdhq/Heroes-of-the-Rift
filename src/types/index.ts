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
  | "RESOLVE" // All players' actions resolve simultaneously
  | "MONSTER_ACTION"
  | "DEBUFF_RESOLUTION"
  | "END_TURN";

// Player Selection (for simultaneous action selection)
export interface PlayerSelection {
  playerId: string;
  cardId: string | null;
  targetId: string | null;
  isReady: boolean;
  enhanceMode: boolean;
}

// Screen Types
export type ScreenType =
  | "title"
  | "login"
  | "lobby"
  | "waitingRoom"
  | "onlineChampionSelect"
  | "championSelect"
  | "championCreate"
  | "statAllocation"
  | "classSelect"
  | "deckBuilder"
  | "game"
  | "cardReward"
  | "cardShop"
  | "myCards"
  | "roundComplete"
  | "postGame"
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
  gold: number; // gold earned from defeating monsters
  isAlive: boolean;
  isStealth: boolean;
  hasTaunt: boolean;
  isStunned: boolean;
  accuracyPenalty: number;

  // Champion link (for progression system)
  championId?: string;
  attributes?: CharacterAttributes;
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
  goldReward: number; // Gold awarded when defeated
  xpReward: number; // XP awarded when defeated
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
// ENVIRONMENT
// ============================================
export type EnvironmentType =
  | "forest"
  | "castle"
  | "volcano"
  | "iceCave"
  | "swamp"
  | "desert"
  | "crypt"
  | "void";

export type EnvironmentEffectType =
  | "frostBonus"
  | "fireBonus"
  | "poisonBonus"
  | "healingBonus"
  | "damageBonus"
  | "shieldBonus";

export interface EnvironmentEffect {
  type: EnvironmentEffectType;
  value: number; // Multiplier (1.5 = +50%) or flat bonus
  description: string;
}

export interface Environment {
  type: EnvironmentType;
  name: string;
  description: string;
  theme: {
    background: string;
    primaryColor: string;
    secondaryColor: string;
  };
  effects: EnvironmentEffect[];
}

// ============================================
// SAVED PARTY (for quick restart)
// ============================================
export interface SavedParty {
  classes: ClassType[];
  names: string[];
}

// ============================================
// USER DATA (persisted across games) - LEGACY, migrating to Champion
// ============================================
export interface UserData {
  gold: number;
  ownedCards: Card[]; // Cards purchased from the shop
}

// ============================================
// CHARACTER ATTRIBUTES (6 core stats)
// ============================================
export interface CharacterAttributes {
  STR: number; // Physical damage scaling (10-99)
  AGI: number; // Dodge chance, accuracy (10-99)
  CON: number; // Max HP bonus, status resist (10-99)
  INT: number; // Spell damage scaling (10-99)
  WIS: number; // Heal scaling, buff duration (10-99)
  LCK: number; // Crit chance, gold bonus (10-99)
}

// ============================================
// CHAMPION STATS (tracking lifetime stats)
// ============================================
export interface ChampionStats {
  gamesPlayed: number;
  gamesWon: number;
  monstersKilled: number;
  bossesKilled: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalGoldEarned: number;
  roundsCompleted: number;
  deaths: number;
}

// ============================================
// CHAMPION (persistent character)
// ============================================
export interface Champion {
  id: string;
  name: string;
  class: ClassType; // Locked at creation
  createdAt: number;

  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;
  unspentStatPoints: number;

  // Attributes
  attributes: CharacterAttributes;

  // Economy (per-champion)
  gold: number;
  ownedCards: Card[];

  // Lifetime stats
  stats: ChampionStats;
}

// ============================================
// PLAYER ACCOUNT (collection of champions)
// ============================================
export interface PlayerAccount {
  id: string;
  champions: Champion[];
  maxChampionSlots: number; // Start at 3
  activeChampionId: string | null;
  createdAt: number;
  lastPlayedAt: number;
}

// ============================================
// GAME STATE
// ============================================
export interface GameState {
  // Screen management
  currentScreen: ScreenType;
  returnScreen: ScreenType | null; // Screen to return to after certain actions

  // User data (persisted)
  userData: UserData;

  // Game state
  phase: GamePhase;
  players: Player[];
  monsters: Monster[];
  currentPlayerIndex: number;
  turn: number;
  level: number;
  round: number;
  maxRounds: number;
  environment: Environment | null;

  // Selection state (legacy - for local/offline mode)
  selectedCardId: string | null;
  selectedTargetId: string | null;

  // Player selections (for simultaneous action in online mode)
  playerSelections: PlayerSelection[];

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

  // Card shop state (after round 2+)
  shopPlayerIndex: number;
  shopCards: Card[];
  selectedShopCardId: string | null;

  // Round completion state
  roundGoldEarned: number;

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
