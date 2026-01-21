import { useCallback, useState, useRef } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";

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
  const color = type === "damage" ? 0xef4444 : type === "shield" ? 0x3b82f6 : 0x22c55e;
  const sign = type === "damage" ? "-" : "+";
  const isCritical = type === "damage" && value >= 15;

  return (
    <pixiContainer x={x} y={y + offsetY} alpha={alpha} scale={scale}>
      {/* Glow/shadow for better visibility */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          const textWidth = String(value).length * 12 + 20;
          const textHeight = 24;
          g.roundRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 4);
          g.fill({ color: 0x000000, alpha: 0.5 });
        }}
      />

      {/* Main number display using graphics (since Text needs font loading) */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Draw number as stylized graphic
          const displayText = `${sign}${value}`;
          const charWidth = isCritical ? 14 : 10;
          const startX = -((displayText.length - 1) * charWidth) / 2;

          displayText.split("").forEach((char, i) => {
            const charX = startX + i * charWidth;

            // Simple digit/sign shapes
            if (char === "-") {
              g.rect(charX - 4, -2, 8, 4);
              g.fill({ color: color });
            } else if (char === "+") {
              g.rect(charX - 4, -1, 8, 2);
              g.rect(charX - 1, -4, 2, 8);
              g.fill({ color: color });
            } else {
              // Number - draw as filled circle with different sizes
              g.circle(charX, 0, isCritical ? 8 : 6);
              g.fill({ color: color });
              g.stroke({ color: 0xffffff, width: 1 });
            }
          });

          // Critical hit indicator
          if (isCritical) {
            // Exclamation mark
            g.circle(displayText.length * charWidth / 2 + 10, -3, 4);
            g.fill({ color: 0xfbbf24 });
          }
        }}
      />

      {/* Number text overlay using simple shapes */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Background pill for the number
          const displayText = `${sign}${value}`;
          const bgWidth = displayText.length * 10 + 16;

          g.roundRect(-bgWidth / 2, -12, bgWidth, 24, 12);
          g.fill({ color: type === "damage" ? 0x7f1d1d : 0x14532d, alpha: 0.9 });
          g.stroke({ color: color, width: 2 });

          // Draw digits as blocks to represent numbers
          const digitWidth = 8;
          const startX = -(displayText.length * digitWidth) / 2 + digitWidth / 2;

          displayText.split("").forEach((char, i) => {
            const dx = startX + i * digitWidth;

            if (char === "-") {
              g.rect(dx - 3, -1, 6, 2);
              g.fill({ color: 0xffffff });
            } else if (char === "+") {
              g.rect(dx - 3, -0.5, 6, 1);
              g.rect(dx - 0.5, -3, 1, 6);
              g.fill({ color: 0xffffff });
            } else {
              // Simple circle for each digit
              g.circle(dx, 0, 4);
              g.fill({ color: 0xffffff });
            }
          });
        }}
      />
    </pixiContainer>
  );
}
