import type { StateCreator } from "zustand";
import type { User } from "@supabase/supabase-js";
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
  Champion,
  PlayerAccount,
  CharacterAttributes,
} from "../types";
import type { Profile, GamePlayer } from "../lib/database.types";
import type {
  CampaignState,
  CampaignActions,
} from "../types/campaign";

// Combined store type
export type GameStore = GameState & AuthState & LobbyState & MultiplayerState & ProgressionState & CampaignState & GameActions;

// Slice creator type helper
export type SliceCreator<T> = StateCreator<GameStore, [], [], T>;

// ============================================
// SLICE STATE TYPES
// ============================================

export interface CoreState {
  currentScreen: ScreenType;
  returnScreen: ScreenType | null; // Screen to return to after certain actions
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
  enhanceMode: boolean;
  playerSelections: Array<{
    playerId: string;
    cardId: string | null;
    targetId: string | null;
    isReady: boolean;
    enhanceMode: boolean;
  }>;
}

export interface RewardsState {
  rewardPlayerIndex: number;
  rewardCards: Card[];
  selectedRewardCardId: string | null;
  shopPlayerIndex: number;
  shopCards: Card[];
  selectedShopCardId: string | null;
  roundGoldEarned: number;
}

// AnimationState is defined in types/index.ts - this slice tracks animation-related state
export interface AnimationSliceState {
  // Animation state is part of GameState from types/index.ts
}

export interface SettingsState {
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  savedParty: SavedParty | null;
}

export interface UserDataState {
  userData: {
    gold: number;
    ownedCards: Card[];
  };
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
}

export interface LobbyState {
  currentGameId: string | null;
  gameCode: string | null;
  isHost: boolean;
  lobbyPlayers: GamePlayer[];
  lobbyError: string | null;
  isInLobby: boolean;
}

export interface MultiplayerState {
  isOnline: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedVersion: number;
  syncError: string | null;
  localPlayerIndex: number;
}

export interface ProgressionState {
  playerAccount: PlayerAccount | null;
  activeChampion: Champion | null;
}

// ============================================
// SLICE ACTION TYPES
// ============================================

export interface CoreActions {
  setScreen: (screen: ScreenType) => void;
  setReturnScreen: (screen: ScreenType | null) => void;
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

// Result type for applyCardEffects
export interface CardEffectResult {
  players: import("../types").Player[];
  monsters: import("../types").Monster[];
  logs: import("../types").LogEntry[];
  damageNumbers: Array<{ targetId: string; value: number; type: "damage" | "heal" }>;
  xpEarned: Map<string, number>;
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
  // Core effect application - used by both playCard and resolveAllActions
  applyCardEffects: (
    playerIndex: number,
    cardId: string,
    targetId: string | null,
    isEnhanced: boolean
  ) => CardEffectResult;
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
  // Simultaneous play actions
  drawAllPlayersCards: () => void;
  setPlayerSelection: (playerId: string, cardId: string | null, targetId: string | null, enhanceMode?: boolean) => void;
  setPlayerReady: (playerId: string, isReady: boolean) => void;
  resolveAllActions: () => Promise<void>;
  initializePlayerSelections: () => void;
  areAllPlayersReady: () => boolean;
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
  continueFromRoundComplete: (cardSelections: Record<number, string>) => void;
}

export interface AnimationActions {
  setAnimation: (animation: Partial<GameStore["animation"]>) => void;
  addActionMessage: (text: string, type: ActionMessage["type"], sourceId?: string) => void;
  clearActionMessages: () => void;
  addDamageNumber: (
    targetId: string,
    value: number,
    type: "damage" | "heal" | "shield"
  ) => void;
  triggerAttackAnimation: (
    entityId: string,
    animation: "slash" | "cast" | "shoot" | "thrust"
  ) => void;
  clearAttackAnimation: () => void;
}

export interface SettingsActions {
  setGameSpeed: (speed: GameSpeed) => void;
  toggleSkipAnimations: () => void;
  getDelay: (baseMs: number) => number;
  playAgainSameParty: () => void;
  playAgainNewParty: () => void;
}

export interface UserDataActions {
  addUserGold: (amount: number) => void;
  spendUserGold: (amount: number) => boolean;
  purchaseCardForCollection: (card: Card) => boolean;
  loadUserData: () => void;
  saveUserData: () => void;
}

export interface AuthActions {
  initializeAuth: () => Promise<void>;
  signInAnonymously: (username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "username" | "display_name" | "avatar_url">>) => Promise<boolean>;
  clearAuthError: () => void;
}

export interface LobbyActions {
  createGame: (maxPlayers?: number) => Promise<boolean>;
  joinGame: (code: string) => Promise<boolean>;
  leaveGame: () => Promise<void>;
  startOnlineGame: () => Promise<boolean>;
  kickPlayer: (playerId: string) => Promise<void>;
  subscribeToGame: (gameId: string) => void;
  unsubscribeFromGame: () => void;
  clearLobbyError: () => void;
  setLobbyPlayers: (players: GamePlayer[]) => void;
  initializeOnlineGame: () => Promise<void>;
}

export interface MultiplayerActions {
  setOnlineMode: (online: boolean) => void;
  setConnected: (connected: boolean) => void;
  syncState: () => Promise<void>;
  syncGameStateToSupabase: () => Promise<void>;
  debouncedSyncGameState: () => void;
  syncAfterAction: () => void;
  subscribeToGameState: () => void;
  unsubscribeFromGameState: () => void;
  submitAction: (actionType: string, actionData: Record<string, unknown>) => Promise<boolean>;
  handleStateUpdate: (newState: Record<string, unknown>) => void;
  clearSyncError: () => void;
}

export interface ProgressionActions {
  // Account management
  loadProgression: () => void | Promise<void>;
  saveProgression: () => void | Promise<void>;

  // Champion management
  createChampion: (name: string, classType: ClassType) => Champion | null | Promise<Champion | null>;
  deleteChampion: (championId: string) => boolean | Promise<boolean>;
  selectChampion: (championId: string) => void | Promise<void>;
  getActiveChampion: () => Champion | null;

  // Game flow
  startChampionGame: () => void; // Sets up game state for active champion

  // Stat allocation
  allocateStatPoint: (stat: keyof CharacterAttributes) => boolean | Promise<boolean>;
  getStatCost: (currentValue: number) => number;

  // XP and leveling
  addXP: (championId: string, amount: number) => void | Promise<void>;
  checkLevelUp: (championId: string) => boolean;
  getXPForLevel: (level: number) => number;
  getStatPointsForLevel: (level: number) => number;

  // Economy (per-champion)
  addChampionGold: (championId: string, amount: number) => void | Promise<void>;
  setChampionGold: (championId: string, newGold: number) => void | Promise<void>;
  spendChampionGold: (championId: string, amount: number) => boolean | Promise<boolean>;
  addCardToChampion: (championId: string, card: Card) => void | Promise<void>;

  // Stats tracking
  updateChampionStats: (championId: string, stats: Partial<Champion["stats"]>) => void | Promise<void>;
}

// Combined actions type
export interface GameActions
  extends CoreActions,
    PlayersActions,
    CombatActions,
    RewardsActions,
    AnimationActions,
    SettingsActions,
    UserDataActions,
    AuthActions,
    LobbyActions,
    MultiplayerActions,
    ProgressionActions,
    CampaignActions {}
