import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { HelpModal } from "./HelpModal";
import {
  PlayerCard,
  MonsterCard,
  BattleLog,
  DiceRollOverlay,
  ActionMessages,
  FloatingDamageNumbers,
  GameHeader,
  SpeedSettings,
  QuitConfirmModal,
  TopControls,
  CardHand,
} from "./game";

export function GameScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);

  // Game state from store
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const turn = useGameStore((state) => state.turn);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const drawnCards = useGameStore((state) => state.drawnCards);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);
  const log = useGameStore((state) => state.log);
  const animation = useGameStore((state) => state.animation);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const skipAnimations = useGameStore((state) => state.skipAnimations);
  const enhanceMode = useGameStore((state) => state.enhanceMode);

  // Actions from store
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);
  const confirmTarget = useGameStore((state) => state.confirmTarget);
  const startDiceRoll = useGameStore((state) => state.startDiceRoll);
  const setAnimation = useGameStore((state) => state.setAnimation);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const toggleSkipAnimations = useGameStore(
    (state) => state.toggleSkipAnimations
  );
  const setScreen = useGameStore((state) => state.setScreen);
  const useSpecialAbility = useGameStore((state) => state.useSpecialAbility);
  const setEnhanceMode = useGameStore((state) => state.setEnhanceMode);

  // Computed values
  const needsTargetSelection = useGameStore(
    (state) => state.needsTargetSelection
  );
  const getTargetType = useGameStore((state) => state.getTargetType);
  const canUseSpecialAbility = useGameStore(
    (state) => state.canUseSpecialAbility
  );
  const canEnhanceCard = useGameStore((state) => state.canEnhanceCard);

  const currentPlayer = players[currentPlayerIndex];
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();

  // Clean up old action messages after they've been displayed
  useEffect(() => {
    if (animation.actionMessages.length === 0) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      const filtered = animation.actionMessages.filter(
        (msg) => now - msg.timestamp < 5000
      );
      if (filtered.length !== animation.actionMessages.length) {
        setAnimation({ actionMessages: filtered });
      }
    }, 1000);

    return () => clearInterval(cleanup);
  }, [animation.actionMessages, setAnimation]);

  // Calculate who has highest aggro (monster target)
  const getHighestAggroPlayer = () => {
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
  };

  const highestAggroPlayerId = getHighestAggroPlayer();

  // Handler for confirm button - either go to target select or roll aggro
  const handleConfirmCard = () => {
    if (needsTarget) {
      const validMonsters = monsters.filter((m) => m.isAlive);
      const validAllies = players.filter(
        (p) => p.isAlive && p.id !== currentPlayer?.id
      );

      if (targetType === "monster" && validMonsters.length === 1) {
        useGameStore.setState({ selectedTargetId: validMonsters[0].id });
        startDiceRoll();
      } else if (targetType === "ally" && validAllies.length === 1) {
        useGameStore.setState({ selectedTargetId: validAllies[0].id });
        startDiceRoll();
      } else {
        useGameStore.setState({ phase: "TARGET_SELECT" });
      }
    } else {
      startDiceRoll();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-3 overflow-hidden relative flex flex-col">
      {/* Top Right Controls */}
      <TopControls
        gameSpeed={gameSpeed}
        skipAnimations={skipAnimations}
        onToggleSpeedSettings={() => setShowSpeedSettings(!showSpeedSettings)}
        onShowHelp={() => setShowHelp(true)}
        onShowQuitConfirm={() => setShowQuitConfirm(true)}
      />

      {/* Speed Settings Dropdown */}
      <SpeedSettings
        isOpen={showSpeedSettings}
        gameSpeed={gameSpeed}
        skipAnimations={skipAnimations}
        onSpeedChange={setGameSpeed}
        onToggleSkipAnimations={toggleSkipAnimations}
      />

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Quit Confirmation Modal */}
      <QuitConfirmModal
        isOpen={showQuitConfirm}
        onCancel={() => setShowQuitConfirm(false)}
        onConfirm={() => {
          setShowQuitConfirm(false);
          setScreen("title");
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 flex-1 w-full min-h-0">
        {/* Left Panel - Players */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto pr-1 min-h-0">
          <h2 className="text-lg font-bold text-amber-400">Party</h2>
          {players.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={index === currentPlayerIndex}
              isTargeted={
                player.id === highestAggroPlayerId &&
                player.isAlive &&
                monsters.some((m) => m.isAlive)
              }
            />
          ))}
        </div>

        {/* Center Panel - Battlefield */}
        <div className="col-span-6 flex flex-col h-full min-h-0">
          {/* Round & Turn Info + Phase Progress */}
          <GameHeader
            round={round}
            maxRounds={maxRounds}
            turn={turn}
            phase={phase}
          />

          {/* Monster Area */}
          <div className="flex-1 flex items-start justify-center min-h-0 overflow-y-auto pt-4">
            <div
              className={`grid gap-4 w-full ${
                monsters.length > 1
                  ? "grid-cols-2 max-w-2xl"
                  : "grid-cols-1 max-w-md"
              }`}
            >
              {monsters.map((monster) => (
                <MonsterCard key={monster.id} monster={monster} />
              ))}
            </div>
          </div>

          {/* Hand Area */}
          <CardHand
            currentPlayer={currentPlayer}
            drawnCards={drawnCards}
            phase={phase}
            selectedCardId={selectedCardId}
            selectedTargetId={selectedTargetId}
            enhanceMode={enhanceMode}
            needsTarget={needsTarget}
            targetType={targetType}
            monsters={monsters}
            players={players}
            canUseSpecialAbility={canUseSpecialAbility()}
            canEnhanceCard={canEnhanceCard()}
            onSelectCard={selectCard}
            onSelectTarget={selectTarget}
            onConfirmCard={handleConfirmCard}
            onConfirmTarget={confirmTarget}
            onUseSpecialAbility={useSpecialAbility}
            onToggleEnhanceMode={() => setEnhanceMode(!enhanceMode)}
          />
        </div>

        {/* Right Panel - Log */}
        <BattleLog log={log} />
      </div>

      {/* Dice Roll Overlay */}
      <DiceRollOverlay
        diceRolling={animation.diceRolling}
        diceRoll={animation.diceRoll}
        currentPlayer={currentPlayer}
      />

      {/* Stacked Action Messages */}
      <ActionMessages messages={animation.actionMessages} />

      {/* Floating Damage Numbers */}
      <FloatingDamageNumbers damageNumbers={animation.damageNumbers} />
    </div>
  );
}
