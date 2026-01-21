import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";
import type { ClassType, Rarity } from "../../../types";

interface MagicParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  radiusSpeed: number;
  angleSpeed: number;
  life: number;
  size: number;
  color: number;
}

interface CardPlayEffectProps {
  x: number;
  y: number;
  classType: ClassType;
  rarity: Rarity;
  isActive: boolean;
  onComplete?: () => void;
}

const CLASS_COLORS: Record<ClassType, number[]> = {
  warrior: [0xef4444, 0xfbbf24, 0xffffff],
  rogue: [0x8b5cf6, 0xa855f7, 0xffffff],
  paladin: [0xfbbf24, 0xfef3c7, 0xffffff],
  mage: [0x3b82f6, 0x60a5fa, 0xffffff],
  priest: [0xffffff, 0xfef3c7, 0xfbbf24],
  bard: [0xec4899, 0xf472b6, 0xffffff],
  archer: [0x22c55e, 0x86efac, 0xffffff],
  barbarian: [0xf97316, 0xfbbf24, 0xef4444],
};

const RARITY_GLOW: Record<Rarity, number> = {
  common: 0x9ca3af,
  uncommon: 0x22c55e,
  rare: 0x3b82f6,
  legendary: 0xfbbf24,
};

export function CardPlayEffect({
  x,
  y,
  classType,
  rarity,
  isActive,
  onComplete,
}: CardPlayEffectProps) {
  const [particles, setParticles] = useState<MagicParticle[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [ringScale, setRingScale] = useState(0);
  const [runeRotation, setRuneRotation] = useState(0);

  const animRef = useRef({
    elapsed: 0,
    phase: "idle" as "idle" | "burst" | "sustain" | "fade",
  });
  const particleIdRef = useRef(0);
  const hasStartedRef = useRef(false);

  const colors = CLASS_COLORS[classType];
  const glowColor = RARITY_GLOW[rarity];

  // Reset on activation
  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      animRef.current = { elapsed: 0, phase: "burst" };
      setGlowIntensity(0);
      setRingScale(0);
      setRuneRotation(0);

      // Spawn initial particles
      const newParticles: MagicParticle[] = [];
      const count = rarity === "legendary" ? 30 : rarity === "rare" ? 24 : rarity === "uncommon" ? 18 : 12;

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: 0,
          y: 0,
          angle: (i / count) * Math.PI * 2,
          radius: 20 + Math.random() * 30,
          radiusSpeed: 0.5 + Math.random() * 1,
          angleSpeed: (Math.random() - 0.5) * 0.05,
          life: 1,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setParticles(newParticles);
    } else if (!isActive) {
      hasStartedRef.current = false;
      animRef.current.phase = "idle";
      // Reset visual states to prevent flashing
      setParticles([]);
      setGlowIntensity(0);
      setRingScale(0);
      setRuneRotation(0);
    }
  }, [isActive, colors, rarity]);

  useTick(useCallback((ticker: Ticker) => {
    if (!isActive || animRef.current.phase === "idle") return;

    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    // Update particles (orbiting motion)
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        angle: p.angle + p.angleSpeed,
        radius: p.radius + p.radiusSpeed * (animRef.current.phase === "fade" ? 2 : 0.5),
        life: animRef.current.phase === "fade" ? p.life - dt * 2 : Math.min(1, p.life + dt),
        x: Math.cos(p.angle) * p.radius,
        y: Math.sin(p.angle) * p.radius * 0.6, // Elliptical
      })).filter(p => p.life > 0)
    );

    // Rotate runes
    setRuneRotation(prev => prev + dt * 2);

    if (animRef.current.phase === "burst") {
      // Quick glow burst
      setGlowIntensity(Math.min(1, elapsed * 4));
      setRingScale(Math.min(1, elapsed * 3));

      if (elapsed > 0.3) {
        animRef.current.phase = "sustain";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "sustain") {
      // Pulsing glow
      setGlowIntensity(0.7 + Math.sin(elapsed * 6) * 0.3);
      setRingScale(1 + Math.sin(elapsed * 4) * 0.05);

      if (elapsed > 0.8) {
        animRef.current.phase = "fade";
        animRef.current.elapsed = 0;
      }
    } else if (animRef.current.phase === "fade") {
      setGlowIntensity(Math.max(0, 1 - elapsed * 2));
      setRingScale(1 + elapsed * 0.5);

      if (elapsed > 0.6 || particles.length === 0) {
        animRef.current.phase = "idle";
        setParticles([]);
        onComplete?.();
      }
    }
  }, [isActive, particles.length, onComplete]));

  if (!isActive && animRef.current.phase === "idle") return null;

  return (
    <pixiContainer x={x} y={y}>
      {/* Outer glow */}
      {glowIntensity > 0 && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            for (let i = 4; i >= 0; i--) {
              const radius = 60 + i * 20;
              const alpha = glowIntensity * (0.3 - i * 0.05);
              g.circle(0, 0, radius * ringScale);
              g.fill({ color: glowColor, alpha });
            }
          }}
        />
      )}

      {/* Magic circle */}
      <pixiContainer scale={ringScale} rotation={runeRotation * 0.5}>
        <pixiGraphics
          draw={(g) => {
            g.clear();

            // Outer ring
            g.circle(0, 0, 55);
            g.stroke({ color: colors[0], width: 2, alpha: glowIntensity * 0.8 });

            // Inner ring
            g.circle(0, 0, 45);
            g.stroke({ color: colors[1], width: 1.5, alpha: glowIntensity * 0.6 });

            // Rune marks (6 points)
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const rx = Math.cos(angle) * 50;
              const ry = Math.sin(angle) * 50;

              g.star(rx, ry, 4, 6, 3, angle);
              g.fill({ color: colors[0], alpha: glowIntensity * 0.9 });
            }

            // Cross pattern
            for (let i = 0; i < 4; i++) {
              const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
              g.moveTo(0, 0);
              g.lineTo(Math.cos(angle) * 40, Math.sin(angle) * 40);
              g.stroke({ color: colors[1], width: 1, alpha: glowIntensity * 0.4 });
            }
          }}
        />
      </pixiContainer>

      {/* Orbiting particles */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          particles.forEach(p => {
            const alpha = p.life * glowIntensity;
            const size = p.size * (0.5 + p.life * 0.5);

            // Star-shaped particles for magic
            g.star(p.x, p.y, 4, size, size * 0.4, p.angle);
            g.fill({ color: p.color, alpha });

            // Small trailing glow
            g.circle(p.x, p.y, size * 0.5);
            g.fill({ color: 0xffffff, alpha: alpha * 0.5 });
          });
        }}
      />

      {/* Center flash */}
      {animRef.current.phase === "burst" && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            const flashAlpha = Math.max(0, 1 - animRef.current.elapsed * 3);
            g.circle(0, 0, 30);
            g.fill({ color: 0xffffff, alpha: flashAlpha });
          }}
        />
      )}
    </pixiContainer>
  );
}
