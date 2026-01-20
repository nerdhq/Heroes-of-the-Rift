import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTick, extend } from "@pixi/react";
import { Texture, Rectangle, Sprite, Assets } from "pixi.js";
import type { Ticker } from "pixi.js";
import {
  LPC_FRAME_WIDTH,
  LPC_FRAME_HEIGHT,
  getAnimationData,
  getIdleFallbackData,
} from "../../../assets/sprites/classes";

// Re-export types for use in other components
export type { LPCAnimationType, LPCDirection } from "../../../assets/sprites/classes";
import type { LPCAnimationType, LPCDirection } from "../../../assets/sprites/classes";

// Extend Sprite for JSX use
extend({ Sprite });

export interface AnimatedCharacterProps {
  // Sprite source URL
  spriteUrl: string;
  // Current animation to play
  animation: LPCAnimationType;
  // Direction the character is facing
  direction?: LPCDirection;
  // Animation speed (frames per tick, lower = slower)
  animationSpeed?: number;
  // Whether to loop the animation
  loop?: boolean;
  // Callback when a non-looping animation completes
  onAnimationComplete?: () => void;
  // Position
  x?: number;
  y?: number;
  // Scale
  scale?: number;
  // Anchor point (default: bottom center for characters)
  anchorX?: number;
  anchorY?: number;
  // Alpha/opacity
  alpha?: number;
  // Tint color (for damage flash, etc.)
  tint?: number;
}

export function AnimatedCharacter({
  spriteUrl,
  animation,
  direction = "down",
  animationSpeed = 0.15,
  loop = true,
  onAnimationComplete,
  x = 0,
  y = 0,
  scale = 1,
  anchorX = 0.5,
  anchorY = 1,
  alpha = 1,
  tint = 0xffffff,
}: AnimatedCharacterProps) {
  // Texture state
  const [baseTexture, setBaseTexture] = useState<Texture | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Animation state
  const animationRef = useRef({
    currentFrame: 0,
    elapsed: 0,
    lastAnimation: animation,
    isComplete: false,
  });

  // Load the spritesheet texture using Assets API (Pixi.js v8)
  useEffect(() => {
    if (!spriteUrl) {
      setLoadError(true);
      return;
    }

    setIsLoaded(false);
    setLoadError(false);

    // Use Pixi.js v8 Assets API for proper async loading
    let cancelled = false;

    Assets.load<Texture>(spriteUrl)
      .then((texture) => {
        if (!cancelled) {
          setBaseTexture(texture);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [spriteUrl]);

  // Reset animation when animation type changes
  useEffect(() => {
    if (animation !== animationRef.current.lastAnimation) {
      animationRef.current.currentFrame = 0;
      animationRef.current.elapsed = 0;
      animationRef.current.isComplete = false;
      animationRef.current.lastAnimation = animation;
    }
  }, [animation]);

  // Get animation data - always use walk for idle (stay on frame 0)
  const animData = useMemo(() => {
    const data = getAnimationData(animation);

    // For idle, always use walk row and stay on frame 0
    // This is more reliable than trying to detect dedicated idle rows
    if (animation === "idle") {
      return getIdleFallbackData();
    }

    return data;
  }, [animation]);

  // Calculate the row based on direction
  const row = useMemo(() => {
    // For hurt animation, there's only one row (facing down)
    if (animation === "hurt") {
      return animData.downRow;
    }

    // Get direction offset
    const directionOffsets: Record<LPCDirection, number> = {
      up: 0,
      left: 1,
      down: 2,
      right: 3,
    };

    return animData.baseRow + directionOffsets[direction];
  }, [animation, animData, direction]);

  // Number of frames for current animation
  const frameCount = useMemo(() => {
    return animData.frames;
  }, [animData]);

  // Always use walk frame 0 for idle - no dedicated idle animation detection
  const hasIdleAnimation = false;

  // Current frame texture
  const [currentFrameTexture, setCurrentFrameTexture] = useState<Texture | null>(null);

  // Animation tick
  useTick(
    useCallback(
      (ticker: Ticker) => {
        if (!isLoaded || !baseTexture || loadError) return;

        const ref = animationRef.current;

        // For idle: animate if we have dedicated idle animation, otherwise stay on frame 0
        if (animation === "idle" && !hasIdleAnimation) {
          // Using walk fallback - stay on frame 0
          ref.currentFrame = 0;
        } else if (animation === "idle" && hasIdleAnimation) {
          // Animate through idle frames slowly
          ref.elapsed += ticker.deltaTime * animationSpeed * 0.5; // Half speed for idle

          if (ref.elapsed >= 1) {
            ref.elapsed = 0;
            ref.currentFrame = (ref.currentFrame + 1) % frameCount;
          }
        } else {
          // Advance animation
          ref.elapsed += ticker.deltaTime * animationSpeed;

          if (ref.elapsed >= 1) {
            ref.elapsed = 0;
            ref.currentFrame++;

            if (ref.currentFrame >= frameCount) {
              if (loop) {
                ref.currentFrame = 0;
              } else {
                ref.currentFrame = frameCount - 1;
                if (!ref.isComplete) {
                  ref.isComplete = true;
                  onAnimationComplete?.();
                }
              }
            }
          }
        }

        // Create frame texture
        const frameX = ref.currentFrame * LPC_FRAME_WIDTH;
        const frameY = row * LPC_FRAME_HEIGHT;

        // Ensure we don't go out of bounds
        const sourceWidth = baseTexture.source?.width || 0;
        const sourceHeight = baseTexture.source?.height || 0;

        if (
          frameX + LPC_FRAME_WIDTH <= sourceWidth &&
          frameY + LPC_FRAME_HEIGHT <= sourceHeight
        ) {
          const frameTexture = new Texture({
            source: baseTexture.source,
            frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
          });
          setCurrentFrameTexture(frameTexture);
        }
      },
      [
        isLoaded,
        baseTexture,
        loadError,
        animation,
        animationSpeed,
        frameCount,
        loop,
        row,
        onAnimationComplete,
        hasIdleAnimation,
      ]
    )
  );

  // Initialize first frame texture when loaded
  useEffect(() => {
    if (isLoaded && baseTexture && !currentFrameTexture) {
      const frameX = 0;
      const frameY = row * LPC_FRAME_HEIGHT;

      const sourceWidth = baseTexture.source?.width || 0;
      const sourceHeight = baseTexture.source?.height || 0;

      if (
        frameX + LPC_FRAME_WIDTH <= sourceWidth &&
        frameY + LPC_FRAME_HEIGHT <= sourceHeight
      ) {
        const frameTexture = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
        });
        setCurrentFrameTexture(frameTexture);
      }
    }
  }, [isLoaded, baseTexture, row, currentFrameTexture]);

  // Don't render if not loaded or error
  if (!isLoaded || loadError || !currentFrameTexture) {
    return null;
  }

  return (
    <pixiSprite
      texture={currentFrameTexture}
      x={x}
      y={y}
      scale={scale}
      anchor={{ x: anchorX, y: anchorY }}
      alpha={alpha}
      tint={tint}
    />
  );
}

// Hook for managing character animation state
export function useCharacterAnimation(initialAnimation: LPCAnimationType = "idle") {
  const [animation, setAnimation] = useState<LPCAnimationType>(initialAnimation);
  const [isPlayingOneShot, setIsPlayingOneShot] = useState(false);

  const playAnimation = useCallback(
    (
      anim: LPCAnimationType,
      options?: { loop?: boolean; onComplete?: () => void }
    ) => {
      const { loop = true, onComplete } = options || {};

      setAnimation(anim);

      if (!loop) {
        setIsPlayingOneShot(true);
        return () => {
          setIsPlayingOneShot(false);
          setAnimation("idle");
          onComplete?.();
        };
      }

      return () => {};
    },
    []
  );

  const onAnimationComplete = useCallback(() => {
    if (isPlayingOneShot) {
      setIsPlayingOneShot(false);
      setAnimation("idle");
    }
  }, [isPlayingOneShot]);

  return {
    animation,
    isPlayingOneShot,
    playAnimation,
    onAnimationComplete,
    setAnimation,
  };
}

export default AnimatedCharacter;
