import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { Ticker } from "pixi.js";
import { CLASS_CONFIGS } from "../../../data/classes";
import type { Player, StatusEffect } from "../../../types";
import { AnimatedCharacter, type LPCAnimationType } from "./AnimatedCharacter";
import { getSprite, hasSprite, LPC_FRAME_HEIGHT } from "../../../assets/sprites/classes";
import { useGameStore } from "../../../store/gameStore";

// Higher resolution for crisp text when scaled
const TEXT_RESOLUTION = 2;

// Text styles with high resolution for sharpness
const nameStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 11,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 2 },
});

const classStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 8,
  fill: 0xaaaaaa,
  stroke: { color: 0x000000, width: 1 },
});

const hpStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 9,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 1 },
});

const shieldStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 8,
  fontWeight: "bold",
  fill: 0x60a5fa,
  stroke: { color: 0x000000, width: 1 },
});

const targetStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 8,
  fontWeight: "bold",
  fill: 0xffffff,
});

const effectTextStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 7,
  fill: 0xffffff,
});

interface PlayerSpriteProps {
  player: Player;
  x: number;
  y: number;
  isCurrentPlayer?: boolean;
  isTargeted?: boolean;
  scaleFactor?: number;
}

// Convert hex color string to number
function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

// Get effect display info with emoji icons like old UI
function getEffectInfo(effect: StatusEffect, isBuff: boolean): {
  color: number;
  emoji: string;
  name: string;
  bgColor: number;
} {
  switch (effect.type) {
    case "poison":
      return { color: 0x22c55e, emoji: "☠️", name: "poison", bgColor: 0x14532d };
    case "burn":
      return { color: 0xf97316, emoji: "🔥", name: "burn", bgColor: 0x7c2d12 };
    case "ice":
      return { color: 0x38bdf8, emoji: "❄️", name: "frozen", bgColor: 0x0c4a6e };
    case "stun":
      return { color: 0xfbbf24, emoji: "⚡", name: "stun", bgColor: 0x78350f };
    case "stealth":
      return { color: 0x8b5cf6, emoji: "👁️", name: "stealth", bgColor: 0x4c1d95 };
    case "taunt":
      return { color: 0xf97316, emoji: "🛡️", name: "taunt", bgColor: 0x7c2d12 };
    case "strength":
      return { color: 0xef4444, emoji: "⚔️", name: "strength", bgColor: 0x7f1d1d };
    case "shield":
      return { color: 0x3b82f6, emoji: "🛡️", name: "shield", bgColor: 0x1e3a5f };
    case "weakness":
      return { color: 0xef4444, emoji: "💔", name: "weakness", bgColor: 0x7f1d1d };
    case "heal":
      return { color: 0x22c55e, emoji: "💚", name: "regen", bgColor: 0x14532d };
    case "block":
      return { color: 0x6b7280, emoji: "🔒", name: "block", bgColor: 0x374151 };
    default:
      return {
        color: isBuff ? 0x22c55e : 0xef4444,
        emoji: isBuff ? "✨" : "💔",
        name: effect.type,
        bgColor: isBuff ? 0x14532d : 0x7f1d1d
      };
  }
}

export function PlayerSprite({
  player,
  x,
  y,
  isCurrentPlayer: _isCurrentPlayer = false,
  isTargeted = false,
  scaleFactor = 2.0
}: PlayerSpriteProps) {
  // Note: _isCurrentPlayer is available for future use (yellow ring was removed per user request)
  const config = CLASS_CONFIGS[player.class];

  // Check if this class has a sprite
  const spriteUrl = getSprite(player.class);
  const useAnimatedSprite = hasSprite(player.class);

  // Listen for attack animations from the store
  const attackingEntityId = useGameStore((state) => state.animation.attackingEntityId);
  const attackAnimation = useGameStore((state) => state.animation.attackAnimation);

  // Animation state - use ref for breathing to avoid re-renders every frame
  const breathingRef = useRef({ offsetY: 0, lastUpdate: 0 });
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [characterAnimation, setCharacterAnimation] = useState<LPCAnimationType>("idle");
  const [tint, setTint] = useState(0xffffff);
  const animationRef = useRef({
    time: Math.random() * Math.PI * 2,
    prevHp: player.hp,
    isAnimating: false
  });

  // Handle attack animation triggered from store
  useEffect(() => {
    if (attackingEntityId === player.id && attackAnimation && useAnimatedSprite) {
      animationRef.current.isAnimating = true;
      setCharacterAnimation(attackAnimation);
    }
  }, [attackingEntityId, attackAnimation, player.id, useAnimatedSprite]);

  // Reset to idle when attack animation is cleared
  useEffect(() => {
    if (!attackingEntityId && animationRef.current.isAnimating) {
      animationRef.current.isAnimating = false;
      setCharacterAnimation("idle");
    }
  }, [attackingEntityId]);

  // Idle breathing animation - subtle y offset for all sprites (throttled to reduce re-renders)
  useTick(useCallback((ticker: Ticker) => {
    animationRef.current.time += ticker.deltaTime * 0.04;
    // Subtle breathing effect for idle
    breathingRef.current.offsetY = Math.sin(animationRef.current.time) * 2;

    // Only update state every 50ms (~20fps) - breathing doesn't need 60fps
    const now = Date.now();
    if (now - breathingRef.current.lastUpdate > 50) {
      breathingRef.current.lastUpdate = now;
      setOffsetY(breathingRef.current.offsetY);
    }
  }, []));

  // Damage flash effect and hurt animation
  useEffect(() => {
    if (player.hp < animationRef.current.prevHp) {
      setScale(0.85);
      setTint(0xff6666);

      if (useAnimatedSprite && !animationRef.current.isAnimating) {
        animationRef.current.isAnimating = true;
        setCharacterAnimation("hurt");
      }

      const timer = setTimeout(() => {
        setScale(1);
        setTint(0xffffff);
        if (useAnimatedSprite) {
          setCharacterAnimation("idle");
          animationRef.current.isAnimating = false;
        }
      }, 400);

      animationRef.current.prevHp = player.hp;
      return () => clearTimeout(timer);
    }
    animationRef.current.prevHp = player.hp;
  }, [player.hp, useAnimatedSprite]);

  const handleAnimationComplete = useCallback(() => {
    setCharacterAnimation("idle");
    animationRef.current.isAnimating = false;
  }, []);

  // Dimensions
  const barWidth = 70;
  const barHeight = 8;
  const bodySize = 35;
  const healthPercent = Math.max(0, player.hp / player.maxHp);
  const resourcePercent = player.maxResource > 0 ? player.resource / player.maxResource : 0;

  // Colors
  const classColor = hexToNumber(config?.color || "#888888");
  const bodyColor = !player.isAlive ? 0x4a4a4a : classColor;

  // Calculate final scale
  const finalScale = scale * scaleFactor;

  // Base Y positions for UI elements
  const spriteTopY = useAnimatedSprite ? -LPC_FRAME_HEIGHT + 8 : -bodySize / 2 - 25;
  const barBaseY = spriteTopY - 12;

  // Combine buffs and debuffs with labels
  const allEffects = [
    ...player.buffs.map(e => ({ effect: e, isBuff: true })),
    ...player.debuffs.map(e => ({ effect: e, isBuff: false }))
  ];

  return (
    <pixiContainer x={x} y={y + offsetY} scale={finalScale} alpha={player.isAlive ? 1 : 0.3}>
      {/* Targeted indicator (highest aggro) - bullseye icon in top right */}
      {isTargeted && player.isAlive && (
        <pixiText
          text="🎯"
          style={targetStyle}
          resolution={TEXT_RESOLUTION}
          anchor={{ x: 0.5, y: 0.5 }}
          x={25}
          y={barBaseY - 16}
        />
      )}

      {/* Player Body - Animated Sprite or Graphics Fallback */}
      {useAnimatedSprite && spriteUrl ? (
        <>
          {/* Shadow under animated sprite */}
          <pixiGraphics
            draw={(g) => {
              g.clear();
              g.ellipse(0, 8, 22, 7);
              g.fill({ color: 0x000000, alpha: 0.4 });
            }}
          />
          {/* Animated character sprite */}
          <AnimatedCharacter
            spriteUrl={spriteUrl}
            animation={characterAnimation}
            direction="down"
            animationSpeed={characterAnimation === "idle" ? 0.08 : 0.2}
            loop={characterAnimation === "idle" || characterAnimation === "walk"}
            onAnimationComplete={handleAnimationComplete}
            y={8}
            scale={1.0}
            alpha={player.isAlive ? 1 : 0.5}
            tint={tint}
          />
          {/* Status effects overlay */}
          <pixiGraphics
            draw={(g) => {
              g.clear();
              if (player.shield > 0) {
                g.circle(0, -LPC_FRAME_HEIGHT / 2 + 8, 34);
                g.stroke({ color: 0x3b82f6, width: 3, alpha: 0.7 });
              }
              if (player.isStealth) {
                g.rect(-32, -LPC_FRAME_HEIGHT + 8, 64, LPC_FRAME_HEIGHT);
                g.fill({ color: 0x8b5cf6, alpha: 0.25 });
              }
              if (player.hasTaunt) {
                g.circle(0, -LPC_FRAME_HEIGHT / 2 + 8, 38);
                g.stroke({ color: 0xf97316, width: 4, alpha: 0.8 });
              }
            }}
          />
        </>
      ) : (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.ellipse(0, bodySize / 2 + 5, bodySize / 2, bodySize / 8);
            g.fill({ color: 0x000000, alpha: 0.2 });
            g.roundRect(-bodySize / 2, -bodySize / 2, bodySize, bodySize + 10, 8);
            g.fill({ color: 0x374151 });
            g.stroke({ color: bodyColor, width: 3 });
            g.circle(0, -bodySize / 2 - 10, 14);
            g.fill({ color: 0xfcd34d });
            g.stroke({ color: 0x000000, width: 1 });
            g.circle(-4, -bodySize / 2 - 12, 2);
            g.circle(4, -bodySize / 2 - 12, 2);
            g.fill({ color: 0x000000 });
            g.circle(0, -bodySize / 6, 8);
            g.fill({ color: bodyColor });
            if (player.shield > 0) {
              g.circle(0, 0, bodySize / 2 + 5);
              g.stroke({ color: 0x3b82f6, width: 2, alpha: 0.6 });
            }
            if (player.isStealth) {
              g.rect(-bodySize / 2 - 5, -bodySize / 2 - 30, bodySize + 10, bodySize + 45);
              g.fill({ color: 0x8b5cf6, alpha: 0.2 });
            }
            if (player.hasTaunt) {
              g.circle(0, 0, bodySize / 2 + 8);
              g.stroke({ color: 0xf97316, width: 3, alpha: 0.7 });
            }
          }}
        />
      )}

      {/* Health Bar Background */}
      <pixiGraphics
        x={-barWidth / 2}
        y={barBaseY}
        draw={(g) => {
          g.clear();
          g.roundRect(0, 0, barWidth, barHeight, 3);
          g.fill({ color: 0x1a1a1a });
          g.stroke({ color: 0x444444, width: 1 });
        }}
      />

      {/* Health Bar Fill */}
      <pixiGraphics
        x={-barWidth / 2 + 1}
        y={barBaseY + 1}
        draw={(g) => {
          g.clear();
          if (healthPercent > 0) {
            const healthColor = healthPercent > 0.5 ? 0xef4444 : healthPercent > 0.25 ? 0xeab308 : 0xdc2626;
            g.roundRect(0, 0, (barWidth - 2) * healthPercent, barHeight - 2, 2);
            g.fill({ color: healthColor });
          }
        }}
      />

      {/* Shield overlay on health bar */}
      {player.shield > 0 && (
        <pixiGraphics
          x={-barWidth / 2 + 1 + (barWidth - 2) * healthPercent}
          y={barBaseY + 1}
          draw={(g) => {
            g.clear();
            const shieldWidth = Math.min(
              (player.shield / player.maxHp) * (barWidth - 2),
              (barWidth - 2) - (barWidth - 2) * healthPercent
            );
            if (shieldWidth > 0) {
              g.roundRect(0, 0, shieldWidth, barHeight - 2, 2);
              g.fill({ color: 0x3b82f6, alpha: 0.8 });
            }
          }}
        />
      )}

      {/* Resource Bar (if applicable) */}
      {player.maxResource > 0 && (
        <>
          <pixiGraphics
            x={-barWidth / 2}
            y={barBaseY - 6}
            draw={(g) => {
              g.clear();
              g.roundRect(0, 0, barWidth, 4, 2);
              g.fill({ color: 0x1a1a1a });
            }}
          />
          <pixiGraphics
            x={-barWidth / 2 + 1}
            y={barBaseY - 5}
            draw={(g) => {
              g.clear();
              if (resourcePercent > 0) {
                g.roundRect(0, 0, (barWidth - 2) * resourcePercent, 2, 1);
                g.fill({ color: classColor });
              }
            }}
          />
        </>
      )}

      {/* HP Text with heart icon */}
      <pixiText
        text={`❤️ ${player.hp}/${player.maxHp}`}
        style={hpStyle}
        resolution={TEXT_RESOLUTION}
        anchor={{ x: 0.5, y: 0.5 }}
        x={0}
        y={barBaseY + barHeight / 2}
      />

      {/* Shield amount text */}
      {player.shield > 0 && (
        <pixiText
          text={`+${player.shield}`}
          style={shieldStyle}
          resolution={TEXT_RESOLUTION}
          anchor={{ x: 0, y: 0.5 }}
          x={barWidth / 2 + 4}
          y={barBaseY + barHeight / 2}
        />
      )}

      {/* Player Name */}
      <pixiText
        text={player.name}
        style={nameStyle}
        resolution={TEXT_RESOLUTION}
        anchor={{ x: 0.5, y: 1 }}
        x={0}
        y={barBaseY - (player.maxResource > 0 ? 10 : 4)}
      />

      {/* Class label */}
      <pixiText
        text={config?.name || player.class}
        style={classStyle}
        resolution={TEXT_RESOLUTION}
        anchor={{ x: 0.5, y: 0 }}
        x={0}
        y={barBaseY + barHeight + 2}
      />

      {/* Status Effects - Pill badges like old UI: "💔 weakness (1)" */}
      {allEffects.length > 0 && (
        <pixiContainer y={useAnimatedSprite ? 20 : bodySize / 2 + 22}>
          {allEffects.map(({ effect, isBuff }, i) => {
            const info = getEffectInfo(effect, isBuff);
            const badgeWidth = 55;
            const effectY = i * 14;

            return (
              <pixiContainer key={`${effect.type}-${i}`} x={0} y={effectY}>
                {/* Pill background */}
                <pixiGraphics
                  draw={(g) => {
                    g.clear();
                    g.roundRect(-badgeWidth / 2, -6, badgeWidth, 12, 6);
                    g.fill({ color: info.bgColor, alpha: 0.9 });
                    g.stroke({ color: info.color, width: 1 });
                  }}
                />
                {/* Effect text: "💔 weakness (1)" */}
                <pixiText
                  text={`${info.emoji} ${info.name}${effect.duration > 0 ? ` (${effect.duration})` : ""}`}
                  style={effectTextStyle}
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

      {/* Stunned indicator - animated stars */}
      {player.isStunned && (
        <pixiGraphics
          x={0}
          y={barBaseY - 20}
          draw={(g) => {
            g.clear();
            for (let i = 0; i < 3; i++) {
              const angle = (i / 3) * Math.PI * 2 + Date.now() * 0.003;
              const starX = Math.cos(angle) * 18;
              const starY = Math.sin(angle) * 10;
              // Star shape
              g.circle(starX, starY, 4);
              g.fill({ color: 0xfbbf24 });
              g.stroke({ color: 0xffffff, width: 1 });
            }
          }}
        />
      )}
    </pixiContainer>
  );
}
