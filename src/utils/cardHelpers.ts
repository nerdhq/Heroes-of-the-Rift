/**
 * Card-related utility functions
 */

import type { Card } from "../types";

/**
 * Get border and background color classes for a card based on rarity
 */
export function getRarityColor(rarity: Card["rarity"]): string {
  const colors: Record<Card["rarity"], string> = {
    common: "border-stone-500 bg-stone-800",
    uncommon: "border-green-500 bg-green-900/30",
    rare: "border-blue-500 bg-blue-900/30",
    legendary: "border-amber-500 bg-amber-900/30",
  };
  return colors[rarity];
}

/**
 * Get text color class for a card based on rarity
 */
export function getRarityTextColor(rarity: Card["rarity"]): string {
  const colors: Record<Card["rarity"], string> = {
    common: "text-stone-400",
    uncommon: "text-green-400",
    rare: "text-blue-400",
    legendary: "text-amber-400",
  };
  return colors[rarity];
}

/**
 * Get the price for a card based on rarity
 */
export function getCardPrice(rarity: Card["rarity"]): number {
  const prices: Record<Card["rarity"], number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };
  return prices[rarity];
}

/**
 * Get a display name for the rarity
 */
export function getRarityDisplayName(rarity: Card["rarity"]): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
