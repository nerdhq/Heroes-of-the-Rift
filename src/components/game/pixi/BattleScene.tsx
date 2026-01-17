import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";
import { useGameStore } from "../../../store/gameStore";
import { DamageNumber, type DamageNumberData } from "./DamageNumber";
import { ScreenShake } from "./ScreenShake";
import { MonsterSprite } from "./MonsterSprite";
import { PlayerSprite } from "./PlayerSprite";
import type { EnvironmentType } from "../../../types";

interface BattleSceneProps {
  width: number;
  height: number;
}

// Environment background colors and effects
const ENVIRONMENT_THEMES: Record<EnvironmentType, {
  skyTop: number;
  skyBottom: number;
  groundTop: number;
  groundBottom: number;
  particles?: { color: number; count: number };
}> = {
  forest: {
    skyTop: 0x1a3a2a,
    skyBottom: 0x2d5a3d,
    groundTop: 0x1a2f1a,
    groundBottom: 0x0d1f0d,
    particles: { color: 0x88ff88, count: 8 },
  },
  castle: {
    skyTop: 0x1a1a2e,
    skyBottom: 0x2d2d4a,
    groundTop: 0x2a2a3a,
    groundBottom: 0x1a1a2a,
  },
  volcano: {
    skyTop: 0x3a1a0a,
    skyBottom: 0x5a2a1a,
    groundTop: 0x2a1a0a,
    groundBottom: 0x1a0a00,
    particles: { color: 0xff6600, count: 12 },
  },
  iceCave: {
    skyTop: 0x1a3a4a,
    skyBottom: 0x2a5a6a,
    groundTop: 0x1a3a4a,
    groundBottom: 0x0a2a3a,
    particles: { color: 0xaaddff, count: 15 },
  },
  swamp: {
    skyTop: 0x2a3a1a,
    skyBottom: 0x3a4a2a,
    groundTop: 0x2a3a1a,
    groundBottom: 0x1a2a0a,
    particles: { color: 0x88aa44, count: 6 },
  },
  desert: {
    skyTop: 0x4a3a1a,
    skyBottom: 0x6a5a2a,
    groundTop: 0x5a4a2a,
    groundBottom: 0x3a2a1a,
  },
  crypt: {
    skyTop: 0x1a1a1a,
    skyBottom: 0x2a2a2a,
    groundTop: 0x1a1a2a,
    groundBottom: 0x0a0a1a,
    particles: { color: 0x8844aa, count: 5 },
  },
  void: {
    skyTop: 0x0a0a1a,
    skyBottom: 0x1a1a3a,
    groundTop: 0x0a0a2a,
    groundBottom: 0x000010,
    particles: { color: 0x6644ff, count: 20 },
  },
};

export function BattleScene({ width, height }: BattleSceneProps) {
  // Game state from Zustand
  const animation = useGameStore((state) => state.animation);
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const environment = useGameStore((state) => state.environment);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const phase = useGameStore((state) => state.phase);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);
  const needsTargetSelection = useGameStore((state) => state.needsTargetSelection);
  const getTargetType = useGameStore((state) => state.getTargetType);
  const startDiceRoll = useGameStore((state) => state.startDiceRoll);

  // Particle animation time
  const [particleTime, setParticleTime] = useState(0);

  // Local state for active damage numbers
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);

  // Screen shake state
  const [isShaking, setIsShaking] = useState(false);

  // Track which damage numbers we've already processed
  const lastProcessedCountRef = useRef(0);

  // Calculate highest aggro player for targeting indicator
  const highestAggroPlayerId = useMemo(() => {
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length === 0) return null;

    const tauntPlayer = alivePlayers.find((p) => p.hasTaunt);
    if (tauntPlayer) return tauntPlayer.id;

    const visiblePlayers = alivePlayers.filter((p) => !p.isStealth);
    if (visiblePlayers.length === 0) return alivePlayers[0]?.id;

    return visiblePlayers.reduce((highest, p) => {
      const pAggro = p.baseAggro + p.diceAggro;
      const hAggro = highest.baseAggro + highest.diceAggro;
      return pAggro > hAggro ? p : highest;
    }, visiblePlayers[0])?.id;
  }, [players]);

  // Handle monster selection for targeting
  const handleSelectMonster = useCallback((monsterId: string) => {
    useGameStore.setState({ selectedTargetId: monsterId });
    startDiceRoll();
  }, [startDiceRoll]);

  // Check if monsters are selectable (card selected that needs monster target)
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();
  const monstersSelectable = phase === "SELECT" && !!selectedCardId && needsTarget && targetType === "monster";

  // Animate particles
  useTick(useCallback((ticker: Ticker) => {
    setParticleTime(prev => prev + ticker.deltaTime * 0.02);
  }, []));

  // Process damage numbers from animation state
  useTick(useCallback(() => {
    // Check for new damage numbers from game state
    if (animation.damageNumbers.length > lastProcessedCountRef.current) {
      const newNumbers = animation.damageNumbers.slice(lastProcessedCountRef.current);
      lastProcessedCountRef.current = animation.damageNumbers.length;

      newNumbers.forEach((dn) => {
        const newDamageNumber: DamageNumberData = {
          id: `${dn.targetId}-${Date.now()}-${Math.random()}`,
          value: dn.value,
          type: dn.type,
          x: 0,
          y: 0,
          targetId: dn.targetId,
        };
        setDamageNumbers((prev) => [...prev, newDamageNumber]);

        // Trigger screen shake for big damage
        if (dn.type === "damage" && dn.value >= 10) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 200);
        }
      });
    }
  }, [animation.damageNumbers]));

  // Reset counter when animation.damageNumbers is cleared
  useEffect(() => {
    if (animation.damageNumbers.length === 0) {
      lastProcessedCountRef.current = 0;
    }
  }, [animation.damageNumbers.length]);

  // Remove finished damage numbers
  const handleDamageNumberComplete = useCallback((id: string) => {
    setDamageNumbers((prev) => prev.filter((dn) => dn.id !== id));
  }, []);

  // Calculate positions for monsters (RIGHT side of canvas)
  const getMonsterPosition = useCallback((index: number, total: number) => {
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Fixed spacing between monsters (not stretched to fill canvas)
    const spacing = 150;
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    return {
      x: safeWidth * 0.72,
      y: Math.max(100, startY) + spacing * index
    };
  }, [width, height]);

  // Calculate positions for players (LEFT side of canvas)
  const getPlayerPosition = useCallback((index: number, total: number) => {
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Fixed spacing between players
    const spacing = 160;
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    return {
      x: safeWidth * 0.25,
      y: Math.max(120, startY) + spacing * index
    };
  }, [width, height]);

  // Get position for damage number based on target
  const getDamageNumberPosition = useCallback((targetId: string) => {
    // Check if target is a monster
    const monsterIndex = monsters.findIndex(m => m.id === targetId);
    if (monsterIndex >= 0) {
      const pos = getMonsterPosition(monsterIndex, monsters.length);
      return { x: pos.x, y: pos.y - 60 };  // Above monster sprite
    }

    // Check if target is a player
    const playerIndex = players.findIndex(p => p.id === targetId);
    if (playerIndex >= 0) {
      const pos = getPlayerPosition(playerIndex, players.length);
      return { x: pos.x, y: pos.y - 60 };  // Above player sprite
    }

    // Fallback to center
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);
    return { x: safeWidth / 2, y: safeHeight * 0.4 };
  }, [monsters, players, getMonsterPosition, getPlayerPosition, width, height]);

  // Get environment theme colors
  const envTheme = environment?.type ? ENVIRONMENT_THEMES[environment.type] : null;

  return (
    <ScreenShake isShaking={isShaking} intensity={5}>
      <pixiContainer>
        {/* Environment Background */}
        {envTheme && (
          <>
            {/* Sky gradient */}
            <pixiGraphics
              draw={(g) => {
                g.clear();
                // Top part - darker
                g.rect(0, 0, width, height * 0.6);
                g.fill({ color: envTheme.skyTop });
                // Bottom part - lighter
                g.rect(0, height * 0.4, width, height * 0.6);
                g.fill({ color: envTheme.skyBottom });
              }}
            />
            {/* Ground area */}
            <pixiGraphics
              draw={(g) => {
                g.clear();
                g.rect(0, height * 0.85, width, height * 0.15);
                g.fill({ color: envTheme.groundTop });
                // Ground line
                g.moveTo(0, height * 0.85);
                g.lineTo(width, height * 0.85);
                g.stroke({ color: envTheme.groundBottom, width: 2, alpha: 0.5 });
              }}
            />
            {/* Floating particles */}
            {envTheme.particles && (
              <pixiGraphics
                draw={(g) => {
                  g.clear();
                  for (let i = 0; i < envTheme.particles!.count; i++) {
                    const baseX = (i * 137.5 + particleTime * 20) % (width + 50) - 25;
                    const baseY = (i * 89.3 + Math.sin(particleTime + i) * 30) % (height * 0.8) + height * 0.1;
                    const size = 2 + (i % 3);
                    const alpha = 0.3 + Math.sin(particleTime * 2 + i) * 0.2;
                    g.circle(baseX, baseY, size);
                    g.fill({ color: envTheme.particles!.color, alpha });
                  }
                }}
              />
            )}
            {/* Atmospheric overlay */}
            <pixiGraphics
              draw={(g) => {
                g.clear();
                g.rect(0, 0, width, height);
                g.fill({ color: envTheme.skyTop, alpha: 0.1 });
              }}
            />
          </>
        )}

        {/* Monsters - right side */}
        {monsters.map((monster, index) => {
          const pos = getMonsterPosition(index, monsters.length);
          return (
            <MonsterSprite
              key={monster.id}
              monster={monster}
              x={pos.x}
              y={pos.y}
              isSelectable={monstersSelectable && monster.isAlive}
              isSelected={selectedTargetId === monster.id}
              onSelect={handleSelectMonster}
            />
          );
        })}

        {/* Players - left side */}
        {players.map((player, index) => {
          const pos = getPlayerPosition(index, players.length);
          return (
            <PlayerSprite
              key={player.id}
              player={player}
              x={pos.x}
              y={pos.y}
              isCurrentPlayer={index === currentPlayerIndex}
              isTargeted={
                player.id === highestAggroPlayerId &&
                player.isAlive &&
                monsters.some((m) => m.isAlive)
              }
            />
          );
        })}

        {/* Damage Numbers - positioned based on target */}
        {damageNumbers.map((dn) => {
          const pos = getDamageNumberPosition(dn.targetId);
          return (
            <DamageNumber
              key={dn.id}
              id={dn.id}
              value={dn.value}
              type={dn.type}
              x={pos.x}
              y={pos.y}
              onComplete={handleDamageNumberComplete}
            />
          );
        })}
      </pixiContainer>
    </ScreenShake>
  );
}
