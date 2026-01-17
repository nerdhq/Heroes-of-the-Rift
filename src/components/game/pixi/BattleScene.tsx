import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useTick } from "@pixi/react";
import { useGameStore } from "../../../store/gameStore";
import { DamageNumber, type DamageNumberData } from "./DamageNumber";
import { ScreenShake } from "./ScreenShake";
import { MonsterSprite } from "./MonsterSprite";
import { PlayerSprite } from "./PlayerSprite";

interface BattleSceneProps {
  width: number;
  height: number;
}

export function BattleScene({ width, height }: BattleSceneProps) {
  // Game state from Zustand
  const animation = useGameStore((state) => state.animation);
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const phase = useGameStore((state) => state.phase);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);
  const needsTargetSelection = useGameStore((state) => state.needsTargetSelection);
  const getTargetType = useGameStore((state) => state.getTargetType);
  const startDiceRoll = useGameStore((state) => state.startDiceRoll);

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
    // Guard against 0 dimensions
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Monsters on the right side, stacked vertically
    const spacing = 130; // Vertical spacing between sprites
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    return {
      x: safeWidth * 0.65,  // Right side (closer to center)
      y: Math.max(100, startY) + spacing * index  // Ensure minimum Y
    };
  }, [width, height]);

  // Calculate positions for players (LEFT side of canvas)
  const getPlayerPosition = useCallback((index: number, total: number) => {
    // Guard against 0 dimensions
    const safeWidth = Math.max(width, 400);
    const safeHeight = Math.max(height, 300);

    // Players on the left side, stacked vertically
    const spacing = 120; // Vertical spacing between sprites
    const totalHeight = (total - 1) * spacing;
    const startY = (safeHeight - totalHeight) / 2;

    return {
      x: safeWidth * 0.30,  // Left side
      y: Math.max(100, startY) + spacing * index  // Ensure minimum Y
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

  return (
    <ScreenShake isShaking={isShaking} intensity={5}>
      <pixiContainer>
        {/* Monsters - upper portion */}
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

        {/* Players - lower portion */}
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
