// LPC Spritesheet imports for player classes
// Each spritesheet is a 64x64 grid with multiple animation rows
// See: https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/

import type { ClassType } from "../../../types";

// Sprite loading state
type SpriteLoadState = {
  url: string | null;
  loaded: boolean;
  error: boolean;
};

const spriteCache: Partial<Record<ClassType, SpriteLoadState>> = {};

// Pre-load all sprites on module initialization
const CLASS_TYPES: ClassType[] = [
  "warrior",
  "rogue",
  "paladin",
  "mage",
  "priest",
  "bard",
  "archer",
  "barbarian",
];

// Eagerly load all available sprites using Vite's glob import
const allSprites = import.meta.glob<{ default: string }>("./*.png", {
  eager: true,
});

// Populate cache immediately
for (const classType of CLASS_TYPES) {
  const key = `./${classType}.png`;
  if (allSprites[key]) {
    spriteCache[classType] = {
      url: allSprites[key].default,
      loaded: true,
      error: false,
    };
  }
}

// Export sprite URLs (will be null for classes without sprites)
export const CLASS_SPRITES: Partial<Record<ClassType, string>> = {};

for (const classType of CLASS_TYPES) {
  if (spriteCache[classType]?.url) {
    CLASS_SPRITES[classType] = spriteCache[classType]!.url;
  }
}

// Helper to check if a class has a sprite available
export function hasSprite(classType: ClassType): boolean {
  return !!CLASS_SPRITES[classType];
}

// Get sprite URL for a class (returns undefined if not available)
export function getSprite(classType: ClassType): string | undefined {
  return CLASS_SPRITES[classType];
}

// LPC Spritesheet Layout Constants
// Standard LPC format: 64x64 pixels per frame
export const LPC_FRAME_WIDTH = 64;
export const LPC_FRAME_HEIGHT = 64;

// Animation data type
interface AnimationRowData {
  baseRow: number;
  frames: number;
  downRow: number;
}

// Row definitions for LPC spritesheets
// Each animation has 4 rows for directions: up, left, down, right
// Extended LPC sheets have additional animations after row 20
const LPC_ANIMATION_DATA: Record<string, AnimationRowData> = {
  SPELLCAST: { baseRow: 0, frames: 7, downRow: 2 },
  THRUST: { baseRow: 4, frames: 8, downRow: 6 },
  WALK: { baseRow: 8, frames: 9, downRow: 10 },
  SLASH: { baseRow: 12, frames: 6, downRow: 14 },
  SHOOT: { baseRow: 16, frames: 13, downRow: 18 },
  HURT: { baseRow: 20, frames: 6, downRow: 20 }, // Only one row for hurt
  // Extended animations (position varies by sheet, these are common positions)
  IDLE: { baseRow: 38, frames: 4, downRow: 40 }, // Idle animation (if available)
};

// Direction offsets from base row
export const LPC_DIRECTIONS = {
  UP: 0,
  LEFT: 1,
  DOWN: 2,
  RIGHT: 3,
} as const;

// Animation state types
export type LPCAnimationType =
  | "idle"
  | "walk"
  | "slash"
  | "thrust"
  | "shoot"
  | "cast"
  | "hurt";
export type LPCDirection = "up" | "left" | "down" | "right";

// Get the row and frame count for an animation
export function getAnimationData(
  animation: LPCAnimationType
): AnimationRowData {
  switch (animation) {
    case "idle":
      return LPC_ANIMATION_DATA.IDLE;
    case "walk":
      return LPC_ANIMATION_DATA.WALK;
    case "slash":
      return LPC_ANIMATION_DATA.SLASH;
    case "thrust":
      return LPC_ANIMATION_DATA.THRUST;
    case "shoot":
      return LPC_ANIMATION_DATA.SHOOT;
    case "cast":
      return LPC_ANIMATION_DATA.SPELLCAST;
    case "hurt":
      return LPC_ANIMATION_DATA.HURT;
    default:
      return LPC_ANIMATION_DATA.WALK;
  }
}

// Get fallback animation data (walk) for when idle row doesn't exist
export function getIdleFallbackData(): AnimationRowData {
  return LPC_ANIMATION_DATA.WALK;
}

// Check if a row is available in a texture of given height
export function isRowAvailable(row: number, textureHeight: number): boolean {
  return (row + 1) * LPC_FRAME_HEIGHT <= textureHeight;
}

// Get the actual row for a specific direction
export function getRowForDirection(
  baseRow: number,
  direction: LPCDirection
): number {
  const offset = LPC_DIRECTIONS[direction.toUpperCase() as keyof typeof LPC_DIRECTIONS];
  return baseRow + offset;
}

export default CLASS_SPRITES;
