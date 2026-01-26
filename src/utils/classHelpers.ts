/**
 * Class-related utility functions
 */

import type { ClassType } from "../types";

/**
 * Get the emoji icon for a class
 */
export function getClassIcon(classType: ClassType): string {
  const icons: Record<ClassType, string> = {
    fighter: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    cleric: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType];
}

/**
 * Get the color associated with a class
 */
export function getClassColor(classType: ClassType): string {
  const colors: Record<ClassType, string> = {
    fighter: "#dc2626", // red-600
    rogue: "#4ade80", // green-400
    paladin: "#facc15", // yellow-400
    mage: "#8b5cf6", // violet-500
    cleric: "#fcd34d", // amber-300
    bard: "#f472b6", // pink-400
    archer: "#22c55e", // green-500
    barbarian: "#fb923c", // orange-400
  };
  return colors[classType];
}
