import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle, Assets, Texture, Rectangle } from "pixi.js";
import type { Ticker, FederatedPointerEvent } from "pixi.js";
import type { Monster, StatusEffect } from "../../../types";
import { useGameStore } from "../../../store/gameStore";

// LPC spritesheet constants (same as player sprites)
const LPC_FRAME_WIDTH = 64;
const LPC_FRAME_HEIGHT = 64;

// Animation rows (facing left to face the players)
const LPC_ROWS = {
  WALK_LEFT: 9,
  SLASH_LEFT: 13, // Slash animation - left facing
  CAST_LEFT: 1, // Spellcast animation - left facing
};

// Animation frame counts
const LPC_FRAME_COUNTS = {
  WALK: 9,
  SLASH: 6,
  CAST: 7,
};

// Spritesheet type detection
type SpritesheetType = "lpc" | "horizontal_strip" | "simple" | "static";

interface SpritesheetInfo {
  type: SpritesheetType;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  rows: number;
}

// Higher resolution for crisp text when scaled
const TEXT_RESOLUTION = 2;

// Text styles with reduced stroke for sharpness
const nameStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 2 },
});

const hpStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 10,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 1 },
});

const intentStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 10,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 1 },
});

const effectLabelStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 8,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 1 },
});

interface MonsterSpriteProps {
  monster: Monster;
  x: number;
  y: number;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (monsterId: string) => void;
  scaleFactor?: number;
}

// Get effect display info with emoji and full name
function getEffectInfo(effect: StatusEffect): {
  color: number;
  emoji: string;
  name: string;
  bgColor: number;
} {
  switch (effect.type) {
    case "poison":
      return { color: 0x22c55e, emoji: "🧪", name: "poison", bgColor: 0x14532d };
    case "burn":
      return { color: 0xf97316, emoji: "🔥", name: "burn", bgColor: 0x7c2d12 };
    case "ice":
      return { color: 0x38bdf8, emoji: "❄️", name: "freeze", bgColor: 0x0c4a6e };
    case "stun":
      return { color: 0xfbbf24, emoji: "⚡", name: "stun", bgColor: 0x78350f };
    case "weakness":
      return { color: 0xa855f7, emoji: "💔", name: "weakness", bgColor: 0x581c87 };
    default:
      return {
        color: 0xef4444,
        emoji: "❓",
        name: effect.type,
        bgColor: 0x7f1d1d
      };
  }
}

export function MonsterSprite({
  monster,
  x,
  y,
  isSelectable = false,
  isSelected = false,
  onSelect,
  scaleFactor = 1.0
}: MonsterSpriteProps) {
  // Listen for attack animations from the store
  const attackingEntityId = useGameStore((state) => state.animation.attackingEntityId);
  const attackAnimation = useGameStore((state) => state.animation.attackAnimation);

  // Image texture state
  const [baseTexture, setBaseTexture] = useState<Texture | null>(null);
  const [frameTexture, setFrameTexture] = useState<Texture | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [spritesheetInfo, setSpritesheetInfo] = useState<SpritesheetInfo | null>(null);

  // Animation state - use refs for values that update every frame to reduce re-renders
  const breathingRef = useRef({ offsetY: 0, selectionPulse: 1, lastUpdate: 0 });
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentAnimationType, setCurrentAnimationType] = useState<"idle" | "slash" | "cast">("idle");
  const animationRef = useRef({
    time: Math.random() * Math.PI * 2,
    prevHp: monster.hp,
    currentFrame: 0,
    elapsed: 0,
    isAttacking: false
  });

  // Selection pulse animation
  const [selectionPulse, setSelectionPulse] = useState(1);

  // Handle attack animation triggered from store
  useEffect(() => {
    if (attackingEntityId === monster.id && attackAnimation && spritesheetInfo?.type === "lpc") {
      const animType = attackAnimation === "slash" || attackAnimation === "thrust" ? "slash" : "cast";
      animationRef.current.isAttacking = true;
      animationRef.current.currentFrame = 0;
      animationRef.current.elapsed = 0;
      setCurrentAnimationType(animType);
    }
  }, [attackingEntityId, attackAnimation, monster.id, spritesheetInfo]);

  // Reset to idle when attack animation is cleared
  useEffect(() => {
    if (!attackingEntityId && animationRef.current.isAttacking) {
      animationRef.current.isAttacking = false;
      animationRef.current.currentFrame = 0;
      animationRef.current.elapsed = 0;
      setCurrentAnimationType("idle");
    }
  }, [attackingEntityId]);

  // Detect spritesheet type from dimensions
  const detectSpritesheetType = useCallback((width: number, height: number): SpritesheetInfo => {
    // Check for full LPC spritesheet (has enough rows for all animations)
    const lpcCols = Math.floor(width / LPC_FRAME_WIDTH);
    const lpcRows = Math.floor(height / LPC_FRAME_HEIGHT);

    // Full LPC needs at least row 9 (WALK_LEFT) accessible
    if (lpcCols >= 6 && lpcRows >= 10) {
      return {
        type: "lpc",
        frameWidth: LPC_FRAME_WIDTH,
        frameHeight: LPC_FRAME_HEIGHT,
        frameCount: lpcCols,
        rows: lpcRows,
      };
    }

    // Simple grid spritesheet (multiple rows/cols of 64x64 frames, but not full LPC)
    if (lpcCols >= 2 && lpcRows >= 2) {
      return {
        type: "simple",
        frameWidth: LPC_FRAME_WIDTH,
        frameHeight: LPC_FRAME_HEIGHT,
        frameCount: lpcCols,
        rows: lpcRows,
      };
    }

    // Horizontal strip (single row of frames) - detect by aspect ratio
    // If width is significantly larger than height, it's likely a horizontal strip
    if (width > height * 1.5) {
      // Try to detect frame count - prioritize 4 frames (most common for idle animations)
      // then try other common counts
      const candidates = [4, 6, 3, 8, 2]; // Ordered by likelihood for game sprites

      for (const count of candidates) {
        const frameWidth = width / count;
        const remainder = width % count;

        // Frame should be at least 20px wide
        // Allow small remainder (sprites aren't always perfectly aligned)
        if (frameWidth >= 20 && remainder <= 4) {
          return {
            type: "horizontal_strip",
            frameWidth: Math.floor(frameWidth),
            frameHeight: height,
            frameCount: count,
            rows: 1,
          };
        }
      }

      // Fallback: just divide by 2 or use as static
      const frameCount = width > height * 2 ? 2 : 1;
      return {
        type: frameCount > 1 ? "horizontal_strip" : "static",
        frameWidth: Math.floor(width / frameCount),
        frameHeight: height,
        frameCount,
        rows: 1,
      };
    }

    // Static image (single frame)
    return {
      type: "static",
      frameWidth: width,
      frameHeight: height,
      frameCount: 1,
      rows: 1,
    };
  }, []);

  // Load monster image
  useEffect(() => {
    if (monster.image) {
      let cancelled = false;
      Assets.load<Texture>(monster.image)
        .then((tex) => {
          if (!cancelled) {
            setBaseTexture(tex);

            const sourceWidth = tex.source?.width || 0;
            const sourceHeight = tex.source?.height || 0;

            // Detect spritesheet type
            const info = detectSpritesheetType(sourceWidth, sourceHeight);
            setSpritesheetInfo(info);

            // Extract first frame based on spritesheet type
            if (info.type === "lpc") {
              // Use walk row frame 0 for initial idle pose
              const animRow = LPC_ROWS.WALK_LEFT;
              const frameX = 0;
              const frameY = animRow * LPC_FRAME_HEIGHT;

              if (frameX + LPC_FRAME_WIDTH <= sourceWidth && frameY + LPC_FRAME_HEIGHT <= sourceHeight) {
                const initialFrame = new Texture({
                  source: tex.source,
                  frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
                });
                setFrameTexture(initialFrame);
              } else {
                // Fallback to first frame if walk row not available
                setFrameTexture(new Texture({
                  source: tex.source,
                  frame: new Rectangle(0, 0, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
                }));
              }
            } else if (info.type === "horizontal_strip") {
              // Extract first frame from strip with 2px inset to avoid separator lines
              const slotWidth = sourceWidth / info.frameCount;
              const inset = 2; // Skip potential separators
              const frameWidth = Math.floor(slotWidth) - inset * 2;
              const initialFrame = new Texture({
                source: tex.source,
                frame: new Rectangle(inset, 0, frameWidth, info.frameHeight),
              });
              setFrameTexture(initialFrame);
            } else if (info.type === "simple") {
              // Extract first frame from grid
              const initialFrame = new Texture({
                source: tex.source,
                frame: new Rectangle(0, 0, info.frameWidth, info.frameHeight),
              });
              setFrameTexture(initialFrame);
            } else {
              // Static image - use the whole texture
              setFrameTexture(tex);
            }

            setImageLoaded(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setImageLoaded(false);
          }
        });
      return () => { cancelled = true; };
    }
  }, [monster.image, detectSpritesheetType]);

  // Handle click
  const handleClick = useCallback((e: FederatedPointerEvent) => {
    if (isSelectable && onSelect && monster.isAlive) {
      e.stopPropagation();
      onSelect(monster.id);
    }
  }, [isSelectable, onSelect, monster.id, monster.isAlive]);

  // Animation tick - idle bobbing, selection pulse, and spritesheet animation
  useTick(useCallback((ticker: Ticker) => {
    const ref = animationRef.current;
    ref.time += ticker.deltaTime * 0.05;

    // Subtle breathing/bobbing (reduced when attacking)
    const bobAmount = ref.isAttacking ? 1 : 3;
    breathingRef.current.offsetY = Math.sin(ref.time) * bobAmount;

    // Selection pulse
    if (isSelectable) {
      breathingRef.current.selectionPulse = Math.sin(ref.time * 3) * 0.1 + 0.95;
    }

    // Throttle state updates to ~20fps for breathing - doesn't need 60fps
    const now = Date.now();
    if (now - breathingRef.current.lastUpdate > 50) {
      breathingRef.current.lastUpdate = now;
      setOffsetY(breathingRef.current.offsetY);
      if (isSelectable) {
        setSelectionPulse(breathingRef.current.selectionPulse);
      }
    }

    // Animate spritesheet if loaded (only for LPC type)
    if (spritesheetInfo?.type === "lpc" && baseTexture && imageLoaded) {
      // Determine row and frame count based on current animation type
      let animRow: number;
      let frameCount: number;
      let animSpeed: number;

      if (currentAnimationType === "slash") {
        animRow = LPC_ROWS.SLASH_LEFT;
        frameCount = LPC_FRAME_COUNTS.SLASH;
        animSpeed = 0.25; // Faster for attacks
      } else if (currentAnimationType === "cast") {
        animRow = LPC_ROWS.CAST_LEFT;
        frameCount = LPC_FRAME_COUNTS.CAST;
        animSpeed = 0.2;
      } else {
        // Idle - use walk row frame 0 (standing pose)
        animRow = LPC_ROWS.WALK_LEFT;
        frameCount = 1; // Stay on frame 0
        animSpeed = 0.08;
      }

      const sourceWidth = baseTexture.source?.width || 0;
      const sourceHeight = baseTexture.source?.height || 0;

      if (frameCount > 1) {
        // Animate through frames
        ref.elapsed += ticker.deltaTime * animSpeed;

        if (ref.elapsed >= 1) {
          ref.elapsed = 0;
          ref.currentFrame = (ref.currentFrame + 1) % frameCount;

          const frameX = ref.currentFrame * LPC_FRAME_WIDTH;
          const frameY = animRow * LPC_FRAME_HEIGHT;

          if (frameX + LPC_FRAME_WIDTH <= sourceWidth && frameY + LPC_FRAME_HEIGHT <= sourceHeight) {
            const newFrame = new Texture({
              source: baseTexture.source,
              frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
            });
            setFrameTexture(newFrame);
          }
        }
      } else {
        // Stay on frame 0 (walk fallback for idle)
        if (ref.currentFrame !== 0) {
          ref.currentFrame = 0;
          const frameX = 0;
          const frameY = animRow * LPC_FRAME_HEIGHT;

          if (frameX + LPC_FRAME_WIDTH <= sourceWidth && frameY + LPC_FRAME_HEIGHT <= sourceHeight) {
            const newFrame = new Texture({
              source: baseTexture.source,
              frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
            });
            setFrameTexture(newFrame);
          }
        }
      }
    }

    // Simple idle animation for horizontal strips (cycle through frames slowly)
    if (spritesheetInfo?.type === "horizontal_strip" && baseTexture && imageLoaded && spritesheetInfo.frameCount > 1) {
      ref.elapsed += ticker.deltaTime * 0.05; // Slow animation
      if (ref.elapsed >= 1) {
        ref.elapsed = 0;
        ref.currentFrame = (ref.currentFrame + 1) % spritesheetInfo.frameCount;

        // Calculate frame position with 2px inset to avoid separator lines
        const sourceWidth = baseTexture.source?.width || 0;
        const slotWidth = sourceWidth / spritesheetInfo.frameCount;
        const inset = 2;
        const frameX = Math.floor(ref.currentFrame * slotWidth) + inset;
        const frameWidth = Math.floor(slotWidth) - inset * 2;

        const newFrame = new Texture({
          source: baseTexture.source,
          frame: new Rectangle(frameX, 0, frameWidth, spritesheetInfo.frameHeight),
        });
        setFrameTexture(newFrame);
      }
    }
  }, [isSelectable, spritesheetInfo, baseTexture, imageLoaded, currentAnimationType]));

  // Damage flash effect
  useEffect(() => {
    if (monster.hp < animationRef.current.prevHp) {
      setScale(0.9);
      const timer = setTimeout(() => setScale(1), 150);
      animationRef.current.prevHp = monster.hp;
      return () => clearTimeout(timer);
    }
    animationRef.current.prevHp = monster.hp;
  }, [monster.hp]);

  // Dimensions
  const barWidth = 90;
  const barHeight = 10;
  const healthPercent = Math.max(0, monster.hp / monster.maxHp);

  // Sprite display size based on spritesheet type
  const isLpcSprite = spritesheetInfo?.type === "lpc";
  const isAnimatedSprite = spritesheetInfo && spritesheetInfo.type !== "static";
  const spriteSize = isLpcSprite
    ? LPC_FRAME_HEIGHT * 1.2
    : spritesheetInfo
      ? Math.max(spritesheetInfo.frameHeight, 64)
      : (imageLoaded ? 80 : 50);
  const isLarge = monster.name.includes("Dragon") || monster.name.includes("Boss") || monster.name.includes("Lord");
  const bodySize = isLarge ? 70 : 50;

  // Color based on status (for fallback graphics)
  const bodyColor = !monster.isAlive
    ? 0x4a4a4a
    : monster.debuffs.length > 0
    ? 0x8b5cf6
    : 0xb91c1c;

  // Calculate final scale
  const finalScale = scale * scaleFactor * (isSelectable ? selectionPulse : 1);

  // Layout positions
  const effectiveSpriteSize = imageLoaded ? spriteSize : bodySize;
  const nameY = -effectiveSpriteSize / 2 - 25;
  const barY = -effectiveSpriteSize / 2 - 8;
  const intentY = effectiveSpriteSize / 2 + 18;
  const debuffY = effectiveSpriteSize / 2 + 40;

  return (
    <pixiContainer
      x={x}
      y={y + offsetY}
      scale={finalScale}
      alpha={monster.isAlive ? 1 : 0.3}
      eventMode={isSelectable && monster.isAlive ? "static" : "auto"}
      cursor={isSelectable && monster.isAlive ? "pointer" : "default"}
      onPointerTap={handleClick}
    >
      {/* Selection highlight ring */}
      {(isSelectable || isSelected) && monster.isAlive && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            const ringSize = effectiveSpriteSize / 2 + 10;
            g.circle(0, 0, ringSize);
            g.stroke({
              color: isSelected ? 0xf59e0b : 0x22c55e,
              width: isSelected ? 4 : 3,
              alpha: isSelected ? 1 : 0.8
            });
            if (isSelectable && !isSelected) {
              g.circle(0, 0, ringSize - 4);
              g.stroke({ color: 0x22c55e, width: 2, alpha: 0.4 });
            }
          }}
        />
      )}

      {/* Monster Body - Animated Spritesheet, Static Image, or Fallback Graphics */}
      {imageLoaded && frameTexture ? (
        <>
          {/* Shadow */}
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.ellipse(0, effectiveSpriteSize / 2, effectiveSpriteSize / 2.5, effectiveSpriteSize / 8);
              g.fill({ color: 0x000000, alpha: 0.4 });
            }}
          />
          {/* Monster sprite */}
          <pixiSprite
            texture={frameTexture}
            anchor={{ x: 0.5, y: isLpcSprite ? 1 : 0.5 }}
            y={isLpcSprite ? effectiveSpriteSize / 2 : 0}
            scale={isLpcSprite ? 1.2 : (isAnimatedSprite ? 1 : 1)}
            width={isLpcSprite ? undefined : (isAnimatedSprite ? undefined : spriteSize)}
            height={isLpcSprite ? undefined : (isAnimatedSprite ? undefined : spriteSize)}
            tint={monster.isAlive ? (monster.debuffs.length > 0 ? 0xdd99ff : 0xffffff) : 0x888888}
          />
        </>
      ) : (
        <pixiGraphics
          draw={(g) => {
            g.clear();

            // Shadow
            g.ellipse(0, bodySize / 2 + 5, bodySize / 2, bodySize / 6);
            g.fill({ color: 0x000000, alpha: 0.3 });

            // Body circle
            g.circle(0, 0, bodySize / 2);
            g.fill({ color: bodyColor });
            g.stroke({ color: 0x000000, width: 2 });

            // Eyes
            const eyeOffset = bodySize / 5;
            g.circle(-eyeOffset, -bodySize / 10, 6);
            g.circle(eyeOffset, -bodySize / 10, 6);
            g.fill({ color: 0xffffff });

            g.circle(-eyeOffset, -bodySize / 10, 3);
            g.circle(eyeOffset, -bodySize / 10, 3);
            g.fill({ color: 0xff0000 });

            // Mouth
            g.moveTo(-bodySize / 4, bodySize / 6);
            g.quadraticCurveTo(0, bodySize / 3, bodySize / 4, bodySize / 6);
            g.stroke({ color: 0x000000, width: 2 });

            // Spikes/horns for elite/boss
            if (monster.eliteModifier || isLarge) {
              g.moveTo(-bodySize / 3, -bodySize / 2);
              g.lineTo(-bodySize / 4, -bodySize / 2 - 15);
              g.lineTo(-bodySize / 5, -bodySize / 2);
              g.moveTo(bodySize / 3, -bodySize / 2);
              g.lineTo(bodySize / 4, -bodySize / 2 - 15);
              g.lineTo(bodySize / 5, -bodySize / 2);
              g.stroke({ color: bodyColor, width: 3 });
            }
          }}
        />
      )}

      {/* Monster Name - above sprite */}
      <pixiGraphics
        x={0}
        y={nameY}
        draw={(g) => {
          g.clear();
          const nameWidth = monster.name.length * 7 + 16;
          g.roundRect(-nameWidth / 2, -10, nameWidth, 20, 4);
          g.fill({ color: 0x1a1a1a, alpha: 0.85 });
          g.stroke({ color: 0x444444, width: 1 });
        }}
      />
      <pixiText
        text={monster.name}
        style={nameStyle}
        resolution={TEXT_RESOLUTION}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={nameY}
      />

      {/* Health Bar Background */}
      <pixiGraphics
        x={-barWidth / 2}
        y={barY}
        draw={(g) => {
          g.clear();
          g.roundRect(0, 0, barWidth, barHeight, 4);
          g.fill({ color: 0x1a1a1a });
          g.stroke({ color: 0x444444, width: 1 });
        }}
      />

      {/* Health Bar Fill */}
      <pixiGraphics
        x={-barWidth / 2 + 2}
        y={barY + 2}
        draw={(g) => {
          g.clear();
          if (healthPercent > 0) {
            const healthColor = healthPercent > 0.5 ? 0x22c55e : healthPercent > 0.25 ? 0xeab308 : 0xef4444;
            g.roundRect(0, 0, (barWidth - 4) * healthPercent, barHeight - 4, 2);
            g.fill({ color: healthColor });
          }
        }}
      />

      {/* Shield indicator */}
      {monster.shield > 0 && (
        <pixiGraphics
          x={barWidth / 2 + 4}
          y={barY}
          draw={(g) => {
            g.clear();
            g.roundRect(0, 0, 20, barHeight, 4);
            g.fill({ color: 0x3b82f6 });
            g.stroke({ color: 0x60a5fa, width: 1 });
          }}
        />
      )}

      {/* HP Text */}
      <pixiText
        text={`❤️ ${monster.hp}/${monster.maxHp}`}
        style={hpStyle}
        resolution={TEXT_RESOLUTION}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={barY + barHeight / 2}
      />

      {/* Intent indicator */}
      {monster.isAlive && monster.intent && (
        <pixiContainer x={0} y={intentY}>
          <pixiGraphics
            draw={(g) => {
              g.clear();
              const intentWidth = 55;
              g.roundRect(-intentWidth / 2, -10, intentWidth, 20, 4);
              g.fill({ color: monster.intent!.damage > 0 ? 0x7f1d1d : 0x1f2937, alpha: 0.9 });
              g.stroke({ color: monster.intent!.damage > 0 ? 0xef4444 : 0x6b7280, width: 1 });
            }}
          />
          <pixiText
            text={monster.intent.damage > 0 ? `⚔ ${monster.intent.damage}` : "..."}
            style={intentStyle}
            resolution={TEXT_RESOLUTION}
            anchor={{ x: 0.5, y: 0.5 }}
            x={0}
            y={0}
          />
        </pixiContainer>
      )}

      {/* Debuff indicators - pill badges */}
      {monster.debuffs.length > 0 && (
        <pixiContainer y={debuffY}>
          {monster.debuffs.map((debuff, i) => {
            const info = getEffectInfo(debuff);
            const effectY = i * 14;
            const text = `${info.emoji} ${info.name}${debuff.duration > 0 ? ` (${debuff.duration})` : ""}`;
            const pillWidth = text.length * 5 + 12;

            return (
              <pixiContainer key={`${debuff.type}-${i}`} x={0} y={effectY}>
                <pixiGraphics
                  draw={(g) => {
                    g.clear();
                    g.roundRect(-pillWidth / 2, -6, pillWidth, 12, 6);
                    g.fill({ color: info.bgColor, alpha: 0.9 });
                    g.stroke({ color: info.color, width: 1 });
                  }}
                />
                <pixiText
                  text={text}
                  style={effectLabelStyle}
                  resolution={TEXT_RESOLUTION}
                  anchor={{ x: 0.5, y: 0.5 }}
                  x={0}
                  y={0}
                />
              </pixiContainer>
            );
          })}
        </pixiContainer>
      )}
    </pixiContainer>
  );
}
