import { useCallback, useState, useEffect, useRef } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  type: "hit" | "heal" | "fire" | "frost" | "poison";
  isActive: boolean;
  onComplete?: () => void;
}

const PARTICLE_COLORS = {
  hit: [0xef4444, 0xfbbf24, 0xffffff],
  heal: [0x22c55e, 0x86efac, 0xffffff],
  fire: [0xf97316, 0xfbbf24, 0xef4444],
  frost: [0x38bdf8, 0x7dd3fc, 0xffffff],
  poison: [0x22c55e, 0x86efac, 0xa855f7],
};

export function ParticleEffect({ x, y, type, isActive, onComplete }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const hasSpawnedRef = useRef(false);

  // Spawn particles when activated
  useEffect(() => {
    if (isActive && !hasSpawnedRef.current) {
      hasSpawnedRef.current = true;
      const colors = PARTICLE_COLORS[type];
      const newParticles: Particle[] = [];

      const particleCount = type === "hit" ? 12 : 8;

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const speed = 2 + Math.random() * 3;

        newParticles.push({
          id: particleIdRef.current++,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      setParticles(newParticles);
    } else if (!isActive) {
      hasSpawnedRef.current = false;
    }
  }, [isActive, type]);

  // Update particles
  useTick(useCallback((ticker: Ticker) => {
    setParticles((prev) => {
      if (prev.length === 0) return prev;

      const dt = ticker.deltaTime / 60;
      const updated = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1, // gravity
          life: p.life - dt / p.maxLife,
        }))
        .filter((p) => p.life > 0);

      if (updated.length === 0 && prev.length > 0) {
        onComplete?.();
      }

      return updated;
    });
  }, [onComplete]));

  if (particles.length === 0) return null;

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics
        draw={(g) => {
          g.clear();
          particles.forEach((p) => {
            const alpha = p.life;
            const size = p.size * p.life;

            g.circle(p.x, p.y, size);
            g.fill({ color: p.color, alpha });
          });
        }}
      />
    </pixiContainer>
  );
}
