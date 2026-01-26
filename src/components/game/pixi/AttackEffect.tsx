import { useCallback, useState, useRef, useEffect } from "react";
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
  rotation: number;
}

export type AttackType = "slash" | "cast" | "shoot" | "thrust" | "heal" | "fire" | "frost" | "poison";

interface AttackEffectProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: AttackType;
  isActive: boolean;
  onComplete?: () => void;
}

const ATTACK_COLORS: Record<AttackType, number[]> = {
  slash: [0xffffff, 0xd1d5db, 0x9ca3af],
  cast: [0x8b5cf6, 0xa78bfa, 0xc4b5fd],
  shoot: [0x92400e, 0xfbbf24, 0xfef3c7],
  thrust: [0x6b7280, 0x9ca3af, 0xffffff],
  heal: [0x22c55e, 0x86efac, 0xffffff],
  fire: [0xef4444, 0xf97316, 0xfbbf24],
  frost: [0x38bdf8, 0x7dd3fc, 0xe0f2fe],
  poison: [0x22c55e, 0xa855f7, 0x86efac],
};

export function AttackEffect({
  startX,
  startY,
  endX,
  endY,
  type,
  isActive,
  onComplete,
}: AttackEffectProps) {
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [impactParticles, setImpactParticles] = useState<Particle[]>([]);
  const [showImpact, setShowImpact] = useState(false);

  const animRef = useRef({
    elapsed: 0,
    phase: "idle" as "idle" | "travel" | "impact" | "fade",
    lastParticleSpawn: 0,
  });
  const particleIdRef = useRef(0);
  const hasStartedRef = useRef(false);

  // Reset when activated
  useEffect(() => {
    if (isActive && !hasStartedRef.current) {
      hasStartedRef.current = true;
      animRef.current = { elapsed: 0, phase: "travel", lastParticleSpawn: 0 };
      setProgress(0);
      setParticles([]);
      setImpactParticles([]);
      setShowImpact(false);
    } else if (!isActive) {
      hasStartedRef.current = false;
      animRef.current.phase = "idle";
      // Reset visual states to prevent flashing
      setProgress(0);
      setParticles([]);
      setImpactParticles([]);
      setShowImpact(false);
    }
  }, [isActive]);

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  const colors = ATTACK_COLORS[type];

  // Animation speeds based on type
  const travelSpeed = type === "shoot" ? 4 : type === "cast" ? 2.5 : type === "slash" ? 6 : 5;
  const duration = distance / (travelSpeed * 100);

  useTick(useCallback((ticker: Ticker) => {
    if (!isActive || animRef.current.phase === "idle") return;

    const dt = ticker.deltaTime / 60;
    animRef.current.elapsed += dt;
    const elapsed = animRef.current.elapsed;

    // Update trail particles
    setParticles(prev =>
      prev.map(p => ({
        ...p,
        x: p.x + p.vx * dt * 30,
        y: p.y + p.vy * dt * 30,
        life: p.life - dt * 3,
        rotation: p.rotation + 0.1,
      })).filter(p => p.life > 0)
    );

    // Update impact particles
    setImpactParticles(prev =>
      prev.map(p => ({
        ...p,
        x: p.x + p.vx * dt * 60,
        y: p.y + p.vy * dt * 60,
        vy: p.vy + 0.3,
        life: p.life - dt * 2,
      })).filter(p => p.life > 0)
    );

    if (animRef.current.phase === "travel") {
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);

      // Spawn trail particles
      if (elapsed - animRef.current.lastParticleSpawn > 0.02) {
        animRef.current.lastParticleSpawn = elapsed;

        const currentX = startX + dx * newProgress;
        const currentY = startY + dy * newProgress;
        const perpAngle = angle + Math.PI / 2;
        const spread = type === "cast" ? 15 : type === "fire" ? 20 : 8;

        for (let i = 0; i < (type === "fire" ? 3 : type === "cast" ? 2 : 1); i++) {
          const offsetX = Math.cos(perpAngle) * (Math.random() - 0.5) * spread;
          const offsetY = Math.sin(perpAngle) * (Math.random() - 0.5) * spread;

          setParticles(prev => [...prev, {
            id: particleIdRef.current++,
            x: currentX + offsetX - startX,
            y: currentY + offsetY - startY,
            vx: -Math.cos(angle) * 0.5 + (Math.random() - 0.5) * 0.5,
            vy: -Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 0.5 - 0.3,
            life: 1,
            maxLife: 0.5 + Math.random() * 0.3,
            size: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
          }]);
        }
      }

      // Check for impact
      if (newProgress >= 1) {
        animRef.current.phase = "impact";
        animRef.current.elapsed = 0;
        setShowImpact(true);

        // Spawn impact burst
        const impactCount = type === "cast" || type === "fire" ? 20 : type === "heal" ? 15 : 12;
        const newImpact: Particle[] = [];

        for (let i = 0; i < impactCount; i++) {
          const burstAngle = (i / impactCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
          const speed = 3 + Math.random() * 5;

          newImpact.push({
            id: particleIdRef.current++,
            x: 0,
            y: 0,
            vx: Math.cos(burstAngle) * speed,
            vy: Math.sin(burstAngle) * speed - 2,
            life: 1,
            maxLife: 0.5 + Math.random() * 0.5,
            size: 4 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
          });
        }
        setImpactParticles(newImpact);
      }
    } else if (animRef.current.phase === "impact") {
      if (elapsed > 0.8 && impactParticles.length === 0) {
        animRef.current.phase = "idle";
        onComplete?.();
      }
    }
  }, [isActive, startX, startY, dx, dy, duration, angle, colors, type, onComplete, impactParticles.length]));

  if (!isActive && animRef.current.phase === "idle") return null;

  const currentX = startX + dx * progress;
  const currentY = startY + dy * progress;

  return (
    <pixiContainer>
      {/* Trail particles */}
      <pixiContainer x={startX} y={startY}>
        <pixiGraphics
          draw={(g) => {
            g.clear();
            particles.forEach(p => {
              const alpha = p.life;
              const size = p.size * (0.5 + p.life * 0.5);

              if (type === "cast" || type === "fire") {
                // Star-like particles for magic
                g.star(p.x, p.y, 5, size, size * 0.4, p.rotation);
              } else {
                g.circle(p.x, p.y, size);
              }
              g.fill({ color: p.color, alpha });
            });
          }}
        />
      </pixiContainer>

      {/* Projectile */}
      {progress < 1 && (
        <pixiContainer x={currentX} y={currentY} rotation={angle}>
          <pixiGraphics
            draw={(g) => {
              g.clear();

              if (type === "slash") {
                // Slash arc
                g.moveTo(-30, -15);
                g.quadraticCurveTo(0, -5, 30, 0);
                g.quadraticCurveTo(0, 5, -30, 15);
                g.closePath();
                g.fill({ color: 0xffffff, alpha: 0.9 });
                g.stroke({ color: 0xd1d5db, width: 2 });
              } else if (type === "thrust") {
                // Pointed thrust
                g.poly([-20, -8, 25, 0, -20, 8]);
                g.fill({ color: 0x9ca3af, alpha: 0.9 });
                g.stroke({ color: 0xffffff, width: 1 });
              } else if (type === "shoot") {
                // Arrow
                g.poly([15, 0, -5, -6, 0, 0, -5, 6]);
                g.fill({ color: 0x92400e });
                g.rect(-15, -2, 15, 4);
                g.fill({ color: 0xfbbf24 });
              } else if (type === "cast") {
                // Magic orb
                for (let i = 2; i >= 0; i--) {
                  g.circle(0, 0, 12 + i * 4);
                  g.fill({ color: colors[i % colors.length], alpha: 0.6 - i * 0.15 });
                }
                // Inner glow
                g.circle(0, 0, 8);
                g.fill({ color: 0xffffff, alpha: 0.8 });
              } else if (type === "heal") {
                // Healing sparkle
                g.star(0, 0, 4, 15, 6, 0);
                g.fill({ color: 0x22c55e, alpha: 0.9 });
                g.circle(0, 0, 8);
                g.fill({ color: 0xffffff, alpha: 0.6 });
              } else if (type === "fire") {
                // Fireball
                g.circle(0, 0, 15);
                g.fill({ color: 0xf97316 });
                g.circle(0, 0, 10);
                g.fill({ color: 0xfbbf24 });
                g.circle(0, 0, 5);
                g.fill({ color: 0xffffff, alpha: 0.8 });
              } else if (type === "frost") {
                // Ice shard
                g.poly([20, 0, -10, -12, -5, 0, -10, 12]);
                g.fill({ color: 0x7dd3fc, alpha: 0.9 });
                g.stroke({ color: 0xe0f2fe, width: 2 });
              } else if (type === "poison") {
                // Poison blob
                g.circle(0, 0, 12);
                g.fill({ color: 0x22c55e, alpha: 0.8 });
                g.circle(3, -3, 4);
                g.fill({ color: 0xa855f7, alpha: 0.6 });
              }
            }}
          />
        </pixiContainer>
      )}

      {/* Impact effect */}
      {showImpact && (
        <pixiContainer x={endX} y={endY}>
          <pixiGraphics
            draw={(g) => {
              g.clear();

              // Impact flash
              const flashAlpha = Math.max(0, 1 - animRef.current.elapsed * 3);
              if (flashAlpha > 0) {
                g.circle(0, 0, 30 + animRef.current.elapsed * 50);
                g.fill({ color: colors[0], alpha: flashAlpha * 0.5 });
              }

              // Impact particles
              impactParticles.forEach(p => {
                const alpha = p.life;
                const size = p.size * p.life;

                if (type === "cast" || type === "fire" || type === "heal") {
                  g.star(p.x, p.y, 5, size, size * 0.4, p.rotation);
                } else {
                  g.circle(p.x, p.y, size);
                }
                g.fill({ color: p.color, alpha });
              });
            }}
          />
        </pixiContainer>
      )}
    </pixiContainer>
  );
}
