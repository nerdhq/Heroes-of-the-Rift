import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: number;
  life: number;
  wobble: number;
  wobbleSpeed: number;
}

interface VictoryDefeatOverlayProps {
  width: number;
  height: number;
  type: "victory" | "defeat";
  isActive: boolean;
  onComplete?: () => void;
}

const VICTORY_COLORS = [0xfbbf24, 0x22c55e, 0x3b82f6, 0xec4899, 0xa855f7, 0xffffff];
const DEFEAT_COLORS = [0x4b5563, 0x6b7280, 0x374151, 0x1f2937, 0x111827];

export function VictoryDefeatOverlay({
  width,
  height,
  type,
  isActive,
  onComplete,
}: VictoryDefeatOverlayProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [textScale, setTextScale] = useState(0);
  const [textAlpha, setTextAlpha] = useState(0);
  const [flashAlpha, setFlashAlpha] = useState(0);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });

  const animRef = useRef({
    elapsed: 0,
    phase: "idle" as "idle" | "flash" | "text" | "confetti" | "sustain",
    lastSpawn: 0,
  });
  const particleIdRef = useRef(0);
  const hasStartedRef = useRef(false);

  const colors = type === "victory" ? VICTORY_COLORS : DEFEAT_COLORS;

  // Initialize on activation
  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      animRef.current = { elapsed: 0, phase: "flash", lastSpawn: 0 };
      setParticles([]);
      setTextScale(0);
      setTextAlpha(0);
      setFlashAlpha(1);
      setShakeOffset({ x: 0, y: 0 });
    } else if (!isActive) {
      hasStartedRef.current = false;
      animRef.current.phase = "idle";
      // Reset visual states to prevent flashing
      setParticles([]);
      setTextScale(0);
      setTextAlpha(0);
      setFlashAlpha(0);
      setShakeOffset({ x: 0, y: 0 });
    }
  }, [isActive]);

  // Spawn confetti
  const spawnConfetti = useCallback((count: number) => {
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      const startX = Math.random() * width;
      const isFromTop = type === "victory";

      newParticles.push({
        id: particleIdRef.current++,
        x: startX,
        y: isFromTop ? -20 : height + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: isFromTop ? 2 + Math.random() * 3 : -(3 + Math.random() * 4),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        size: 6 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [width, height, colors, type]);

  useTick(useCallback((ticker: Ticker) => {
    if (!isActive || animRef.current.phase === "idle") return;

    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    // Update particles
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        x: p.x + p.vx + Math.sin(p.wobble) * 2,
        y: p.y + p.vy,
        vy: p.vy + (type === "victory" ? 0.1 : -0.05),
        rotation: p.rotation + p.rotationSpeed,
        wobble: p.wobble + p.wobbleSpeed,
        life: p.y > height + 50 || p.y < -50 ? 0 : p.life,
      })).filter(p => p.life > 0)
    );

    if (animRef.current.phase === "flash") {
      // Screen flash
      setFlashAlpha(Math.max(0, 1 - elapsed * 3));

      // Shake for defeat
      if (type === "defeat") {
        const intensity = Math.max(0, 10 - elapsed * 30);
        setShakeOffset({
          x: (Math.random() - 0.5) * intensity,
          y: (Math.random() - 0.5) * intensity,
        });
      }

      if (elapsed > 0.4) {
        animRef.current.phase = "text";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "text") {
      // Text animation
      const textProgress = Math.min(1, elapsed * 3);
      setTextScale(0.5 + textProgress * 0.5 + Math.sin(elapsed * 10) * 0.05 * (1 - textProgress));
      setTextAlpha(textProgress);
      setShakeOffset({ x: 0, y: 0 });

      if (elapsed > 0.5) {
        animRef.current.phase = "confetti";
        animRef.current.elapsed = 0;

        // Initial burst
        if (type === "victory") {
          spawnConfetti(50);
        }
      }
    } else if (animRef.current.phase === "confetti") {
      // Continuous confetti/ash
      if (elapsed - animRef.current.lastSpawn > (type === "victory" ? 0.05 : 0.1)) {
        animRef.current.lastSpawn = elapsed;
        spawnConfetti(type === "victory" ? 5 : 2);
      }

      // Text pulse
      setTextScale(1 + Math.sin(elapsed * 4) * 0.02);

      if (elapsed > 3) {
        animRef.current.phase = "sustain";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "sustain") {
      // Keep some particles going
      if (elapsed - animRef.current.lastSpawn > 0.2) {
        animRef.current.lastSpawn = elapsed;
        spawnConfetti(1);
      }

      setTextScale(1 + Math.sin(elapsed * 2) * 0.01);

      if (elapsed > 5) {
        onComplete?.();
      }
    }
  }, [isActive, type, spawnConfetti, onComplete, height]));

  if (!isActive && animRef.current.phase === "idle") return null;

  const textColor = type === "victory" ? 0xfbbf24 : 0xef4444;
  const shadowColor = type === "victory" ? 0x854d0e : 0x7f1d1d;

  return (
    <pixiContainer x={shakeOffset.x} y={shakeOffset.y}>
      {/* Screen flash */}
      {flashAlpha > 0 && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            g.rect(0, 0, width, height);
            g.fill({ color: type === "victory" ? 0xffffff : 0x000000, alpha: flashAlpha });
          }}
        />
      )}

      {/* Confetti particles */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          particles.forEach(p => {
            if (type === "victory") {
              // Rectangular confetti - manually rotate corners
              const cos = Math.cos(p.rotation);
              const sin = Math.sin(p.rotation);
              const hw = p.size / 2;  // half width
              const hh = p.size / 4;  // half height

              // Rectangle corners before rotation (centered at origin)
              const corners = [
                { x: -hw, y: -hh },
                { x: hw, y: -hh },
                { x: hw, y: hh },
                { x: -hw, y: hh },
              ];

              // Rotate and translate to particle position
              const rotated = corners.map(c => ({
                x: p.x + c.x * cos - c.y * sin,
                y: p.y + c.x * sin + c.y * cos,
              }));

              g.poly(rotated.flatMap(c => [c.x, c.y]));
              g.fill({ color: p.color });
            } else {
              // Ash particles (circles don't need rotation)
              g.circle(p.x, p.y, p.size / 2);
              g.fill({ color: p.color, alpha: 0.7 });
            }
          });
        }}
      />

      {/* Main text */}
      {textAlpha > 0 && (
        <pixiContainer
          x={width / 2}
          y={height / 2 - 50}
          scale={textScale}
          alpha={textAlpha}
        >
          <pixiGraphics
            draw={(g) => {
              g.clear();

              const text = type === "victory" ? "VICTORY" : "DEFEAT";
              const charWidth = 50;
              const totalWidth = text.length * charWidth;
              const startX = -totalWidth / 2;

              // Shadow
              text.split('').forEach((_, i) => {
                const cx = startX + i * charWidth + charWidth / 2 + 4;
                const cy = 4;
                g.roundRect(cx - 20, cy - 30, 40, 60, 8);
                g.fill({ color: shadowColor, alpha: 0.6 });
              });

              // Main letters
              text.split('').forEach((_, i) => {
                const cx = startX + i * charWidth + charWidth / 2;

                // Letter background
                g.roundRect(cx - 20, -30, 40, 60, 8);
                g.fill({ color: textColor });
                g.stroke({ color: 0xffffff, width: 3, alpha: 0.5 });

                // Inner highlight
                g.roundRect(cx - 15, -25, 30, 20, 4);
                g.fill({ color: 0xffffff, alpha: 0.3 });
              });

              // Decorative elements
              if (type === "victory") {
                // Stars
                g.star(-totalWidth / 2 - 40, 0, 5, 20, 10, 0);
                g.fill({ color: 0xffffff });
                g.star(totalWidth / 2 + 40, 0, 5, 20, 10, 0);
                g.fill({ color: 0xffffff });
              } else {
                // Skull-like shapes
                g.circle(-totalWidth / 2 - 35, 0, 15);
                g.fill({ color: 0x4b5563 });
                g.circle(totalWidth / 2 + 35, 0, 15);
                g.fill({ color: 0x4b5563 });
              }
            }}
          />
        </pixiContainer>
      )}

      {/* Subtitle */}
      {textAlpha > 0 && animRef.current.phase !== "text" && (
        <pixiContainer
          x={width / 2}
          y={height / 2 + 40}
          alpha={textAlpha * 0.8}
        >
          <pixiGraphics
            draw={(g) => {
              g.clear();

              const subtitle = type === "victory"
                ? "The dungeon has been conquered!"
                : "Your heroes have fallen...";

              // Background pill
              const pillWidth = 280;
              g.roundRect(-pillWidth / 2, -15, pillWidth, 30, 15);
              g.fill({ color: 0x000000, alpha: 0.6 });
              g.stroke({ color: textColor, width: 1, alpha: 0.5 });

              // Simple dots to represent text
              const dotCount = subtitle.length;
              const dotSpacing = (pillWidth - 40) / dotCount;
              for (let i = 0; i < dotCount; i++) {
                if (subtitle[i] !== ' ') {
                  g.circle(-pillWidth / 2 + 20 + i * dotSpacing, 0, 2);
                  g.fill({ color: 0xffffff, alpha: 0.8 });
                }
              }
            }}
          />
        </pixiContainer>
      )}

      {/* Glow effect behind text */}
      {textAlpha > 0 && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            for (let i = 3; i >= 0; i--) {
              const radius = 150 + i * 50;
              const alpha = textAlpha * (0.15 - i * 0.03);
              g.circle(width / 2, height / 2 - 30, radius);
              g.fill({ color: textColor, alpha });
            }
          }}
        />
      )}
    </pixiContainer>
  );
}
