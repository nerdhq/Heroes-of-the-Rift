/**
 * Combat-specific types for the modular combat slice
 */

import type { StateCreator } from "zustand";
import type { GameStore, CombatActions } from "../../types";
import type { LogEntry, Player, Monster } from "../../../types";

/**
 * Type for combat slice creator functions
 */
export type CombatSliceCreator = StateCreator<GameStore, [], [], CombatActions>;

/**
 * Set and Get function types for action creators
 */
export type SetState = Parameters<CombatSliceCreator>[0];
export type GetState = Parameters<CombatSliceCreator>[1];

/**
 * Result of applying card effects
 */
export interface CardEffectResult {
  players: Player[];
  monsters: Monster[];
  logs: LogEntry[];
  damageNumbers: Array<{ targetId: string; value: number; type: "damage" | "heal" }>;
  xpEarned: Map<string, number>;
}

/**
 * Type for action creator factory functions
 */
export type ActionCreator<T> = (set: SetState, get: GetState) => T;
