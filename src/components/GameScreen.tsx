import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { HelpModal } from "./HelpModal";
import {
  PlayerCard,
  BattleLog,
  FloatingDamageNumbers,
  GameHeader,
  SpeedSettings,
  QuitConfirmModal,
  TopControls,
  CardHand,
  EnvironmentDisplay,
  MobileTabBar,
} from "./game";
import { BattleStage } from "./game/pixi/BattleStage";
import { useMusic } from "../hooks/useMusic";

export function GameScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"party" | "battle" | "log">(
    "battle"
  );

  // Background music
  const { isMuted, toggleMute } = useMusic("forest", { volume: 0.25, loop: true });

  // Game state from store
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const monsters = useGameStore((state) => state.monsters);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const turn = useGameStore((state) => state.turn);
  const round = useGameStore((state) => state.round);
  const maxRounds = useGameStore((state) => state.maxRounds);
  const selectedCardId = useGameStore((state) => state.selectedCardId);
  const selectedTargetId = useGameStore((state) => state.selectedTargetId);
  const log = useGameStore((state) => state.log);
  const animation = useGameStore((state) => state.animation);
  const gameSpeed = useGameStore((state) => state.gameSpeed);
  const skipAnimations = useGameStore((state) => state.skipAnimations);
  const enhanceMode = useGameStore((state) => state.enhanceMode);
  const environment = useGameStore((state) => state.environment);

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
  const subscribeToGameState = useGameStore(
    (state) => state.subscribeToGameState
  );
  const unsubscribeFromGameState = useGameStore(
    (state) => state.unsubscribeFromGameState
  );
  const setPlayerSelection = useGameStore((state) => state.setPlayerSelection);
  const setPlayerReady = useGameStore((state) => state.setPlayerReady);

  const currentPlayer = players[currentPlayerIndex];
  const localPlayer = isOnline ? players[localPlayerIndex] : currentPlayer;
  const isLocalPlayerTurn =
    !isOnline || localPlayerIndex === currentPlayerIndex;
  const needsTarget = needsTargetSelection();
  const targetType = getTargetType();

  const [battleLogOpenRound, setBattleLogOpenRound] = useState<number | null>(
    () => null
  );
  const showBattleLog = battleLogOpenRound === round;

  // Get local player's selection state (for simultaneous play)
  const localPlayerSelection =
    isOnline && localPlayer
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
    const card = localPlayer?.hand.find((c) => c.id === cardId);
    if (!card) return;

    // Check if this card needs a target
    const cardNeedsTarget = card.effects.some(
      (e) =>
        e.target === "monster" ||
        e.target === "allMonsters" ||
        e.target === "ally"
    );
    const cardTargetType = card.effects.find(
      (e) =>
        e.target === "monster" ||
        e.target === "allMonsters" ||
        e.target === "ally"
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
    <div className="h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 overflow-hidden flex flex-col">
      {/* Top Controls */}
      <div className="relative z-20 p-2">
        <TopControls
          gameSpeed={gameSpeed}
          skipAnimations={skipAnimations}
          showBattleLog={showBattleLog}
          isMuted={isMuted}
          onToggleSpeedSettings={() => setShowSpeedSettings(!showSpeedSettings)}
          onShowHelp={() => setShowHelp(true)}
          onShowQuitConfirm={() => setShowQuitConfirm(true)}
          onToggleBattleLog={() =>
            setBattleLogOpenRound(showBattleLog ? null : round)
          }
          onToggleMute={toggleMute}
        />
      </div>

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

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Game Header */}
        <div className="px-4">
          <GameHeader
            round={round}
            maxRounds={maxRounds}
            turn={turn}
            phase={phase}
          />
        </div>

        {/* PixiJS Battle Canvas - Main battle area */}
        <div className="flex-1 min-h-0 w-full relative">
          <BattleStage className="absolute inset-0 w-full h-full" />
          {/* Environment overlay in top-left corner */}
          <div className="absolute top-2 left-2 z-10">
            <EnvironmentDisplay environment={environment} />
          </div>
        </div>

        {/* Card Hand - Bottom */}
        <div className="px-4 pb-3 flex-shrink-0 max-w-4xl mx-auto w-full">
          <CardHand
            currentPlayer={currentPlayer}
            localPlayer={localPlayer}
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

          {/* Battle Log - below player's hand */}
          {showBattleLog && (
            <div className="mt-3 max-h-32 overflow-hidden">
              <BattleLog log={log} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Tabbed interface */}
      <div className="lg:hidden flex-1 flex flex-col min-h-0 overflow-hidden pb-16">
        {/* Party Tab - Shows detailed PlayerCards */}
        {activeTab === "party" && (
          <div className="flex-1 overflow-y-auto px-2">
            <h2 className="text-lg font-bold text-amber-400 py-3 sticky top-0 bg-stone-900/95 z-10">
              Party
            </h2>
            <div className="flex flex-col gap-3 pb-4">
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
          </div>
        )}

        {/* Battle Tab - Pixi canvas + CardHand */}
        {activeTab === "battle" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-2">
              <GameHeader
                round={round}
                maxRounds={maxRounds}
                turn={turn}
                phase={phase}
              />
            </div>

            {/* PixiJS Battle Canvas */}
            <div className="flex-1 min-h-0 w-full relative">
              <BattleStage className="absolute inset-0 w-full h-full" />
              {/* Environment overlay in top-left corner */}
              <div className="absolute top-2 left-2 z-10">
                <EnvironmentDisplay environment={environment} />
              </div>
            </div>

            {/* Card Hand */}
            <div className="px-2 pb-2 flex-shrink-0">
              <CardHand
                currentPlayer={currentPlayer}
                localPlayer={localPlayer}
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
          </div>
        )}

        {/* Log Tab */}
        {activeTab === "log" && (
          <div className="flex-1 flex flex-col min-h-0 px-2 py-3">
            <BattleLog log={log} />
          </div>
        )}
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Damage Numbers - React fallback (Pixi also renders them) */}
      <FloatingDamageNumbers damageNumbers={animation.damageNumbers} />
    </div>
  );
}
