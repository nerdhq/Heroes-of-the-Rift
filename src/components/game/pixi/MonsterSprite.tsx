import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { Ticker, FederatedPointerEvent } from "pixi.js";
import type { Monster } from "../../../types";

// Text styles (memoized outside component to avoid recreation)
const nameStyle = new TextStyle({
  fontFamily: "Arial, sans-serif",
  fontSize: 11,
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

interface MonsterSpriteProps {
  monster: Monster;
  x: number;
  y: number;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (monsterId: string) => void;
  scaleFactor?: number;
}

export function MonsterSprite({
  monster,
  x,
  y,
  isSelectable = false,
  isSelected = false,
  onSelect,
  scaleFactor = 2.0
}: MonsterSpriteProps) {
  // Animation state
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const animationRef = useRef({ time: 0, prevHp: monster.hp });

  // Selection pulse animation
  const [selectionPulse, setSelectionPulse] = useState(0);

  // Handle click
  const handleClick = useCallback((e: FederatedPointerEvent) => {
    if (isSelectable && onSelect && monster.isAlive) {
      e.stopPropagation();
      onSelect(monster.id);
    }
  }, [isSelectable, onSelect, monster.id, monster.isAlive]);

  // Idle bobbing animation and selection pulse
  useTick(useCallback((ticker: Ticker) => {
    animationRef.current.time += ticker.deltaTime * 0.05;
    setOffsetY(Math.sin(animationRef.current.time) * 3);

    // Selection pulse for selectable monsters
    if (isSelectable) {
      setSelectionPulse(Math.sin(animationRef.current.time * 3) * 0.15 + 0.85);
    }
  }, [isSelectable]));

  // Damage flash effect
  useEffect(() => {
    if (monster.hp < animationRef.current.prevHp) {
      // Got hit - flash and shake
      setScale(0.9);
      const timer = setTimeout(() => setScale(1), 150);
      animationRef.current.prevHp = monster.hp;
      return () => clearTimeout(timer);
    }
    animationRef.current.prevHp = monster.hp;
  }, [monster.hp]);

  // Health bar dimensions
  const barWidth = 80;
  const barHeight = 8;
  const healthPercent = Math.max(0, monster.hp / monster.maxHp);

  // Monster body size based on type
  const isLarge = monster.name.includes("Dragon") || monster.name.includes("Boss");
  const bodySize = isLarge ? 70 : 50;

  // Color based on status
  const bodyColor = !monster.isAlive
    ? 0x4a4a4a // Gray for dead
    : monster.debuffs.length > 0
    ? 0x8b5cf6 // Purple for debuffed
    : 0xb91c1c; // Red default

  // Calculate final scale (combine damage flash with base scale)
  const finalScale = scale * scaleFactor * (isSelectable ? selectionPulse : 1);

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
            // Outer glow
            g.circle(0, 0, bodySize / 2 + 12);
            g.stroke({
              color: isSelected ? 0xf59e0b : 0x22c55e,
              width: isSelected ? 4 : 2,
              alpha: isSelected ? 1 : 0.7
            });
            // Pulsing ring for selectable
            if (isSelectable && !isSelected) {
              g.circle(0, 0, bodySize / 2 + 8);
              g.stroke({ color: 0x22c55e, width: 2, alpha: 0.4 });
            }
          }}
        />
      )}

      {/* Monster Body */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Shadow
          g.ellipse(0, bodySize / 2, bodySize / 2, bodySize / 6);
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

      {/* Health Bar Background */}
      <pixiGraphics
        x={-barWidth / 2}
        y={-bodySize / 2 - 20}
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
        y={-bodySize / 2 - 19}
        draw={(g) => {
          g.clear();
          if (healthPercent > 0) {
            g.roundRect(0, 0, (barWidth - 2) * healthPercent, barHeight - 2, 1);
            g.fill({ color: healthPercent > 0.5 ? 0x22c55e : healthPercent > 0.25 ? 0xeab308 : 0xef4444 });
          }
        }}
      />

      {/* Shield indicator */}
      {monster.shield > 0 && (
        <pixiGraphics
          x={barWidth / 2 + 5}
          y={-bodySize / 2 - 20}
          draw={(g) => {
            g.clear();
            g.roundRect(0, 0, 20, barHeight, 2);
            g.fill({ color: 0x3b82f6 });
            g.stroke({ color: 0x60a5fa, width: 1 });
          }}
        />
      )}

      {/* Status effect indicators */}
      {monster.debuffs.length > 0 && (
        <pixiGraphics
          x={0}
          y={bodySize / 2 + 15}
          draw={(g) => {
            g.clear();
            monster.debuffs.forEach((debuff, i) => {
              const debuffColor =
                debuff.type === "poison" ? 0x22c55e :
                debuff.type === "burn" ? 0xf97316 :
                debuff.type === "ice" ? 0x38bdf8 :
                debuff.type === "weakness" ? 0xa855f7 :
                0x6b7280;

              g.circle(i * 12 - (monster.debuffs.length - 1) * 6, 0, 5);
              g.fill({ color: debuffColor });
            });
          }}
        />
      )}

      {/* Intent indicator */}
      {monster.isAlive && monster.intent && (
        <pixiGraphics
          x={0}
          y={-bodySize / 2 - 35}
          draw={(g) => {
            g.clear();
            // Intent background
            g.roundRect(-20, -8, 40, 16, 4);
            g.fill({ color: monster.intent!.damage > 0 ? 0x7f1d1d : 0x1f2937, alpha: 0.8 });
            g.stroke({ color: monster.intent!.damage > 0 ? 0xef4444 : 0x6b7280, width: 1 });
          }}
        />
      )}

      {/* Monster Name - above everything */}
      <pixiText
        text={monster.name}
        style={nameStyle}
        anchor={{ x: 0.5, y: 1 }}
        x={0}
        y={-bodySize / 2 - 30}
      />

      {/* HP Text - below health bar */}
      <pixiText
        text={`${monster.hp}/${monster.maxHp}`}
        style={hpStyle}
        anchor={{ x: 0.5, y: 0 }}
        x={0}
        y={-bodySize / 2 - 10}
      />
    </pixiContainer>
  );
}
