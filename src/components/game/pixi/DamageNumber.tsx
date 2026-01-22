import { useCallback, useState, useRef } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";
import { TextStyle } from "pixi.js";

export interface DamageNumberData {
  id: string;
  value: number;
  type: "damage" | "heal" | "shield";
  x: number;
  y: number;
  targetId: string;
}

interface DamageNumberProps {
  id: string;
  value: number;
  type: "damage" | "heal" | "shield";
  x: number;
  y: number;
  onComplete: (id: string) => void;
}

export function DamageNumber({ id, value, type, x, y, onComplete }: DamageNumberProps) {
  // Use refs for animation values to avoid re-renders every frame
  const animValuesRef = useRef({ offsetY: 0, alpha: 1, scale: 0.5 });
  const [, forceUpdate] = useState(0);
  const animationRef = useRef({ elapsed: 0, lastUpdateTime: 0 });

  const duration = 1.5; // seconds
  const riseHeight = 60;

  useTick(useCallback((ticker: Ticker) => {
    animationRef.current.elapsed += ticker.deltaTime / 60; // Convert to seconds
    const progress = Math.min(animationRef.current.elapsed / duration, 1);

    // Ease out for rising
    const easeOut = 1 - Math.pow(1 - progress, 3);
    let newOffsetY = -riseHeight * easeOut;

    // Pop in effect for scale
    let newScale = 1;
    if (progress < 0.2) {
      const popProgress = progress / 0.2;
      newScale = 0.5 + 0.8 * Math.sin(popProgress * Math.PI * 0.5);
    }

    // Fade out in last 30%
    let newAlpha = 1;
    if (progress > 0.7) {
      const fadeProgress = (progress - 0.7) / 0.3;
      newAlpha = 1 - fadeProgress;
    }

    // Update ref values
    animValuesRef.current = { offsetY: newOffsetY, alpha: newAlpha, scale: newScale };

    // Throttle re-renders to ~60fps max
    const now = Date.now();
    if (now - animationRef.current.lastUpdateTime > 16) {
      animationRef.current.lastUpdateTime = now;
      forceUpdate(n => n + 1);
    }

    // Complete when done
    if (progress >= 1) {
      onComplete(id);
    }
  }, [id, onComplete]));

  const { offsetY, alpha, scale } = animValuesRef.current;

  // Color based on type
  const color = type === "damage" ? "#ef4444" : type === "shield" ? "#3b82f6" : "#22c55e";
  const bgColor = type === "damage" ? 0x7f1d1d : type === "shield" ? 0x1e3a5f : 0x14532d;
  const strokeColor = type === "damage" ? 0xef4444 : type === "shield" ? 0x3b82f6 : 0x22c55e;
  const sign = type === "damage" ? "-" : "+";
  const isCritical = type === "damage" && value >= 15;
  const displayText = `${sign}${value}`;

  const textStyle = new TextStyle({
    fontFamily: "Arial, sans-serif",
    fontSize: isCritical ? 20 : 16,
    fontWeight: "bold",
    fill: color,
    stroke: { color: "#000000", width: 3 },
    align: "center",
  });

  return (
    <pixiContainer x={x} y={y + offsetY} alpha={alpha} scale={scale}>
      {/* Background pill */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          const bgWidth = displayText.length * 10 + 20;
          g.roundRect(-bgWidth / 2, -14, bgWidth, 28, 14);
          g.fill({ color: bgColor, alpha: 0.9 });
          g.stroke({ color: strokeColor, width: 2 });
        }}
      />

      {/* Actual text number */}
      <pixiText
        text={displayText}
        style={textStyle}
        anchor={0.5}
      />

      {/* Critical hit indicator */}
      {isCritical && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            const xPos = displayText.length * 5 + 14;
            g.circle(xPos, -6, 5);
            g.fill({ color: 0xfbbf24 });
            // Exclamation mark
            g.rect(xPos - 1, -9, 2, 4);
            g.fill({ color: 0x000000 });
            g.circle(xPos, -3, 1);
            g.fill({ color: 0x000000 });
          }}
        />
      )}
    </pixiContainer>
  );
}
