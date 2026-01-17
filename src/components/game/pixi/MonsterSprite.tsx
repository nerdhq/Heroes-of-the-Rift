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
  const [isSpritesheet, setIsSpritesheet] = useState(false);

  // Animation state
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
    if (attackingEntityId === monster.id && attackAnimation && isSpritesheet) {
      const animType = attackAnimation === "slash" || attackAnimation === "thrust" ? "slash" : "cast";
      animationRef.current.isAttacking = true;
      animationRef.current.currentFrame = 0;
      animationRef.current.elapsed = 0;
      setCurrentAnimationType(animType);
    }
  }, [attackingEntityId, attackAnimation, monster.id, isSpritesheet]);

  // Reset to idle when attack animation is cleared
  useEffect(() => {
    if (!attackingEntityId && animationRef.current.isAttacking) {
      animationRef.current.isAttacking = false;
      animationRef.current.currentFrame = 0;
      animationRef.current.elapsed = 0;
      setCurrentAnimationType("idle");
    }
  }, [attackingEntityId]);

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

            // Check if this is an LPC spritesheet (multiple frames)
            const isLPC = sourceWidth >= LPC_FRAME_WIDTH * 6 && sourceHeight >= LPC_FRAME_HEIGHT * 4;
            setIsSpritesheet(isLPC);

            if (isLPC) {
              // Always use walk row frame 0 for initial idle pose
              const animRow = LPC_ROWS.WALK_LEFT;
              const frameX = 0;
              const frameY = animRow * LPC_FRAME_HEIGHT;

              if (frameX + LPC_FRAME_WIDTH <= sourceWidth && frameY + LPC_FRAME_HEIGHT <= sourceHeight) {
                const initialFrame = new Texture({
                  source: tex.source,
                  frame: new Rectangle(frameX, frameY, LPC_FRAME_WIDTH, LPC_FRAME_HEIGHT),
                });
                setFrameTexture(initialFrame);
              }
            } else {
              // Use the whole texture for static images
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
  }, [monster.image]);

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
    setOffsetY(Math.sin(ref.time) * bobAmount);

    // Selection pulse
    if (isSelectable) {
      setSelectionPulse(Math.sin(ref.time * 3) * 0.1 + 0.95);
    }

    // Animate spritesheet if loaded
    if (isSpritesheet && baseTexture && imageLoaded) {
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

      if (frameCount > 1) {
        // Animate through frames
        ref.elapsed += ticker.deltaTime * animSpeed;

        if (ref.elapsed >= 1) {
          ref.elapsed = 0;
          ref.currentFrame = (ref.currentFrame + 1) % frameCount;

          const frameX = ref.currentFrame * LPC_FRAME_WIDTH;
          const frameY = animRow * LPC_FRAME_HEIGHT;

          const sourceWidth = baseTexture.source?.width || 0;
          const sourceHeight = baseTexture.source?.height || 0;

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
          const sourceWidth = baseTexture.source?.width || 0;
          const sourceHeight = baseTexture.source?.height || 0;

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
  }, [isSelectable, isSpritesheet, baseTexture, imageLoaded, currentAnimationType]));

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

  // Sprite display size
  const spriteSize = isSpritesheet ? LPC_FRAME_HEIGHT * 1.2 : (imageLoaded ? 80 : 50);
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
            anchor={{ x: 0.5, y: isSpritesheet ? 1 : 0.5 }}
            y={isSpritesheet ? effectiveSpriteSize / 2 : 0}
            scale={isSpritesheet ? 1.2 : 1}
            width={isSpritesheet ? undefined : spriteSize}
            height={isSpritesheet ? undefined : spriteSize}
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
