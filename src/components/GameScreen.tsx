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
  EnvironmentDisplay,
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
  const environment = useGameStore((state) => state.environment);
  const userData = useGameStore((state) => state.userData);

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
  const useSpecialAbility = useGameStore((state) => state.useSpecialAbility);
  const setEnhanceMode = useGameStore((state) => state.setEnhanceMode);
  const resetGame = useGameStore((state) => state.resetGame);

  // Computed values
  const needsTargetSelection = useGameStore(
    (state) => state.needsTargetSelection
  );
  const getTargetType = useGameStore((state) => state.getTargetType);
  const canUseSpecialAbility = useGameStore(
    (state) => state.canUseSpecialAbility
  );
  const canEnhanceCard = useGameStore((state) => state.canEnhanceCard);

  // Online multiplayer state
  const isOnline = useGameStore((state) => state.isOnline);
  const localPlayerIndex = useGameStore((state) => state.localPlayerIndex);
  const playerSelections = useGameStore((state) => state.playerSelections);
  const subscribeToGameState = useGameStore((state) => state.subscribeToGameState);
  const unsubscribeFromGameState = useGameStore((state) => state.unsubscribeFromGameState);
  const setPlayerSelection = useGameStore((state) => state.setPlayerSelection);
  const setPlayerReady = useGameStore((state) => state.setPlayerReady);

  const currentPlayer = players[currentPlayerIndex];
  const localPlayer = isOnline ? players[localPlayerIndex] : currentPlayer;
  const isLocalPlayerTurn = !isOnline || localPlayerIndex === currentPlayerIndex;
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();

  // Get local player's selection state (for simultaneous play)
  const localPlayerSelection = isOnline && localPlayer
    ? playerSelections.find((sel) => sel.playerId === localPlayer.id)
    : null;

  // Subscribe to game state changes when online
  useEffect(() => {
    if (isOnline) {
      subscribeToGameState();
    }
    return () => {
      if (isOnline) {
        unsubscribeFromGameState();
      }
    };
  }, [isOnline, subscribeToGameState, unsubscribeFromGameState]);

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
      const validAllies = players.filter((p) => p.isAlive);

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

  // Auto-play card selection handler - selects card and immediately plays or goes to targeting
  const handleAutoPlayCard = (cardId: string) => {
    // First select the card
    selectCard(cardId);
    
    // Get the selected card to check if it needs targeting
    const card = drawnCards.find((c) => c.id === cardId);
    if (!card) return;
    
    // Check if this card needs a target
    const cardNeedsTarget = card.effects.some(
      (e) => e.target === "monster" || e.target === "allMonsters" || e.target === "ally"
    );
    const cardTargetType = card.effects.find(
      (e) => e.target === "monster" || e.target === "allMonsters" || e.target === "ally"
    )?.target;
    
    if (cardNeedsTarget) {
      const validMonsters = monsters.filter((m) => m.isAlive);
      const validAllies = players.filter((p) => p.isAlive);

      // For monster targeting, let user click on monster (don't auto-play)
      if (cardTargetType === "monster" && validMonsters.length > 1) {
        // Multiple monsters - wait for user to click on one
        return;
      } else if (cardTargetType === "monster" && validMonsters.length === 1) {
        // Single monster - auto-target and play
        useGameStore.setState({ selectedTargetId: validMonsters[0].id });
        startDiceRoll();
      } else if (cardTargetType === "allMonsters") {
        // All monsters - no targeting needed, auto-play
        startDiceRoll();
      } else if (cardTargetType === "ally" && validAllies.length === 1) {
        // Single ally - auto-target and play
        useGameStore.setState({ selectedTargetId: validAllies[0].id });
        startDiceRoll();
      } else if (cardTargetType === "ally") {
        // Multiple allies - go to target select
        useGameStore.setState({ phase: "TARGET_SELECT" });
      }
    } else {
      // No targeting needed - auto-play immediately
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
          resetGame();
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 flex-1 w-full min-h-0">
        {/* Left Panel - Players */}
        <div className="col-span-3 flex flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1 min-h-0">
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
        <div className="col-span-6 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Round & Turn Info + Phase Progress */}
          <GameHeader
            round={round}
            maxRounds={maxRounds}
            turn={turn}
            phase={phase}
            gold={userData.gold}
          />

          {/* Environment Display */}
          <EnvironmentDisplay environment={environment} />

          {/* Monster Area */}
          <div className="flex-1 flex items-start justify-center min-h-0 overflow-hidden pt-4">
            <div
              className={`grid gap-4 w-full ${
                monsters.length > 1
                  ? "grid-cols-2 max-w-2xl"
                  : "grid-cols-1 max-w-md"
              }`}
            >
              {monsters.map((monster) => {
                // Monster is selectable when a card requiring monster target is selected
                const isMonsterSelectable = 
                  phase === "SELECT" && 
                  !!selectedCardId && 
                  needsTarget && 
                  targetType === "monster" && 
                  monster.isAlive && 
                  isLocalPlayerTurn;
                return (
                  <MonsterCard 
                    key={monster.id} 
                    monster={monster}
                    isSelectable={isMonsterSelectable}
                    isSelected={selectedTargetId === monster.id}
                    onSelect={(monsterId) => {
                      // Auto-confirm: select target and immediately start dice roll
                      useGameStore.setState({ selectedTargetId: monsterId });
                      startDiceRoll();
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Hand Area */}
          <CardHand
            currentPlayer={currentPlayer}
            localPlayer={localPlayer}
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
            isOnline={isOnline}
            isLocalPlayerTurn={isLocalPlayerTurn}
            playerSelections={playerSelections}
            localPlayerSelection={localPlayerSelection}
            onSelectCard={isOnline ? selectCard : handleAutoPlayCard}
            onSelectTarget={selectTarget}
            onConfirmCard={handleConfirmCard}
            onConfirmTarget={confirmTarget}
            onUseSpecialAbility={useSpecialAbility}
            onToggleEnhanceMode={() => setEnhanceMode(!enhanceMode)}
            onSetPlayerSelection={setPlayerSelection}
            onSetPlayerReady={setPlayerReady}
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
