// ============================================
// SUPABASE DATABASE TYPES
// Generated types for Paper Dungeon multiplayer
// ============================================

import type {
  ClassType,
  GamePhase,
  Card,
  Monster,
  Environment,
  StatusEffect,
  LogEntry,
} from "../types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Game status enum
export type GameStatus =
  | "waiting"
  | "class_select"
  | "deck_building"
  | "in_progress"
  | "completed"
  | "abandoned";

// ============================================
// TABLE ROW TYPES
// ============================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  games_played: number;
  games_won: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  code: string;
  host_id: string;
  status: GameStatus;
  max_players: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  winner_status: string | null;
}

export interface GamePlayer {
  id: string;
  game_id: string;
  user_id: string;
  player_index: number;
  class_type: ClassType | null;
  hero_name: string | null;
  is_ready: boolean;
  is_connected: boolean;
  last_seen_at: string;
  joined_at: string;
  deck: string[] | null;
  deck_confirmed: boolean;
}

export interface GameStateRow {
  game_id: string;
  phase: GamePhase;
  current_player_index: number;
  turn: number;
  round: number;
  max_rounds: number;
  environment: Environment | null;
  monsters: Monster[];
  selected_card_id: string | null;
  selected_target_id: string | null;
  drawn_cards: Card[];
  log: LogEntry[];
  version: number;
  updated_at: string;
  last_action_at: string;
  turn_started_at: string;
}

export interface PlayerState {
  id: string;
  game_id: string;
  game_player_id: string;
  hp: number;
  max_hp: number;
  shield: number;
  base_aggro: number;
  dice_aggro: number;
  resource: number;
  max_resource: number;
  gold: number;
  is_alive: boolean;
  is_stealth: boolean;
  has_taunt: boolean;
  is_stunned: boolean;
  accuracy_penalty: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  deck: Card[];
  discard: Card[];
  hand: Card[];
}

export interface GameAction {
  id: string;
  game_id: string;
  user_id: string;
  action_type: string;
  action_data: Json;
  state_version: number;
  created_at: string;
}

// ============================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "username">;
        Update: Partial<Profile>;
      };
      games: {
        Row: Game;
        Insert: Partial<Game> & Pick<Game, "code" | "host_id">;
        Update: Partial<Game>;
      };
      game_players: {
        Row: GamePlayer;
        Insert: Partial<GamePlayer> & Pick<GamePlayer, "game_id" | "user_id" | "player_index">;
        Update: Partial<GamePlayer>;
      };
      game_state: {
        Row: GameStateRow;
        Insert: Partial<GameStateRow> & Pick<GameStateRow, "game_id">;
        Update: Partial<GameStateRow>;
      };
      player_state: {
        Row: PlayerState;
        Insert: Partial<PlayerState> & Pick<PlayerState, "game_id" | "game_player_id" | "hp" | "max_hp" | "max_resource">;
        Update: Partial<PlayerState>;
      };
      game_actions: {
        Row: GameAction;
        Insert: Partial<GameAction> & Pick<GameAction, "game_id" | "user_id" | "action_type" | "state_version">;
        Update: Partial<GameAction>;
      };
    };
    Functions: {
      create_game: {
        Args: { p_max_players?: number };
        Returns: string;
      };
      join_game: {
        Args: { p_code: string };
        Returns: string;
      };
      submit_game_action: {
        Args: {
          p_game_id: string;
          p_action_type: string;
          p_action_data: Json;
          p_expected_version: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
