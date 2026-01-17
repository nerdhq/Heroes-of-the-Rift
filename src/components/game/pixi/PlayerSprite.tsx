import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { Ticker } from "pixi.js";
import { CLASS_CONFIGS } from "../../../data/classes";
import type { Player } from "../../../types";

// Text styles
const nameStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 10,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 2 },
});

const hpStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 9,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 1 },
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

export function PlayerSprite({
  player,
  x,
  y,
  isCurrentPlayer = false,
  isTargeted = false,
  scaleFactor = 2.0
}: PlayerSpriteProps) {
  const config = CLASS_CONFIGS[player.class];

  // Animation state
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const animationRef = useRef({ time: Math.random() * Math.PI * 2, prevHp: player.hp });

  // Idle breathing animation
  useTick(useCallback((ticker: Ticker) => {
    animationRef.current.time += ticker.deltaTime * 0.04;
    setOffsetY(Math.sin(animationRef.current.time) * 2);
  }, []));

  // Damage flash effect
  useEffect(() => {
    if (player.hp < animationRef.current.prevHp) {
      // Got hit - flash and shake
      setScale(0.85);
      const timer = setTimeout(() => setScale(1), 150);
      animationRef.current.prevHp = player.hp;
      return () => clearTimeout(timer);
    }
    animationRef.current.prevHp = player.hp;
  }, [player.hp]);

  // Dimensions
  const barWidth = 60;
  const barHeight = 6;
  const bodySize = 35;
  const healthPercent = Math.max(0, player.hp / player.maxHp);
  const resourcePercent = player.maxResource > 0 ? player.resource / player.maxResource : 0;

  // Colors
  const classColor = hexToNumber(config?.color || "#888888");
  const bodyColor = !player.isAlive ? 0x4a4a4a : classColor;

  // Calculate final scale
  const finalScale = scale * scaleFactor;

  return (
    <pixiContainer x={x} y={y + offsetY} scale={finalScale} alpha={player.isAlive ? 1 : 0.3}>
      {/* Current player indicator */}
      {isCurrentPlayer && player.isAlive && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Glowing border around current player
            g.circle(0, 0, bodySize / 2 + 20);
            g.stroke({ color: 0xfbbf24, width: 3, alpha: 0.8 });
          }}
        />
      )}

      {/* Targeted indicator (highest aggro) */}
      {isTargeted && player.isAlive && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Red crosshair/target indicator above player
            const targetY = -bodySize / 2 - 60;
            g.circle(0, targetY, 10);
            g.stroke({ color: 0xef4444, width: 2 });
            g.moveTo(-15, targetY);
            g.lineTo(-5, targetY);
            g.moveTo(5, targetY);
            g.lineTo(15, targetY);
            g.moveTo(0, targetY - 15);
            g.lineTo(0, targetY - 5);
            g.moveTo(0, targetY + 5);
            g.lineTo(0, targetY + 15);
            g.stroke({ color: 0xef4444, width: 2 });
          }}
        />
      )}

      {/* Player Body */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Shadow
          g.ellipse(0, bodySize / 2 + 5, bodySize / 2, bodySize / 8);
          g.fill({ color: 0x000000, alpha: 0.2 });

          // Body (rounded rectangle for humanoid look)
          g.roundRect(-bodySize / 2, -bodySize / 2, bodySize, bodySize + 10, 8);
          g.fill({ color: 0x374151 }); // Dark gray body
          g.stroke({ color: bodyColor, width: 3 });

          // Head
          g.circle(0, -bodySize / 2 - 10, 14);
          g.fill({ color: 0xfcd34d }); // Skin tone
          g.stroke({ color: 0x000000, width: 1 });

          // Eyes
          g.circle(-4, -bodySize / 2 - 12, 2);
          g.circle(4, -bodySize / 2 - 12, 2);
          g.fill({ color: 0x000000 });

          // Class emblem on body
          g.circle(0, -bodySize / 6, 8);
          g.fill({ color: bodyColor });

          // Shield glow if has shield
          if (player.shield > 0) {
            g.circle(0, 0, bodySize / 2 + 5);
            g.stroke({ color: 0x3b82f6, width: 2, alpha: 0.6 });
          }

          // Stealth effect
          if (player.isStealth) {
            g.rect(-bodySize / 2 - 5, -bodySize / 2 - 30, bodySize + 10, bodySize + 45);
            g.fill({ color: 0x8b5cf6, alpha: 0.2 });
          }

          // Taunt indicator
          if (player.hasTaunt) {
            g.circle(0, 0, bodySize / 2 + 8);
            g.stroke({ color: 0xf97316, width: 3, alpha: 0.7 });
          }
        }}
      />

      {/* Health Bar Background */}
      <pixiGraphics
        x={-barWidth / 2}
        y={-bodySize / 2 - 40}
        draw={(g) => {
          g.clear();
          g.roundRect(0, 0, barWidth, barHeight, 2);
          g.fill({ color: 0x1a1a1a });
          g.stroke({ color: 0x333333, width: 1 });
        }}
      />

      {/* Health Bar Fill */}
      <pixiGraphics
        x={-barWidth / 2 + 1}
        y={-bodySize / 2 - 39}
        draw={(g) => {
          g.clear();
          if (healthPercent > 0) {
            g.roundRect(0, 0, (barWidth - 2) * healthPercent, barHeight - 2, 1);
            g.fill({ color: healthPercent > 0.5 ? 0xef4444 : healthPercent > 0.25 ? 0xeab308 : 0xdc2626 });
          }
        }}
      />

      {/* Resource Bar (if applicable) */}
      {player.maxResource > 0 && (
        <>
          <pixiGraphics
            x={-barWidth / 2}
            y={-bodySize / 2 - 48}
            draw={(g) => {
              g.clear();
              g.roundRect(0, 0, barWidth, barHeight - 2, 2);
              g.fill({ color: 0x1a1a1a });
            }}
          />
          <pixiGraphics
            x={-barWidth / 2 + 1}
            y={-bodySize / 2 - 47}
            draw={(g) => {
              g.clear();
              if (resourcePercent > 0) {
                g.roundRect(0, 0, (barWidth - 2) * resourcePercent, barHeight - 4, 1);
                g.fill({ color: classColor });
              }
            }}
          />
        </>
      )}

      {/* Shield value indicator */}
      {player.shield > 0 && (
        <pixiGraphics
          x={barWidth / 2 + 3}
          y={-bodySize / 2 - 40}
          draw={(g) => {
            g.clear();
            g.roundRect(0, 0, 16, barHeight, 2);
            g.fill({ color: 0x3b82f6 });
          }}
        />
      )}

      {/* Status effect indicators */}
      {(player.buffs.length > 0 || player.debuffs.length > 0) && (
        <pixiGraphics
          x={0}
          y={bodySize / 2 + 20}
          draw={(g) => {
            g.clear();
            const allEffects = [...player.buffs, ...player.debuffs];
            allEffects.forEach((effect, i) => {
              const isBuff = player.buffs.includes(effect);
              const effectColor =
                effect.type === "poison" ? 0x22c55e :
                effect.type === "burn" ? 0xf97316 :
                effect.type === "ice" ? 0x38bdf8 :
                effect.type === "stun" ? 0xfbbf24 :
                effect.type === "stealth" ? 0x8b5cf6 :
                effect.type === "taunt" ? 0xf97316 :
                effect.type === "strength" ? 0xef4444 :
                effect.type === "shield" ? 0x3b82f6 :
                isBuff ? 0x22c55e : 0xef4444;

              g.circle(i * 10 - (allEffects.length - 1) * 5, 0, 4);
              g.fill({ color: effectColor });
            });
          }}
        />
      )}

      {/* Stunned indicator */}
      {player.isStunned && (
        <pixiGraphics
          x={0}
          y={-bodySize / 2 - 55}
          draw={(g) => {
            g.clear();
            // Stars around head
            for (let i = 0; i < 3; i++) {
              const angle = (i / 3) * Math.PI * 2 + Date.now() * 0.002;
              const starX = Math.cos(angle) * 15;
              const starY = Math.sin(angle) * 8;
              g.circle(starX, starY, 3);
              g.fill({ color: 0xfbbf24 });
            }
          }}
        />
      )}

      {/* Player Name - above everything */}
      <pixiText
        text={player.name}
        style={nameStyle}
        anchor={{ x: 0.5, y: 1 }}
        x={0}
        y={-bodySize / 2 - 52}
      />

      {/* HP Text - below health bar */}
      <pixiText
        text={`${player.hp}/${player.maxHp}`}
        style={hpStyle}
        anchor={{ x: 0.5, y: 0 }}
        x={0}
        y={-bodySize / 2 - 32}
      />
    </pixiContainer>
  );
}
