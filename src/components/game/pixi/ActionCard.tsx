import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { Ticker } from "pixi.js";
import type { ActionMessage } from "../../../types";

// Text styles for different message types
const createTextStyle = (type: ActionMessage["type"]) => {
  const colors: Record<ActionMessage["type"], number> = {
    action: 0xffffff,
    damage: 0xfca5a5,
    heal: 0x86efac,
    buff: 0x93c5fd,
    debuff: 0xfbbf24,
    roll: 0xe9d5ff,
  };

  return new TextStyle({
    fontFamily: "Arial, sans-serif",
    fontSize: 14,
    fontWeight: "bold",
    fill: colors[type],
    stroke: { color: 0x000000, width: 3 },
    wordWrap: true,
    wordWrapWidth: 180,
    align: "center",
  });
};

// Background colors for different message types
const getBgColor = (type: ActionMessage["type"]) => {
  const colors: Record<ActionMessage["type"], number> = {
    action: 0x374151,
    damage: 0x7f1d1d,
    heal: 0x14532d,
    buff: 0x1e3a5f,
    debuff: 0x78350f,
    roll: 0x4c1d95,
  };
  return colors[type];
};

const getBorderColor = (type: ActionMessage["type"]) => {
  const colors: Record<ActionMessage["type"], number> = {
    action: 0x6b7280,
    damage: 0xef4444,
    heal: 0x22c55e,
    buff: 0x3b82f6,
    debuff: 0xfbbf24,
    roll: 0xa855f7,
  };
  return colors[type];
};

interface ActionCardProps {
  message: ActionMessage;
  x: number;
  y: number;
  onComplete?: (id: string) => void;
}

export function ActionCard({ message, x, y, onComplete }: ActionCardProps) {
  const [alpha, setAlpha] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [offsetY, setOffsetY] = useState(0);

  const animRef = useRef({
    elapsed: 0,
    phase: "enter" as "enter" | "display" | "exit",
  });
  const hasCompletedRef = useRef(false);

  // Reset animation state when message changes
  useEffect(() => {
    animRef.current = { elapsed: 0, phase: "enter" };
    hasCompletedRef.current = false;
    setAlpha(0);
    setScale(0.5);
    setOffsetY(0);
  }, [message.id]);

  useTick(useCallback((ticker: Ticker) => {
    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    if (animRef.current.phase === "enter") {
      // Pop in animation
      const progress = Math.min(1, elapsed * 4);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      setAlpha(eased);
      setScale(0.5 + eased * 0.5);
      setOffsetY(-20 + eased * 20);

      if (progress >= 1) {
        animRef.current.phase = "display";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "display") {
      // Display with subtle floating
      setOffsetY(Math.sin(elapsed * 2) * 3);
      setScale(1 + Math.sin(elapsed * 3) * 0.02);

      // Display duration based on message length (min 2s, max 4s)
      const displayDuration = Math.min(4, Math.max(2, message.text.length * 0.05));
      if (elapsed > displayDuration) {
        animRef.current.phase = "exit";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "exit") {
      // Fade out and float up
      const progress = Math.min(1, elapsed * 2);
      setAlpha(1 - progress);
      setOffsetY(progress * -30);
      setScale(1 - progress * 0.2);

      if (progress >= 1 && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.(message.id);
      }
    }
  }, [message.id, message.text.length, onComplete]));

  // Calculate card dimensions based on text
  const padding = 12;
  const maxWidth = 200;
  const estimatedTextWidth = Math.min(maxWidth, message.text.length * 7);
  const cardWidth = Math.max(100, estimatedTextWidth + padding * 2);
  const estimatedLines = Math.ceil(message.text.length / 25);
  const cardHeight = 20 + estimatedLines * 16 + padding;

  const bgColor = getBgColor(message.type);
  const borderColor = getBorderColor(message.type);
  const textStyle = createTextStyle(message.type);

  return (
    <pixiContainer x={x} y={y + offsetY} alpha={alpha} scale={scale}>
      {/* Card background with rounded corners */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          // Shadow
          g.roundRect(-cardWidth / 2 + 3, 3, cardWidth, cardHeight, 8);
          g.fill({ color: 0x000000, alpha: 0.4 });

          // Main background
          g.roundRect(-cardWidth / 2, 0, cardWidth, cardHeight, 8);
          g.fill({ color: bgColor, alpha: 0.95 });
          g.stroke({ color: borderColor, width: 2 });

          // Inner highlight
          g.roundRect(-cardWidth / 2 + 4, 4, cardWidth - 8, 12, 4);
          g.fill({ color: 0xffffff, alpha: 0.1 });

          // Type indicator icon
          const iconX = -cardWidth / 2 + 14;
          const iconY = cardHeight / 2;

          if (message.type === "damage") {
            // Sword icon
            g.moveTo(iconX - 5, iconY - 5);
            g.lineTo(iconX + 5, iconY + 5);
            g.stroke({ color: borderColor, width: 2 });
            g.moveTo(iconX - 2, iconY + 2);
            g.lineTo(iconX + 2, iconY - 2);
            g.stroke({ color: borderColor, width: 2 });
          } else if (message.type === "heal") {
            // Plus icon
            g.moveTo(iconX, iconY - 5);
            g.lineTo(iconX, iconY + 5);
            g.stroke({ color: borderColor, width: 2 });
            g.moveTo(iconX - 5, iconY);
            g.lineTo(iconX + 5, iconY);
            g.stroke({ color: borderColor, width: 2 });
          } else if (message.type === "buff") {
            // Up arrow
            g.moveTo(iconX, iconY - 5);
            g.lineTo(iconX + 4, iconY + 2);
            g.lineTo(iconX - 4, iconY + 2);
            g.closePath();
            g.fill({ color: borderColor });
          } else if (message.type === "debuff") {
            // Down arrow
            g.moveTo(iconX, iconY + 5);
            g.lineTo(iconX + 4, iconY - 2);
            g.lineTo(iconX - 4, iconY - 2);
            g.closePath();
            g.fill({ color: borderColor });
          } else if (message.type === "roll") {
            // Dice dots
            g.circle(iconX, iconY, 2);
            g.fill({ color: borderColor });
            g.circle(iconX - 4, iconY - 4, 1.5);
            g.fill({ color: borderColor });
            g.circle(iconX + 4, iconY + 4, 1.5);
            g.fill({ color: borderColor });
          } else {
            // Action - star
            g.star(iconX, iconY, 5, 6, 3, 0);
            g.fill({ color: borderColor });
          }
        }}
      />

      {/* Message text */}
      <pixiText
        text={message.text}
        style={textStyle}
        anchor={{ x: 0.5, y: 0.5 }}
        x={8}
        y={cardHeight / 2}
      />
    </pixiContainer>
  );
}
