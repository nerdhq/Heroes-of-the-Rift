import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import { TextStyle } from "pixi.js";
import type { Ticker } from "pixi.js";

const diceNumberStyle = new TextStyle({
  fontFamily: "Arial Black, Arial, sans-serif",
  fontSize: 32,
  fontWeight: "bold",
  fill: 0xffffff,
  stroke: { color: 0x000000, width: 4 },
});

interface DiceParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: number;
  rotation: number;
}

interface DiceRoll3DProps {
  x: number;
  y: number;
  isRolling: boolean;
  finalValue: number | null;
  onComplete?: () => void;
}

export function DiceRoll3D({ x, y, isRolling, finalValue, onComplete }: DiceRoll3DProps) {
  const [displayValue, setDisplayValue] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [particles, setParticles] = useState<DiceParticle[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const animRef = useRef({
    elapsed: 0,
    phase: "idle" as "idle" | "rolling" | "landing" | "result",
    lastParticleSpawn: 0,
  });
  const particleIdRef = useRef(0);

  // Reset when rolling starts
  useEffect(() => {
    if (isRolling) {
      animRef.current = { elapsed: 0, phase: "rolling", lastParticleSpawn: 0 };
      setShowResult(false);
      setGlowIntensity(0);
    }
  }, [isRolling]);

  // Show result when final value arrives
  useEffect(() => {
    if (!isRolling && finalValue !== null) {
      animRef.current.phase = "landing";
      animRef.current.elapsed = 0;
    }
  }, [isRolling, finalValue]);

  useTick(useCallback((ticker: Ticker) => {
    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    // Update particles
    setParticles(prev => {
      const updated = prev
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt * 60,
          y: p.y + p.vy * dt * 60,
          vy: p.vy + 0.15,
          life: p.life - dt * 2,
          rotation: p.rotation + 0.1,
        }))
        .filter(p => p.life > 0);
      return updated;
    });

    if (animRef.current.phase === "rolling") {
      // Spinning dice
      const spinSpeed = 15 + Math.sin(elapsed * 3) * 5;
      setRotation(prev => prev + spinSpeed);

      // Bounce scale
      setScale(1 + Math.sin(elapsed * 8) * 0.1);

      // Random face values
      if (Math.random() < 0.3) {
        setDisplayValue(Math.floor(Math.random() * 20) + 1);
      }

      // Spawn trail particles
      if (elapsed - animRef.current.lastParticleSpawn > 0.05) {
        animRef.current.lastParticleSpawn = elapsed;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        setParticles(prev => [...prev, {
          id: particleIdRef.current++,
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 1,
          size: 3 + Math.random() * 4,
          color: [0xfbbf24, 0xf97316, 0xffffff][Math.floor(Math.random() * 3)],
          rotation: Math.random() * Math.PI * 2,
        }]);
      }
    } else if (animRef.current.phase === "landing") {
      // Slow down rotation
      const slowdown = Math.max(0, 1 - elapsed * 2);
      setRotation(prev => prev + 10 * slowdown);
      setScale(1 + Math.sin(elapsed * 12) * 0.05 * slowdown);

      if (elapsed > 0.5) {
        animRef.current.phase = "result";
        animRef.current.elapsed = 0;
        setDisplayValue(finalValue!);
        setShowResult(true);

        // Burst particles on landing
        const burstParticles: DiceParticle[] = [];
        const isNat20 = finalValue === 20;
        const isNat1 = finalValue === 1;
        const particleCount = isNat20 ? 30 : isNat1 ? 20 : 15;

        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          const speed = 4 + Math.random() * 6;
          burstParticles.push({
            id: particleIdRef.current++,
            x: 0,
            y: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            life: 1,
            size: 4 + Math.random() * 6,
            color: isNat20 ? [0x22c55e, 0x86efac, 0xffffff][Math.floor(Math.random() * 3)]
                 : isNat1 ? [0xef4444, 0xfbbf24, 0xffffff][Math.floor(Math.random() * 3)]
                 : [0xfbbf24, 0xf97316, 0xffffff][Math.floor(Math.random() * 3)],
            rotation: Math.random() * Math.PI * 2,
          });
        }
        setParticles(prev => [...prev, ...burstParticles]);
      }
    } else if (animRef.current.phase === "result") {
      // Pulse glow effect
      const isNat20 = finalValue === 20;
      const isNat1 = finalValue === 1;

      if (isNat20 || isNat1) {
        setGlowIntensity(0.5 + Math.sin(elapsed * 6) * 0.3);
      } else {
        setGlowIntensity(Math.max(0, 0.5 - elapsed * 0.5));
      }

      // Gentle bounce on result
      setScale(1 + Math.sin(elapsed * 4) * 0.02);

      if (elapsed > 2) {
        onComplete?.();
      }
    }
  }, [finalValue, onComplete]));

  if (animRef.current.phase === "idle" && !isRolling) return null;

  const isNat20 = showResult && finalValue === 20;
  const isNat1 = showResult && finalValue === 1;
  const diceColor = isNat20 ? 0x22c55e : isNat1 ? 0xef4444 : 0xfbbf24;
  const glowColor = isNat20 ? 0x22c55e : isNat1 ? 0xef4444 : 0xfbbf24;

  return (
    <pixiContainer x={x} y={y}>
      {/* Glow effect */}
      {glowIntensity > 0 && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            for (let i = 3; i >= 0; i--) {
              const radius = 50 + i * 15;
              const alpha = glowIntensity * (0.3 - i * 0.07);
              g.circle(0, 0, radius);
              g.fill({ color: glowColor, alpha });
            }
          }}
        />
      )}

      {/* Particles */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          particles.forEach(p => {
            const alpha = p.life;
            g.circle(p.x, p.y, p.size * p.life);
            g.fill({ color: p.color, alpha });
          });
        }}
      />

      {/* Dice body */}
      <pixiContainer rotation={(rotation * Math.PI) / 180} scale={scale}>
        <pixiGraphics
          draw={(g) => {
            g.clear();

            // D20 shape (icosahedron face - triangle)
            const size = 45;

            // Shadow
            g.circle(3, 5, size * 0.8);
            g.fill({ color: 0x000000, alpha: 0.3 });

            // Main hexagonal shape
            const points: number[] = [];
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
              points.push(Math.cos(angle) * size, Math.sin(angle) * size);
            }
            g.poly(points);
            g.fill({ color: diceColor });
            g.stroke({ color: 0x000000, width: 3, alpha: 0.5 });

            // Inner highlight
            const innerPoints: number[] = [];
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
              innerPoints.push(Math.cos(angle) * size * 0.85, Math.sin(angle) * size * 0.85);
            }
            g.poly(innerPoints);
            g.stroke({ color: 0xffffff, width: 2, alpha: 0.3 });

            // Face lines for 3D effect
            g.moveTo(0, -size * 0.7);
            g.lineTo(0, size * 0.7);
            g.stroke({ color: 0x000000, width: 1, alpha: 0.2 });
            g.moveTo(-size * 0.6, 0);
            g.lineTo(size * 0.6, 0);
            g.stroke({ color: 0x000000, width: 1, alpha: 0.2 });
          }}
        />

        {/* Number display */}
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Number background circle
            g.circle(0, 0, 24);
            g.fill({ color: 0x000000, alpha: 0.7 });
          }}
        />
        <pixiText
          text={String(displayValue)}
          style={diceNumberStyle}
          anchor={{ x: 0.5, y: 0.5 }}
          x={0}
          y={0}
        />
      </pixiContainer>

      {/* Result text indicators */}
      {showResult && (isNat20 || isNat1) && (
        <pixiGraphics
          draw={(g) => {
            g.clear();

            const textY = -70;
            const bgWidth = isNat20 ? 100 : 80;

            // Background pill
            g.roundRect(-bgWidth / 2, textY - 12, bgWidth, 24, 12);
            g.fill({ color: isNat20 ? 0x14532d : 0x7f1d1d, alpha: 0.9 });
            g.stroke({ color: isNat20 ? 0x22c55e : 0xef4444, width: 2 });

            // Stars/skulls decoration
            if (isNat20) {
              g.star(-30, textY, 5, 6, 3, 0);
              g.fill({ color: 0xfbbf24 });
              g.star(30, textY, 5, 6, 3, 0);
              g.fill({ color: 0xfbbf24 });
            } else {
              g.circle(-25, textY, 6);
              g.fill({ color: 0xef4444 });
              g.circle(25, textY, 6);
              g.fill({ color: 0xef4444 });
            }
          }}
        />
      )}
    </pixiContainer>
  );
}
