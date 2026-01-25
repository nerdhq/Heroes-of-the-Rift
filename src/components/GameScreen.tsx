import { useState, useEffect, useMemo } from "react";
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
import {
  useGameUI,
  useGameEntities,
  useBattleInfo,
  useMultiplayerState,
  useGameActions,
} from "../hooks/game";
import { DEFAULT_BACKGROUND } from "../assets/backgrounds";

export function GameScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"party" | "battle" | "log">(
    "battle"
  );

  // Background music
  const { isMuted, toggleMute } = useMusic("forest", { volume: 0.25, loop: true });

  // Game hooks
  const {
    phase,
    turn,
    round,
    maxRounds,
    gameSpeed,
    skipAnimations,
    enhanceMode,
    animation,
    environment,
    setGameSpeed,
    toggleSkipAnimations,
    setEnhanceMode,
    setAnimation,
  } = useGameUI();

  const {
    players,
    monsters,
    currentPlayerIndex,
    selectedCardId,
    selectedTargetId,
    currentPlayer,
    selectCard,
    selectTarget,
    needsTarget,
    targetType,
    canEnhanceCard,
    canUseSpecialAbility,
    highestAggroPlayerId,
  } = useGameEntities();

  const { log } = useBattleInfo();

  const {
    isOnline,
    playerSelections,
    subscribeToGameState,
    unsubscribeFromGameState,
    setPlayerSelection,
    setPlayerReady,
    localPlayer,
    isLocalPlayerTurn,
    localPlayerSelection,
  } = useMultiplayerState();

  const {
    confirmTarget,
    startDiceRoll,
    useSpecialAbility,
    resetGame,
  } = useGameActions();

  const [battleLogOpenRound, setBattleLogOpenRound] = useState<number | null>(
    () => null
  );
  const showBattleLog = battleLogOpenRound === round;

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

  // Get background image from environment or use default
  const backgroundImage = useMemo(() => {
    return environment?.backgroundImage || DEFAULT_BACKGROUND;
  }, [environment]);

  return (
    <div
      className="h-screen overflow-hidden flex flex-col relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for better UI readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />

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
      <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
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
            canUseSpecialAbility={canUseSpecialAbility}
            canEnhanceCard={canEnhanceCard}
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
      <div className="lg:hidden flex-1 flex flex-col min-h-0 overflow-hidden pb-16 relative z-10">
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
                canUseSpecialAbility={canUseSpecialAbility}
                canEnhanceCard={canEnhanceCard}
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
      <div className="relative z-20">
        <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Floating Damage Numbers - React fallback (Pixi also renders them) */}
      <FloatingDamageNumbers damageNumbers={animation.damageNumbers} />
    </div>
  );
}
