import { useCallback, useState, useRef, useEffect } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";
import type { EffectType } from "../../../types";

interface StatusParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: number;
  rotation: number;
  type: "circle" | "star" | "bubble" | "shard";
}

interface StatusEffectParticlesProps {
  x: number;
  y: number;
  effects: EffectType[];
  isActive: boolean;
}

const EFFECT_CONFIG: Record<string, {
  colors: number[];
  particleType: "circle" | "star" | "bubble" | "shard";
  riseSpeed: number;
  spread: number;
  spawnRate: number;
}> = {
  burn: {
    colors: [0xef4444, 0xf97316, 0xfbbf24],
    particleType: "star",
    riseSpeed: -2,
    spread: 25,
    spawnRate: 0.08,
  },
  poison: {
    colors: [0x22c55e, 0xa855f7, 0x86efac],
    particleType: "bubble",
    riseSpeed: -1.5,
    spread: 20,
    spawnRate: 0.1,
  },
  ice: {
    colors: [0x38bdf8, 0x7dd3fc, 0xe0f2fe],
    particleType: "shard",
    riseSpeed: 0.5,
    spread: 30,
    spawnRate: 0.12,
  },
  stun: {
    colors: [0xfbbf24, 0xfef3c7, 0xffffff],
    particleType: "star",
    riseSpeed: 0,
    spread: 35,
    spawnRate: 0.06,
  },
  weakness: {
    colors: [0x6b7280, 0x9ca3af, 0x4b5563],
    particleType: "circle",
    riseSpeed: -0.5,
    spread: 25,
    spawnRate: 0.15,
  },
  strength: {
    colors: [0xef4444, 0xfbbf24, 0xffffff],
    particleType: "star",
    riseSpeed: -1,
    spread: 20,
    spawnRate: 0.1,
  },
  stealth: {
    colors: [0x6b7280, 0x374151, 0x9ca3af],
    particleType: "circle",
    riseSpeed: 0.3,
    spread: 40,
    spawnRate: 0.2,
  },
  taunt: {
    colors: [0xef4444, 0xfbbf24, 0xffffff],
    particleType: "star",
    riseSpeed: -0.8,
    spread: 30,
    spawnRate: 0.1,
  },
  shield: {
    colors: [0x3b82f6, 0x60a5fa, 0xffffff],
    particleType: "shard",
    riseSpeed: 0.2,
    spread: 35,
    spawnRate: 0.15,
  },
};

export function StatusEffectParticles({
  x,
  y,
  effects,
  isActive,
}: StatusEffectParticlesProps) {
  const [particles, setParticles] = useState<StatusParticle[]>([]);
  const animRef = useRef({ elapsed: 0, lastSpawns: {} as Record<string, number> });
  const particleIdRef = useRef(0);

  // Clear particles and reset state when deactivated
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      animRef.current = { elapsed: 0, lastSpawns: {} };
    }
  }, [isActive]);

  useTick(useCallback((ticker: Ticker) => {
    if (!isActive || effects.length === 0) return;

    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    // Update existing particles
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        x: p.x + p.vx * dt * 30,
        y: p.y + p.vy * dt * 30,
        life: p.life - dt * 1.5,
        rotation: p.rotation + 0.05,
        size: p.size * (0.98 + p.life * 0.02),
      })).filter(p => p.life > 0)
    );

    // Spawn new particles for each effect
    effects.forEach(effectType => {
      const config = EFFECT_CONFIG[effectType];
      if (!config) return;

      const lastSpawn = animRef.current.lastSpawns[effectType] || 0;
      if (elapsed - lastSpawn > config.spawnRate) {
        animRef.current.lastSpawns[effectType] = elapsed;

        const spawnX = (Math.random() - 0.5) * config.spread;
        const spawnY = (Math.random() - 0.5) * config.spread;

        setParticles(prev => [...prev, {
          id: particleIdRef.current++,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 1,
          vy: config.riseSpeed + (Math.random() - 0.5) * 0.5,
          life: 1,
          size: 3 + Math.random() * 4,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          rotation: Math.random() * Math.PI * 2,
          type: config.particleType,
        }]);
      }
    });
  }, [isActive, effects]));

  if (!isActive || effects.length === 0) return null;

  // Determine glow based on dominant effect
  const primaryEffect = effects[0];
  const config = EFFECT_CONFIG[primaryEffect];
  const glowColor = config?.colors[0] || 0xffffff;

  return (
    <pixiContainer x={x} y={y}>
      {/* Subtle glow */}
      <pixiGraphics
        draw={(g) => {
          g.clear();
          g.circle(0, 0, 40);
          g.fill({ color: glowColor, alpha: 0.1 });
        }}
      />

      {/* Particles */}
      <pixiGraphics
        draw={(g) => {
          g.clear();

          particles.forEach(p => {
            const alpha = p.life * 0.8;
            const size = p.size;
            const cos = Math.cos(p.rotation);
            const sin = Math.sin(p.rotation);

            switch (p.type) {
              case "star":
                // Draw star at particle position (rotation handled by star's built-in rotation param)
                g.star(p.x, p.y, 5, size, size * 0.4, p.rotation);
                g.fill({ color: p.color, alpha });
                break;

              case "bubble":
                g.circle(p.x, p.y, size);
                g.fill({ color: p.color, alpha: alpha * 0.6 });
                g.circle(p.x, p.y, size);
                g.stroke({ color: p.color, width: 1.5, alpha });
                // Shine
                g.circle(p.x - size * 0.3, p.y - size * 0.3, size * 0.2);
                g.fill({ color: 0xffffff, alpha: alpha * 0.5 });
                break;

              case "shard": {
                // Manually rotate shard points around particle position
                const points = [
                  { x: 0, y: -size },
                  { x: size * 0.5, y: 0 },
                  { x: 0, y: size },
                  { x: -size * 0.5, y: 0 },
                ];
                const rotated = points.map(pt => ({
                  x: p.x + pt.x * cos - pt.y * sin,
                  y: p.y + pt.x * sin + pt.y * cos,
                }));
                g.poly(rotated.flatMap(pt => [pt.x, pt.y]));
                g.fill({ color: p.color, alpha });
                break;
              }

              case "circle":
              default:
                g.circle(p.x, p.y, size);
                g.fill({ color: p.color, alpha });
                break;
            }
          });
        }}
      />

      {/* Effect-specific overlays */}
      {effects.includes("stun") && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Spinning stars for stun
            const time = animRef.current.elapsed;
            for (let i = 0; i < 3; i++) {
              const angle = time * 3 + (i / 3) * Math.PI * 2;
              const radius = 25;
              const sx = Math.cos(angle) * radius;
              const sy = Math.sin(angle) * radius - 30;
              g.star(sx, sy, 5, 6, 3, time + i);
              g.fill({ color: 0xfbbf24, alpha: 0.8 });
            }
          }}
        />
      )}

      {effects.includes("stealth") && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Wavy transparency effect
            const time = animRef.current.elapsed;
            for (let i = 0; i < 5; i++) {
              const waveY = -40 + i * 20 + Math.sin(time * 2 + i) * 5;
              g.moveTo(-30, waveY);
              g.quadraticCurveTo(0, waveY + Math.sin(time * 3 + i) * 10, 30, waveY);
              g.stroke({ color: 0x6b7280, width: 2, alpha: 0.3 });
            }
          }}
        />
      )}

      {effects.includes("taunt") && (
        <pixiGraphics
          draw={(g) => {
            g.clear();
            // Target reticle
            const time = animRef.current.elapsed;
            const pulse = 1 + Math.sin(time * 4) * 0.1;

            g.circle(0, -50, 15 * pulse);
            g.stroke({ color: 0xef4444, width: 2, alpha: 0.8 });
            g.circle(0, -50, 8 * pulse);
            g.stroke({ color: 0xef4444, width: 2, alpha: 0.8 });
            g.circle(0, -50, 3);
            g.fill({ color: 0xef4444, alpha: 0.9 });
          }}
        />
      )}
    </pixiContainer>
  );
}
