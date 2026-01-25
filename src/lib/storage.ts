/**
 * Type-safe localStorage wrapper
 * Provides type checking for all storage operations
 */

import type { Card, PlayerAccount } from "../types";
import type { CampaignProgress } from "../types/campaign";

// ============================================
// STORAGE SCHEMA
// ============================================

/**
 * Defines the schema for all localStorage keys and their value types.
 * Add new keys here when introducing new persistent data.
 */
export interface StorageSchema {
  "dungeon-crawler-user-data": {
    gold: number;
    ownedCards: Card[];
  };
  "heroes-progression": PlayerAccount;
  "campaignProgress": CampaignProgress;
  "completedCampaigns": string[];
}

export type StorageKey = keyof StorageSchema;

// ============================================
// RESULT TYPES
// ============================================

export interface StorageResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// ============================================
// TYPED STORAGE CLASS
// ============================================

class TypedStorage {
  /**
   * Get a value from localStorage with type safety
   * @param key The storage key
   * @returns The stored value or null if not found/invalid
   */
  get<K extends StorageKey>(key: K): StorageSchema[K] | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as StorageSchema[K];
    } catch (error) {
      console.error(`Failed to read from localStorage key "${key}":`, error);
      return null;
    }
  }

  /**
   * Get a value from localStorage with full result info
   * @param key The storage key
   * @returns A result object with success status, data, and error info
   */
  getResult<K extends StorageKey>(key: K): StorageResult<StorageSchema[K]> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: true, data: null };
      }
      const data = JSON.parse(item) as StorageSchema[K];
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to read from localStorage key "${key}":`, error);
      return { success: false, data: null, error: errorMessage };
    }
  }

  /**
   * Set a value in localStorage with type safety
   * @param key The storage key
   * @param value The value to store
   * @returns true if successful, false otherwise
   */
  set<K extends StorageKey>(key: K, value: StorageSchema[K]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to write to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove a value from localStorage
   * @param key The storage key
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param key The storage key
   * @returns true if the key exists
   */
  has(key: StorageKey): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Update a value in localStorage by applying a transform function
   * @param key The storage key
   * @param updater Function to transform the existing value
   * @returns true if successful, false otherwise
   */
  update<K extends StorageKey>(
    key: K,
    updater: (current: StorageSchema[K] | null) => StorageSchema[K]
  ): boolean {
    const current = this.get(key);
    const updated = updater(current);
    return this.set(key, updated);
  }

  /**
   * Clear all typed storage keys
   * Use with caution - this removes all game data
   */
  clearAll(): void {
    const keys: StorageKey[] = [
      "dungeon-crawler-user-data",
      "heroes-progression",
      "campaignProgress",
      "completedCampaigns",
    ];

    for (const key of keys) {
      this.remove(key);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Typed storage instance for localStorage operations.
 * Usage:
 * ```
 * import { storage } from "../lib/storage";
 *
 * // Get with type safety
 * const userData = storage.get("dungeon-crawler-user-data");
 * // userData is { gold: number; ownedCards: Card[] } | null
 *
 * // Set with type safety
 * storage.set("completedCampaigns", ["campaign-1", "campaign-2"]);
 *
 * // Remove
 * storage.remove("campaignProgress");
 * ```
 */
export const storage = new TypedStorage();

// ============================================
// STORAGE KEY CONSTANTS
// ============================================

/**
 * Constants for storage keys to avoid typos
 */
export const STORAGE_KEYS = {
  USER_DATA: "dungeon-crawler-user-data",
  PROGRESSION: "heroes-progression",
  CAMPAIGN_PROGRESS: "campaignProgress",
  COMPLETED_CAMPAIGNS: "completedCampaigns",
} as const satisfies Record<string, StorageKey>;
