import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";

interface TransitionParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: number;
  delay: number;
  speed: number;
}

interface RoundTransitionProps {
  width: number;
  height: number;
  roundNumber: number;
  roundName: string;
  isActive: boolean;
  onComplete?: () => void;
}

const ROUND_COLORS = [
  [0x22c55e, 0x86efac], // Round 1 - Green
  [0x3b82f6, 0x60a5fa], // Round 2 - Blue
  [0xa855f7, 0xc4b5fd], // Round 3 - Purple
  [0xf97316, 0xfbbf24], // Round 4 - Orange
  [0xef4444, 0xfca5a5], // Round 5 - Red
  [0xfbbf24, 0xfef3c7], // Round 6 - Gold (Final)
];

export function RoundTransition({
  width,
  height,
  roundNumber,
  roundName,
  isActive,
  onComplete,
}: RoundTransitionProps) {
  const [wipeProgress, setWipeProgress] = useState(0);
  const [textAlpha, setTextAlpha] = useState(0);
  const [textScale, setTextScale] = useState(0.5);
  const [particles, setParticles] = useState<TransitionParticle[]>([]);

  const animRef = useRef({
    elapsed: 0,
    phase: "idle" as "idle" | "wipeIn" | "hold" | "wipeOut",
  });
  const particleIdRef = useRef(0);
  const hasStartedRef = useRef(false);

  const colors = ROUND_COLORS[Math.min(roundNumber - 1, ROUND_COLORS.length - 1)];
  const isFinalRound = roundNumber >= 6;

  // Initialize on activation
  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      animRef.current = { elapsed: 0, phase: "wipeIn" };
      setWipeProgress(0);
      setTextAlpha(0);
      setTextScale(0.5);

      // Create wipe particles
      const newParticles: TransitionParticle[] = [];
      const particleCount = 30;

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: -50,
          y: (i / particleCount) * height,
          size: 20 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.1,
          speed: 0.8 + Math.random() * 0.4,
        });
      }
      setParticles(newParticles);
    } else if (!isActive) {
      hasStartedRef.current = false;
      animRef.current.phase = "idle";
      // Reset visual states to prevent flashing
      setWipeProgress(0);
      setTextAlpha(0);
      setTextScale(0.5);
      setParticles([]);
    }
  }, [isActive, height, colors]);

  useTick(useCallback((ticker: Ticker) => {
    if (!isActive || animRef.current.phase === "idle") return;

    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    if (animRef.current.phase === "wipeIn") {
      // Wipe in from left
      const newProgress = Math.min(1, elapsed * 1.5);
      setWipeProgress(newProgress);

      // Update particle positions
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: Math.max(-50, -50 + (width + 100) * Math.max(0, (newProgress - p.delay) * p.speed * 1.5)),
        }))
      );

      // Fade in text
      if (newProgress > 0.3) {
        const textProgress = (newProgress - 0.3) / 0.4;
        setTextAlpha(Math.min(1, textProgress));
        setTextScale(0.5 + Math.min(0.5, textProgress * 0.6));
      }

      if (elapsed > 0.8) {
        animRef.current.phase = "hold";
        animRef.current.elapsed = 0;
        setTextScale(1);
      }
    } else if (animRef.current.phase === "hold") {
      // Hold with pulse effect
      setTextScale(1 + Math.sin(elapsed * 6) * 0.03);

      if (elapsed > 1.2) {
        animRef.current.phase = "wipeOut";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "wipeOut") {
      // Wipe out to right
      const outProgress = Math.min(1, elapsed * 2);

      // Move particles out
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + (width + 100) * dt * 3 * p.speed,
        }))
      );

      // Fade out text
      setTextAlpha(Math.max(0, 1 - outProgress * 1.5));
      setTextScale(1 + outProgress * 0.2);

      // Fade wipe
      setWipeProgress(Math.max(0, 1 - outProgress));

      if (elapsed > 0.6) {
        animRef.current.phase = "idle";
        onComplete?.();
      }
    }
  }, [isActive, width, onComplete]));

  if (!isActive && animRef.current.phase === "idle") return null;

  return (
    <pixiContainer>
      {/* Dark overlay */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.rect(0, 0, width, height);
          g.fill({ color: 0x000000, alpha: wipeProgress * 0.7 });
        }}
      />

      {/* Wipe effect particles */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          particles.forEach(p => {
            if (p.x > -p.size && p.x < width + p.size) {
              // Elongated diamond shape for wipe
              const stretch = 3;
              g.poly([
                p.x - p.size * stretch, p.y,
                p.x, p.y - p.size / 2,
                p.x + p.size, p.y,
                p.x, p.y + p.size / 2,
              ]);
              g.fill({ color: p.color, alpha: 0.8 });
            }
          });
        }}
      />

      {/* Horizontal lines */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          const lineY = height / 2;

          // Top line
          if (wipeProgress > 0.2) {
            const lineWidth = width * Math.min(1, (wipeProgress - 0.2) * 2);
            g.moveTo(width / 2 - lineWidth / 2, lineY - 60);
            g.lineTo(width / 2 + lineWidth / 2, lineY - 60);
            g.stroke({ color: colors[0], width: 3, alpha: textAlpha * 0.8 });
          }

          // Bottom line
          if (wipeProgress > 0.3) {
            const lineWidth = width * Math.min(1, (wipeProgress - 0.3) * 2);
            g.moveTo(width / 2 - lineWidth / 2, lineY + 60);
            g.lineTo(width / 2 + lineWidth / 2, lineY + 60);
            g.stroke({ color: colors[0], width: 3, alpha: textAlpha * 0.8 });
          }
        }}
      />

      {/* Round number and name */}
      {textAlpha > 0 && (
        <pixiContainer
          x={width / 2}
          y={height / 2}
          scale={textScale}
          alpha={textAlpha}
        >
          <pixiGraphics
            draw={(g) => {
              g.clear();

              // "ROUND X" text representation
              const roundText = `ROUND ${roundNumber}`;

              // Background
              g.roundRect(-120, -35, 240, 40, 8);
              g.fill({ color: 0x000000, alpha: 0.6 });
              g.stroke({ color: colors[0], width: 2 });

              // Letter blocks
              const charWidth = 20;
              const startX = -((roundText.length - 1) * charWidth) / 2;

              roundText.split('').forEach((char, i) => {
                if (char !== ' ') {
                  const cx = startX + i * charWidth;
                  g.roundRect(cx - 8, -28, 16, 26, 3);
                  g.fill({ color: colors[0], alpha: 0.9 });

                  // Inner detail
                  g.roundRect(cx - 5, -25, 10, 10, 2);
                  g.fill({ color: 0xffffff, alpha: 0.4 });
                }
              });

              // Round name below
              const nameWidth = Math.min(roundName.length * 12, 250);
              g.roundRect(-nameWidth / 2 - 10, 15, nameWidth + 20, 30, 6);
              g.fill({ color: colors[1], alpha: 0.3 });
              g.stroke({ color: colors[1], width: 1, alpha: 0.6 });

              // Name text dots
              const dotSpacing = nameWidth / roundName.length;
              roundName.split('').forEach((char, i) => {
                if (char !== ' ') {
                  g.circle(-nameWidth / 2 + 5 + i * dotSpacing, 30, 2);
                  g.fill({ color: 0xffffff, alpha: 0.7 });
                }
              });

              // Final round special effects
              if (isFinalRound) {
                // Crown
                g.poly([-25, -55, -15, -45, 0, -55, 15, -45, 25, -55, 20, -40, -20, -40]);
                g.fill({ color: 0xfbbf24 });
                g.stroke({ color: 0xfef3c7, width: 2 });

                // Gems
                g.circle(-15, -48, 3);
                g.fill({ color: 0xef4444 });
                g.circle(0, -52, 3);
                g.fill({ color: 0x3b82f6 });
                g.circle(15, -48, 3);
                g.fill({ color: 0x22c55e });
              }
            }}
          />
        </pixiContainer>
      )}

      {/* Corner decorations */}
      {textAlpha > 0.5 && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            const alpha = (textAlpha - 0.5) * 2;

            // Top left
            g.moveTo(50, 30);
            g.lineTo(30, 30);
            g.lineTo(30, 50);
            g.stroke({ color: colors[0], width: 3, alpha });

            // Top right
            g.moveTo(width - 50, 30);
            g.lineTo(width - 30, 30);
            g.lineTo(width - 30, 50);
            g.stroke({ color: colors[0], width: 3, alpha });

            // Bottom left
            g.moveTo(50, height - 30);
            g.lineTo(30, height - 30);
            g.lineTo(30, height - 50);
            g.stroke({ color: colors[0], width: 3, alpha });

            // Bottom right
            g.moveTo(width - 50, height - 30);
            g.lineTo(width - 30, height - 30);
            g.lineTo(width - 30, height - 50);
            g.stroke({ color: colors[0], width: 3, alpha });
          }}
        />
      )}
    </pixiContainer>
  );
}
