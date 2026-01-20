import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useTick } from "@pixi/react";
import type { Ticker } from "pixi.js";
import { useGameStore } from "../../../store/gameStore";
import { DamageNumber, type DamageNumberData } from "./DamageNumber";
import { ScreenShake } from "./ScreenShake";
import { MonsterSprite } from "./MonsterSprite";
import { PlayerSprite } from "./PlayerSprite";
import { DiceRoll3D } from "./DiceRoll3D";
import { AttackEffect, type AttackType } from "./AttackEffect";
import { CardPlayEffect } from "./CardPlayEffect";
import { StatusEffectParticles } from "./StatusEffectParticles";
import { RoundTransition } from "./RoundTransition";
import { ActionCard } from "./ActionCard";
import type { EnvironmentType, EffectType, ClassType, ActionMessage } from "../../../types";

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

// Attack effect data
interface AttackEffectData {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: AttackType;
}

// Card play effect data
interface CardPlayEffectData {
  id: string;
  x: number;
  y: number;
  classType: ClassType;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

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
  const round = useGameStore((state) => state.round);

  // Particle animation time - use ref to avoid re-renders every frame
  const particleTimeRef = useRef(0);
  const [particleTime, setParticleTime] = useState(0);

  // Local state for active damage numbers
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);

  // Screen shake state
  const [isShaking, setIsShaking] = useState(false);

  // Attack effects state
  const [attackEffects, setAttackEffects] = useState<AttackEffectData[]>([]);

  // Card play effects state
  const [cardPlayEffects, setCardPlayEffects] = useState<CardPlayEffectData[]>([]);

  // Round transition state
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [transitionRound, setTransitionRound] = useState(1);
  const prevRoundRef = useRef(round);

  // Track which damage numbers we've already processed
  const lastProcessedCountRef = useRef(0);

  // Track previous attacking entity to detect new attacks
  const prevAttackingEntityRef = useRef<string | null>(null);

  // Action messages state - track displayed messages
  const [displayedActionMessages, setDisplayedActionMessages] = useState<ActionMessage[]>([]);
  const lastActionMessageCountRef = useRef(0);

  // Responsive sizing for mobile
  const isMobile = width < 500;
  const spriteScale = isMobile ? 1.2 : 2.0;

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

  // Animate particles - throttle updates to reduce re-renders
  const lastParticleUpdateRef = useRef(0);
  useTick(useCallback((ticker: Ticker) => {
    particleTimeRef.current += ticker.deltaTime * 0.02;

    // Only update state every 32ms (~30fps) for particles - they don't need 60fps
    const now = Date.now();
    if (now - lastParticleUpdateRef.current > 32) {
      lastParticleUpdateRef.current = now;
      setParticleTime(particleTimeRef.current);
    }
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

  // Process action messages from animation state
  useTick(useCallback(() => {
    // Filter out damage and heal types (those are shown as floating numbers)
    const filteredMessages = animation.actionMessages.filter(
      (msg) => msg.type !== "damage" && msg.type !== "heal"
    );

    if (filteredMessages.length > lastActionMessageCountRef.current) {
      const newMessages = filteredMessages.slice(lastActionMessageCountRef.current);
      lastActionMessageCountRef.current = filteredMessages.length;

      // Add new messages to displayed list
      setDisplayedActionMessages(prev => [...prev, ...newMessages]);
    }
  }, [animation.actionMessages]));

  // Reset action message counter when cleared
  useEffect(() => {
    if (animation.actionMessages.length === 0) {
      lastActionMessageCountRef.current = 0;
    }
  }, [animation.actionMessages.length]);

  // Remove finished action messages
  const handleActionMessageComplete = useCallback((id: string) => {
    setDisplayedActionMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Detect round changes for transition effect
  useEffect(() => {
    if (round !== prevRoundRef.current && round > 1) {
      setTransitionRound(round);
      setShowRoundTransition(true);
      prevRoundRef.current = round;
    }
  }, [round]);

  // Handle round transition complete
  const handleRoundTransitionComplete = useCallback(() => {
    setShowRoundTransition(false);
  }, []);

  // Calculate positions for monsters (RIGHT side of canvas)
  // NOTE: These must be defined BEFORE the useEffect that uses them
  const getMonsterPosition = useCallback((index: number, total: number) => {
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Responsive spacing - needs enough space for name/HP bars to not overlap
    const isMobile = width < 500;
    const spacing = isMobile ? 140 : 210;
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    // Stagger monsters horizontally (alternating left/right offset)
    const staggerOffset = isMobile ? (index % 2 === 0 ? 0 : -40) : (index % 2 === 0 ? 0 : -80);
    const baseX = isMobile ? safeWidth * 0.75 : safeWidth * 0.68;

    return {
      x: baseX + staggerOffset,
      y: Math.max(isMobile ? 50 : 100, startY) + spacing * index
    };
  }, [width, height]);

  // Calculate positions for players (LEFT side of canvas)
  const getPlayerPosition = useCallback((index: number, total: number) => {
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Responsive spacing - smaller on mobile
    const isMobile = width < 500;
    const spacing = isMobile ? 90 : 160;
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    return {
      x: isMobile ? safeWidth * 0.22 : safeWidth * 0.25,
      y: Math.max(isMobile ? 60 : 120, startY) + spacing * index
    };
  }, [width, height]);

  // Get position for action message based on source entity
  const getActionMessagePosition = useCallback((sourceId?: string) => {
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);
    const isMobile = width < 500;
    const offset = isMobile ? 60 : 120;

    if (!sourceId) {
      // No source - center of screen
      return { x: safeWidth / 2, y: safeHeight * 0.3 };
    }

    // Check if source is a player
    const playerIndex = players.findIndex(p => p.id === sourceId);
    if (playerIndex >= 0) {
      const pos = getPlayerPosition(playerIndex, players.length);
      // Offset to the right of player so it doesn't cover them
      return { x: pos.x + offset, y: pos.y - (isMobile ? 20 : 40) };
    }

    // Check if source is a monster
    const monsterIndex = monsters.findIndex(m => m.id === sourceId);
    if (monsterIndex >= 0) {
      const pos = getMonsterPosition(monsterIndex, monsters.length);
      // Offset to the left of monster so it doesn't cover them
      return { x: pos.x - offset, y: pos.y - (isMobile ? 20 : 40) };
    }

    // Fallback to center
    return { x: safeWidth / 2, y: safeHeight * 0.3 };
  }, [players, monsters, getPlayerPosition, getMonsterPosition, width, height]);

  // Detect new attacks and create attack effects
  useEffect(() => {
    const { attackingEntityId, attackAnimation } = animation;

    // Only trigger for valid attack animations
    const isValidAttackAnimation = attackAnimation === "slash" || attackAnimation === "thrust" ||
                                   attackAnimation === "shoot" || attackAnimation === "cast";

    if (attackingEntityId && isValidAttackAnimation && attackingEntityId !== prevAttackingEntityRef.current) {
      prevAttackingEntityRef.current = attackingEntityId;

      // Find attacker position
      const attackerIsPlayer = players.some(p => p.id === attackingEntityId);
      const attackerIsMonster = monsters.some(m => m.id === attackingEntityId);

      let startPos = { x: width / 2, y: height / 2 };
      let endPos = { x: width / 2, y: height / 2 };
      let hasValidTarget = false;
      let isSelfTargetOnly = false;

      // Check if this is a self-target only action (like self-heal or buff)
      if (attackerIsPlayer) {
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer) {
          const selectedCard = currentPlayer.hand.find(c => c.id === selectedCardId);
          if (selectedCard) {
            // Check if all effects target self or allies only (no monster targets)
            const hasMonsterTarget = selectedCard.effects.some(e =>
              e.target === "monster" || e.target === "allMonsters" ||
              (e.type === "damage" && e.target !== "self" && e.target !== "ally" && e.target !== "allAllies")
            );
            isSelfTargetOnly = !hasMonsterTarget;
          }
        }
      }

      if (attackerIsPlayer && !isSelfTargetOnly) {
        const playerIndex = players.findIndex(p => p.id === attackingEntityId);
        if (playerIndex >= 0) {
          startPos = getPlayerPosition(playerIndex, players.length);

          // Target first alive monster or selected target
          const targetMonster = selectedTargetId
            ? monsters.find(m => m.id === selectedTargetId)
            : monsters.find(m => m.isAlive);

          if (targetMonster) {
            const monsterIndex = monsters.findIndex(m => m.id === targetMonster.id);
            endPos = getMonsterPosition(monsterIndex, monsters.length);
            hasValidTarget = true;
          }
        }
      } else if (attackerIsMonster) {
        const monsterIndex = monsters.findIndex(m => m.id === attackingEntityId);
        if (monsterIndex >= 0) {
          startPos = getMonsterPosition(monsterIndex, monsters.length);

          // Target highest aggro player
          const targetPlayer = players.find(p => p.id === highestAggroPlayerId && p.isAlive);
          if (targetPlayer) {
            const playerIndex = players.findIndex(p => p.id === targetPlayer.id);
            endPos = getPlayerPosition(playerIndex, players.length);
            hasValidTarget = true;
          }
        }
      }

      // Only create attack effect if there's a valid target (skip self-buffs/heals)
      if (hasValidTarget) {
        // Map animation type to attack effect type
        let effectType: AttackType = "slash";
        if (attackAnimation === "cast") effectType = "cast";
        else if (attackAnimation === "shoot") effectType = "shoot";
        else if (attackAnimation === "thrust") effectType = "thrust";

        // Check for element effects (fire, ice, poison) from the current player's selected card
        const currentPlayer = players[currentPlayerIndex];
        if (currentPlayer && attackerIsPlayer) {
          const selectedCard = currentPlayer.hand.find(c => c.id === selectedCardId);
          if (selectedCard) {
            const hasFireEffect = selectedCard.effects.some(e => e.type === "burn");
            const hasIceEffect = selectedCard.effects.some(e => e.type === "ice");
            const hasPoisonEffect = selectedCard.effects.some(e => e.type === "poison");

            if (hasFireEffect) effectType = "fire";
            else if (hasIceEffect) effectType = "ice";
            else if (hasPoisonEffect) effectType = "poison";
          }
        }

        const newEffect: AttackEffectData = {
          id: `attack-${Date.now()}-${Math.random()}`,
          startX: startPos.x,
          startY: startPos.y,
          endX: endPos.x,
          endY: endPos.y,
          type: effectType,
        };

        setAttackEffects(prev => [...prev, newEffect]);
      }

      // Trigger card play effect at attacker position (for all card plays, not just attacks)
      if (attackerIsPlayer && currentPlayerIndex >= 0) {
        const player = players[currentPlayerIndex];
        const card = player?.hand.find(c => c.id === selectedCardId);
        if (card) {
          const cardEffect: CardPlayEffectData = {
            id: `card-${Date.now()}-${Math.random()}`,
            x: startPos.x,
            y: startPos.y,
            classType: player.class,
            rarity: card.rarity,
          };
          setCardPlayEffects(prev => [...prev, cardEffect]);
        }
      }
    } else if (!attackingEntityId) {
      prevAttackingEntityRef.current = null;
    }
  }, [animation.attackingEntityId, animation.attackAnimation, players, monsters, selectedTargetId, selectedCardId, currentPlayerIndex, highestAggroPlayerId, width, height, getPlayerPosition, getMonsterPosition]);

  // Remove completed attack effects
  const handleAttackEffectComplete = useCallback((id: string) => {
    setAttackEffects(prev => prev.filter(e => e.id !== id));
  }, []);

  // Remove completed card play effects
  const handleCardPlayEffectComplete = useCallback((id: string) => {
    setCardPlayEffects(prev => prev.filter(e => e.id !== id));
  }, []);

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
              scaleFactor={spriteScale}
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
              scaleFactor={spriteScale}
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

        {/* Card Play Effects */}
        {cardPlayEffects.map((effect) => (
          <CardPlayEffect
            key={effect.id}
            x={effect.x}
            y={effect.y}
            classType={effect.classType}
            rarity={effect.rarity}
            isActive={true}
            onComplete={() => handleCardPlayEffectComplete(effect.id)}
          />
        ))}

        {/* Attack Effects (projectiles, slashes, etc.) */}
        {attackEffects.map((effect) => (
          <AttackEffect
            key={effect.id}
            startX={effect.startX}
            startY={effect.startY}
            endX={effect.endX}
            endY={effect.endY}
            type={effect.type}
            isActive={true}
            onComplete={() => handleAttackEffectComplete(effect.id)}
          />
        ))}

        {/* Status Effect Particles on Players */}
        {players.map((player, index) => {
          const pos = getPlayerPosition(index, players.length);
          const activeEffects = [
            ...player.debuffs.map(d => d.type),
            ...player.buffs.map(b => b.type),
            ...(player.isStealth ? ["stealth" as EffectType] : []),
            ...(player.hasTaunt ? ["taunt" as EffectType] : []),
            ...(player.isStunned ? ["stun" as EffectType] : []),
          ];

          return activeEffects.length > 0 ? (
            <StatusEffectParticles
              key={`status-${player.id}`}
              x={pos.x}
              y={pos.y}
              effects={activeEffects}
              isActive={player.isAlive}
            />
          ) : null;
        })}

        {/* Status Effect Particles on Monsters */}
        {monsters.map((monster, index) => {
          const pos = getMonsterPosition(index, monsters.length);
          const activeEffects = [
            ...monster.debuffs.map(d => d.type),
            ...monster.buffs.map(b => b.type),
          ];

          return activeEffects.length > 0 ? (
            <StatusEffectParticles
              key={`status-${monster.id}`}
              x={pos.x}
              y={pos.y}
              effects={activeEffects}
              isActive={monster.isAlive}
            />
          ) : null;
        })}

        {/* Action Cards - positioned near characters */}
        {displayedActionMessages.map((msg) => {
          const pos = getActionMessagePosition(msg.sourceId);
          return (
            <ActionCard
              key={msg.id}
              message={msg}
              x={pos.x}
              y={pos.y}
              scaleFactor={isMobile ? 0.7 : 1.0}
              onComplete={handleActionMessageComplete}
            />
          );
        })}

        {/* Dice Roll 3D Effect */}
        {(animation.diceRolling || animation.diceRoll !== null) && (
          <DiceRoll3D
            x={width / 2}
            y={height / 2 - 50}
            isRolling={animation.diceRolling}
            finalValue={animation.diceRoll}
          />
        )}

        {/* Round Transition Effect */}
        <RoundTransition
          width={width}
          height={height}
          roundNumber={transitionRound}
          roundName={getRoundName(transitionRound)}
          isActive={showRoundTransition}
          onComplete={handleRoundTransitionComplete}
        />
      </pixiContainer>
    </ScreenShake>
  );
}

// Helper function to get round name
function getRoundName(round: number): string {
  const names: Record<number, string> = {
    1: "The Dark Passage",
    2: "The Haunted Halls",
    3: "The Chamber of Horrors",
    4: "The Lich King's Crypt",
    5: "The Demon Gate",
    6: "The Dragon's Lair",
  };
  return names[round] || `Round ${round}`;
}
