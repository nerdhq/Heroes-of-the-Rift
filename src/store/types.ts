import type { StateCreator } from "zustand";
import type {
  GameState,
  GamePhase,
  ScreenType,
  Player,
  Card,
  ClassType,
  LogEntry,
  Monster,
  ActionMessage,
  GameSpeed,
  SavedParty,
  Environment,
} from "../types";

// Combined store type
export type GameStore = GameState & GameActions;

// Slice creator type helper
export type SliceCreator<T> = StateCreator<GameStore, [], [], T>;

// ============================================
// SLICE STATE TYPES
// ============================================

export interface CoreState {
  currentScreen: ScreenType;
  phase: GamePhase;
  turn: number;
  level: number;
  round: number;
  maxRounds: number;
  environment: Environment | null;
  log: LogEntry[];
}

export interface PlayersState {
  players: Player[];
  currentPlayerIndex: number;
  selectedClasses: ClassType[];
  heroNames: string[];
  deckBuildingPlayerIndex: number;
  availableCards: Card[];
  selectedDeckCards: string[];
}

export interface MonstersState {
  monsters: Monster[];
}

export interface CombatState {
  selectedCardId: string | null;
  selectedTargetId: string | null;
  drawnCards: Card[];
  enhanceMode: boolean;
}

export interface RewardsState {
  rewardPlayerIndex: number;
  rewardCards: Card[];
  selectedRewardCardId: string | null;
  shopPlayerIndex: number;
  shopCards: Card[];
  selectedShopCardId: string | null;
}

export interface AnimationState {
  animation: {
    isAnimating: boolean;
    diceRoll: number | null;
    diceRolling: boolean;
    actionMessages: ActionMessage[];
    damageNumbers: Array<{
      id: string;
      targetId: string;
      value: number;
      type: "damage" | "heal" | "shield";
    }>;
  };
}

export interface SettingsState {
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  savedParty: SavedParty | null;
}

// ============================================
// SLICE ACTION TYPES
// ============================================

export interface CoreActions {
  setScreen: (screen: ScreenType) => void;
  addLog: (message: string, type: LogEntry["type"]) => void;
  resetGame: () => void;
  nextPhase: () => void;
}

export interface PlayersActions {
  toggleClassSelection: (classType: ClassType) => void;
  setHeroName: (index: number, name: string) => void;
  confirmClassSelection: () => void;
  toggleCardSelection: (cardId: string) => void;
  confirmDeck: () => void;
  addResource: (playerId: string, amount: number) => void;
  spendResource: (playerId: string, amount: number) => boolean;
  regenerateResources: () => void;
}

export interface CombatActions {
  startGame: () => void;
  startRound: () => void;
  nextRound: () => void;
  drawCards: () => void;
  selectCard: (cardId: string) => void;
  selectTarget: (targetId: string) => void;
  confirmTarget: () => void;
  rollAggro: () => void;
  playCard: () => void;
  monsterAct: () => void;
  resolveDebuffs: () => void;
  endTurn: () => void;
  needsTargetSelection: () => boolean;
  getTargetType: () => "ally" | "monster" | null;
  useSpecialAbility: () => void;
  setEnhanceMode: (enabled: boolean) => void;
  canUseSpecialAbility: () => boolean;
  canEnhanceCard: () => boolean;
  startDiceRoll: () => void;
}

export interface RewardsActions {
  startRewardPhase: () => void;
  selectRewardCard: (cardId: string) => void;
  confirmRewardCard: () => void;
  skipReward: () => void;
  startShopPhase: () => void;
  selectShopCard: (cardId: string) => void;
  purchaseShopCard: () => void;
  skipShop: () => void;
}

export interface AnimationActions {
  setAnimation: (animation: Partial<GameStore["animation"]>) => void;
  addActionMessage: (text: string, type: ActionMessage["type"]) => void;
  clearActionMessages: () => void;
  addDamageNumber: (
    targetId: string,
    value: number,
    type: "damage" | "heal" | "shield"
  ) => void;
}

export interface SettingsActions {
  setGameSpeed: (speed: GameSpeed) => void;
  toggleSkipAnimations: () => void;
  getDelay: (baseMs: number) => number;
  playAgainSameParty: () => void;
  playAgainNewParty: () => void;
}

// Combined actions type
export interface GameActions
  extends CoreActions,
    PlayersActions,
    CombatActions,
    RewardsActions,
    AnimationActions,
    SettingsActions {}
