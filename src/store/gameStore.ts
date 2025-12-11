import { create } from "zustand";
import type {
  GameState,
  GamePhase,
  ScreenType,
  Player,
  Card,
  ClassType,
  LogEntry,
  StatusEffect,
  Monster,
  Effect,
  ActionMessage,
  GameSpeed,
  SavedParty,
} from "../types";
import { CLASS_CONFIGS } from "../data/classes";
import { getCardsByClass } from "../data/cards";
import {
  getMonstersForRound,
  ROUNDS,
  getRoundDescription,
} from "../data/monsters";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;
const rollD6 = (): number => Math.floor(Math.random() * 6) + 1;

const generateId = (): string => Math.random().toString(36).substring(2, 9);

// Format debuff type into a proper past-tense verb phrase
const formatDebuffMessage = (type: string): string => {
  const messages: Record<string, string> = {
    poison: "poisoned",
    burn: "burning",
    stun: "stunned",
    weakness: "weakened",
    ice: "frozen",
    accuracy: "blinded",
    disable: "silenced",
    bleed: "bleeding",
  };
  return messages[type] || `afflicted with ${type}`;
};

// Roll intent for all alive monsters
const rollMonsterIntents = (monsters: Monster[]): Monster[] => {
  return monsters.map((monster) => {
    if (!monster.isAlive) return monster;
    const roll = rollD6();
    const ability =
      monster.abilities.find((a) => a.roll === roll) || monster.abilities[0];
    return { ...monster, intent: ability };
  });
};

const createLogEntry = (
  turn: number,
  phase: GamePhase,
  message: string,
  type: LogEntry["type"],
  isSubEntry: boolean = false
): LogEntry => ({
  id: generateId(),
  turn,
  phase,
  message,
  type,
  timestamp: Date.now(),
  isSubEntry,
});

// ============================================
// CREATE PLAYER
// ============================================
const createPlayer = (
  id: string,
  name: string,
  classType: ClassType,
  deck: Card[]
): Player => {
  const config = CLASS_CONFIGS[classType];
  return {
    id,
    name,
    class: classType,
    hp: config.baseHp,
    maxHp: config.baseHp,
    shield: 0,
    baseAggro: 0,
    diceAggro: 0,
    buffs: [],
    debuffs: [],
    deck: [...deck],
    discard: [],
    hand: [],
    resource: 0,
    maxResource: config.maxResource,
    isAlive: true,
    isStealth: false,
    hasTaunt: false,
    isStunned: false,
    accuracyPenalty: 0,
  };
};

// ============================================
// SHUFFLE ARRAY
// ============================================
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================
// INITIAL STATE
// ============================================
const initialState: GameState = {
  currentScreen: "title",
  phase: "DRAW",
  players: [],
  monsters: [],
  currentPlayerIndex: 0,
  turn: 1,
  level: 1,
  round: 1,
  maxRounds: 6,
  selectedCardId: null,
  selectedTargetId: null,
  drawnCards: [],
  log: [],
  selectedClasses: [],
  heroNames: [],
  deckBuildingPlayerIndex: 0,
  availableCards: [],
  selectedDeckCards: [],
  rewardPlayerIndex: 0,
  rewardCards: [],
  selectedRewardCardId: null,
  animation: {
    isAnimating: false,
    diceRoll: null,
    diceRolling: false,
    actionMessages: [],
    damageNumbers: [],
  },
  // Speed settings
  gameSpeed: "normal",
  skipAnimations: false,
  // Saved party for quick restart
  savedParty: null,
  // Enhancement mode
  enhanceMode: false,
};

// ============================================
// GAME STORE
// ============================================
interface GameActions {
  // Screen navigation
  setScreen: (screen: ScreenType) => void;

  // Class selection
  toggleClassSelection: (classType: ClassType) => void;
  setHeroName: (index: number, name: string) => void;
  confirmClassSelection: () => void;

  // Deck building
  toggleCardSelection: (cardId: string) => void;
  confirmDeck: () => void;

  // Game flow
  startGame: () => void;
  startRound: () => void;
  nextRound: () => void;
  drawCards: () => void;
  selectCard: (cardId: string) => void;
  selectTarget: (targetId: string) => void;
  confirmTarget: () => void;
  rollAggro: () => void;
  playCard: () => void;
  monsterAct: () => void;
  resolveDebuffs: () => void;
  endTurn: () => void;
  nextPhase: () => void;

  // Card rewards
  startRewardPhase: () => void;
  selectRewardCard: (cardId: string) => void;
  confirmRewardCard: () => void;
  skipReward: () => void;

  // Animation
  startDiceRoll: () => void;
  setAnimation: (animation: Partial<GameState["animation"]>) => void;
  addActionMessage: (text: string, type: ActionMessage["type"]) => void;
  clearActionMessages: () => void;
  addDamageNumber: (
    targetId: string,
    value: number,
    type: "damage" | "heal" | "shield"
  ) => void;

  // Resources
  addResource: (playerId: string, amount: number) => void;
  spendResource: (playerId: string, amount: number) => boolean;
  regenerateResources: () => void;

  // Special abilities & enhancement
  useSpecialAbility: () => void;
  setEnhanceMode: (enabled: boolean) => void;
  canUseSpecialAbility: () => boolean;
  canEnhanceCard: () => boolean;

  // Utility
  addLog: (message: string, type: LogEntry["type"]) => void;
  resetGame: () => void;
  needsTargetSelection: () => boolean;
  getTargetType: () => "ally" | "monster" | null;

  // Speed settings
  setGameSpeed: (speed: GameSpeed) => void;
  toggleSkipAnimations: () => void;
  getDelay: (baseMs: number) => number;

  // Quick restart
  playAgainSameParty: () => void;
  playAgainNewParty: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  // ============================================
  // SCREEN NAVIGATION
  // ============================================
  setScreen: (screen) => set({ currentScreen: screen }),

  // ============================================
  // CLASS SELECTION
  // ============================================
  toggleClassSelection: (classType) => {
    const { selectedClasses, heroNames } = get();
    if (selectedClasses.includes(classType)) {
      const idx = selectedClasses.indexOf(classType);
      const newNames = [...heroNames];
      newNames.splice(idx, 1);
      set({
        selectedClasses: selectedClasses.filter((c) => c !== classType),
        heroNames: newNames,
      });
    } else if (selectedClasses.length < 5) {
      set({
        selectedClasses: [...selectedClasses, classType],
        heroNames: [...heroNames, `Hero ${selectedClasses.length + 1}`],
      });
    }
  },

  setHeroName: (index, name) => {
    const { heroNames } = get();
    const newNames = [...heroNames];
    newNames[index] = name;
    set({ heroNames: newNames });
  },

  confirmClassSelection: () => {
    const { selectedClasses } = get();
    if (selectedClasses.length === 0) return;

    // Move to deck building for first player
    const firstClass = selectedClasses[0];
    const availableCards = getCardsByClass(firstClass);

    set({
      currentScreen: "deckBuilder",
      deckBuildingPlayerIndex: 0,
      availableCards,
      selectedDeckCards: [],
    });
  },

  // ============================================
  // DECK BUILDING
  // ============================================
  toggleCardSelection: (cardId) => {
    const { selectedDeckCards } = get();
    if (selectedDeckCards.includes(cardId)) {
      set({
        selectedDeckCards: selectedDeckCards.filter((id) => id !== cardId),
      });
    } else if (selectedDeckCards.length < 5) {
      set({ selectedDeckCards: [...selectedDeckCards, cardId] });
    }
  },

  confirmDeck: () => {
    const {
      selectedClasses,
      heroNames,
      deckBuildingPlayerIndex,
      availableCards,
      selectedDeckCards,
      players,
    } = get();

    if (selectedDeckCards.length !== 5) return;

    // Create player with selected deck - create unique instances of cards
    const classType = selectedClasses[deckBuildingPlayerIndex];
    const heroName =
      heroNames[deckBuildingPlayerIndex] ||
      `Hero ${deckBuildingPlayerIndex + 1}`;
    const deck = availableCards
      .filter((card) => selectedDeckCards.includes(card.id))
      .map((card) => ({
        ...card,
        id: `${card.id}-${deckBuildingPlayerIndex}-${generateId()}`, // Create unique ID for each card instance
      }));
    const newPlayer = createPlayer(
      `player-${deckBuildingPlayerIndex}`,
      heroName,
      classType,
      deck
    );

    const updatedPlayers = [...players, newPlayer];

    // Check if more players need to build decks
    const nextIndex = deckBuildingPlayerIndex + 1;
    if (nextIndex < selectedClasses.length) {
      const nextClass = selectedClasses[nextIndex];
      const nextAvailableCards = getCardsByClass(nextClass);
      set({
        players: updatedPlayers,
        deckBuildingPlayerIndex: nextIndex,
        availableCards: nextAvailableCards,
        selectedDeckCards: [],
      });
    } else {
      // All players ready, start game
      set({
        players: updatedPlayers,
        currentScreen: "game",
      });
      get().startGame();
    }
  },

  // ============================================
  // GAME FLOW
  // ============================================
  startGame: () => {
    const { players, selectedClasses, heroNames } = get();

    // Save party composition for quick restart
    const savedParty: SavedParty = {
      classes: selectedClasses,
      names: heroNames,
    };

    // Shuffle all player decks
    const shuffledPlayers = players.map((player) => ({
      ...player,
      deck: shuffleArray(player.deck),
    }));

    set({
      players: shuffledPlayers,
      round: 1,
      turn: 1,
      savedParty,
    });

    // Start first round
    get().startRound();
  },

  startRound: () => {
    const { round, players } = get();
    const roundConfig = ROUNDS.find((r) => r.round === round);
    const rawMonsters = getMonstersForRound(round);
    // Roll initial intents for monsters
    const monsters = rollMonsterIntents(rawMonsters);

    // Reset player shields between rounds (aggro persists during battle)
    const refreshedPlayers = players.map((player) => ({
      ...player,
      shield: 0,
    }));

    // Find first alive player
    const firstAlivePlayerIndex = refreshedPlayers.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // No alive players - defeat
      set({ currentScreen: "defeat" });
      return;
    }

    set({
      players: refreshedPlayers,
      monsters,
      phase: "DRAW",
      currentPlayerIndex: firstAlivePlayerIndex,
      log: [
        ...get().log,
        createLogEntry(get().turn, "DRAW", `────────────────`, "info"),
        createLogEntry(
          get().turn,
          "DRAW",
          `ROUND ${round}: ${roundConfig?.name || "Unknown"}`,
          "info"
        ),
        createLogEntry(get().turn, "DRAW", getRoundDescription(round), "info"),
        createLogEntry(
          get().turn,
          "DRAW",
          `${monsters.map((m) => m.name).join(" & ")} appear${
            monsters.length > 1 ? "" : "s"
          }!`,
          "info"
        ),
      ],
    });

    // Auto-draw cards for first alive player
    get().drawCards();
  },

  nextRound: () => {
    const { round, maxRounds, players } = get();

    if (round >= maxRounds) {
      // Game complete - victory!
      set({ currentScreen: "victory" });
      return;
    }

    // Heal players between rounds (50% of missing HP) and reset aggro
    const healedPlayers = players.map((player) => {
      if (!player.isAlive) return player;
      const missingHp = player.maxHp - player.hp;
      const healAmount = Math.floor(missingHp * 0.5);
      return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + healAmount),
        // Reset aggro when all enemies are defeated
        baseAggro: 0,
        diceAggro: 0,
        // Reshuffle discard into deck
        deck: shuffleArray([...player.deck, ...player.discard]),
        discard: [],
        hand: [],
      };
    });

    set({
      round: round + 1,
      turn: get().turn + 1,
      players: healedPlayers,
    });

    get().startRound();
  },

  drawCards: () => {
    const { players, currentPlayerIndex, turn, phase } = get();
    const player = players[currentPlayerIndex];

    // Skip dead players
    if (!player.isAlive) {
      // Find next alive player
      const nextAlivePlayer = players.findIndex(
        (p, i) => i > currentPlayerIndex && p.isAlive
      );

      if (nextAlivePlayer !== -1) {
        // More players to act - go to next player's draw phase
        set({
          currentPlayerIndex: nextAlivePlayer,
        });
        get().drawCards();
      } else {
        // All players have acted (or are dead) - move to monster turn
        set({ phase: "MONSTER_ACTION" });
        get().monsterAct();
      }
      return;
    }

    // Draw 2 cards
    let deck = [...player.deck];
    let discard = [...player.discard];
    const hand: Card[] = [];

    for (let i = 0; i < 2; i++) {
      if (deck.length === 0 && discard.length > 0) {
        // Shuffle discard into deck
        deck = shuffleArray(discard);
        discard = [];
      }
      if (deck.length > 0) {
        hand.push(deck.pop()!);
      }
    }

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      deck,
      discard,
      hand,
    };

    set({
      players: updatedPlayers,
      drawnCards: hand,
      phase: "SELECT",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          phase,
          `${player.name} draws ${hand.map((c) => c.name).join(", ")}`,
          "info"
        ),
      ],
    });
  },

  selectCard: (cardId) => {
    const { phase } = get();
    // Allow re-selection during SELECT phase, but not after AGGRO
    if (phase === "SELECT") {
      set({ selectedCardId: cardId, selectedTargetId: null });
    }
  },

  selectTarget: (targetId) => {
    const { phase } = get();
    if (phase === "TARGET_SELECT") {
      set({ selectedTargetId: targetId });
    }
  },

  confirmTarget: () => {
    const { selectedTargetId } = get();
    if (!selectedTargetId) return;
    // Move to aggro phase after target is confirmed - use dice roll animation
    get().startDiceRoll();
  },

  needsTargetSelection: () => {
    const { selectedCardId, drawnCards } = get();
    if (!selectedCardId) return false;
    const card = drawnCards.find((c) => c.id === selectedCardId);
    if (!card) return false;

    // Check if any effect needs single target selection
    return card.effects.some(
      (e) => e.target === "ally" || e.target === "monster"
    );
  },

  getTargetType: () => {
    const { selectedCardId, drawnCards } = get();
    if (!selectedCardId) return null;
    const card = drawnCards.find((c) => c.id === selectedCardId);
    if (!card) return null;

    // Return the first single-target type found
    for (const effect of card.effects) {
      if (effect.target === "ally") return "ally";
      if (effect.target === "monster") return "monster";
    }
    return null;
  },

  rollAggro: () => {
    const { players, currentPlayerIndex, selectedCardId, drawnCards, turn } =
      get();
    const player = players[currentPlayerIndex];
    const selectedCard = drawnCards.find((c) => c.id === selectedCardId);

    if (!selectedCard) return;

    const diceAggro = rollD20();
    const cardAggro = selectedCard.aggro;
    const newBaseAggro = player.baseAggro + cardAggro; // Accumulate base aggro
    const totalAggro = newBaseAggro + diceAggro;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      baseAggro: newBaseAggro,
      diceAggro,
    };

    set({
      players: updatedPlayers,
      phase: "PLAYER_ACTION",
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "AGGRO",
          `${player.name} rolls D20: ${diceAggro} + ${newBaseAggro} base = ${totalAggro} aggro`,
          "roll"
        ),
      ],
    });

    // Automatically play the card after rolling aggro
    get().playCard();
  },

  playCard: async () => {
    const {
      players,
      monsters,
      currentPlayerIndex,
      selectedCardId,
      selectedTargetId,
      drawnCards,
      turn,
      enhanceMode,
    } = get();
    const player = players[currentPlayerIndex];
    const config = CLASS_CONFIGS[player.class];

    // Helper to delay with speed settings
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Check if stunned
    if (player.isStunned) {
      get().addActionMessage(`${player.name} is stunned!`, "debuff");
      set({
        log: [
          ...get().log,
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${player.name} is stunned and cannot act!`,
            "debuff"
          ),
        ],
        enhanceMode: false,
      });
      await delay(1500);
      get().nextPhase();
      return;
    }

    const selectedCard = drawnCards.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    // Check if enhanced and spend resources
    const isEnhanced = enhanceMode && player.resource >= player.maxResource;
    let updatedPlayers = [...players];

    if (isEnhanced) {
      updatedPlayers[currentPlayerIndex] = {
        ...player,
        resource: 0,
      };
    }

    // Show card being played
    const enhanceText = isEnhanced ? " (ENHANCED!)" : "";
    set({
      phase: "PLAYER_ACTION",
      enhanceMode: false,
      players: updatedPlayers,
    });
    get().addActionMessage(
      `${player.name} plays ${selectedCard.name}!${enhanceText}`,
      "action"
    );
    set({
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} plays ${selectedCard.name}!${enhanceText}`,
          "action"
        ),
      ],
    });
    await delay(1200);
    let updatedMonsters = [...monsters];
    const logs: LogEntry[] = [];

    // Apply each effect and track damage/healing for damage numbers
    let totalDamageDealt = 0;
    let totalHealing = 0;
    const damagedMonsterIds: string[] = [];
    const healedPlayerIds: string[] = [];

    for (const effect of selectedCard.effects) {
      // Track monster HP before effect
      const monsterHpBefore = new Map(updatedMonsters.map((m) => [m.id, m.hp]));
      const playerHpBefore = new Map(updatedPlayers.map((p) => [p.id, p.hp]));

      // Apply enhancement bonuses if enhanced
      let enhancedEffect = effect;
      if (isEnhanced && effect.value) {
        const bonus =
          effect.type === "damage"
            ? config.enhanceBonus.damageBonus
            : effect.type === "heal"
            ? config.enhanceBonus.healBonus
            : effect.type === "shield"
            ? config.enhanceBonus.shieldBonus
            : 0;
        if (bonus > 0) {
          enhancedEffect = { ...effect, value: effect.value + bonus };
        }
      }

      const result = applyEffect(
        enhancedEffect,
        player,
        updatedPlayers,
        updatedMonsters,
        turn,
        selectedTargetId
      );
      updatedPlayers = result.players;
      updatedMonsters = result.monsters;
      logs.push(...result.logs);

      // Ensure resource stays at 0 if enhanced
      if (isEnhanced) {
        updatedPlayers[currentPlayerIndex] = {
          ...updatedPlayers[currentPlayerIndex],
          resource: 0,
        };
      }

      // Calculate damage dealt for damage numbers
      for (const monster of updatedMonsters) {
        const hpBefore = monsterHpBefore.get(monster.id) || monster.hp;
        const damage = hpBefore - monster.hp;
        if (damage > 0) {
          totalDamageDealt += damage;
          damagedMonsterIds.push(monster.id);
          get().addDamageNumber(monster.id, damage, "damage");
        }
      }

      // Calculate healing for damage numbers
      for (const p of updatedPlayers) {
        const hpBefore = playerHpBefore.get(p.id) || p.hp;
        const healing = p.hp - hpBefore;
        if (healing > 0) {
          totalHealing += healing;
          healedPlayerIds.push(p.id);
          get().addDamageNumber(p.id, healing, "heal");
        }
      }
    }

    // Resource gains based on class and actions
    const currentPlayer = updatedPlayers[currentPlayerIndex];
    let resourceGain = 0;
    switch (currentPlayer.class) {
      case "warrior":
        // Warrior gains Rage from dealing damage
        if (totalDamageDealt > 0)
          resourceGain = Math.min(2, Math.ceil(totalDamageDealt / 10));
        break;
      case "rogue":
        // Rogue gains 1 Combo per card played
        resourceGain = 1;
        break;
      case "paladin":
        // Paladin gains Faith from healing allies
        if (totalHealing > 0) resourceGain = 2;
        break;
      case "priest":
        // Priest gains Devotion from healing
        if (totalHealing > 0) resourceGain = 2;
        break;
      case "bard":
        // Bard gains Melody from buffing (check if card has buff effects)
        if (
          selectedCard.effects.some((e) =>
            ["strength", "shield", "block"].includes(e.type)
          )
        ) {
          resourceGain = 1;
        }
        break;
      case "archer":
        // Archer gains Focus passively (handled in regenerateResources)
        resourceGain = 1;
        break;
      default:
        break;
    }

    // Only gain resources if not enhanced (we just spent them all)
    if (resourceGain > 0 && !isEnhanced) {
      updatedPlayers[currentPlayerIndex] = {
        ...updatedPlayers[currentPlayerIndex],
        resource: Math.min(
          updatedPlayers[currentPlayerIndex].resource + resourceGain,
          updatedPlayers[currentPlayerIndex].maxResource
        ),
      };
    }

    // Move played card to discard, other card back to deck
    const playedCard = drawnCards.find((c) => c.id === selectedCardId)!;
    const otherCard = drawnCards.find((c) => c.id !== selectedCardId);

    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      hand: [],
      discard: [...updatedPlayers[currentPlayerIndex].discard, playedCard],
      deck: otherCard
        ? [...updatedPlayers[currentPlayerIndex].deck, otherCard]
        : updatedPlayers[currentPlayerIndex].deck,
    };

    // Show effects
    for (const logEntry of logs) {
      const msgType =
        logEntry.type === "damage"
          ? "damage"
          : logEntry.type === "heal"
          ? "heal"
          : "action";
      get().addActionMessage(
        logEntry.message,
        msgType as ActionMessage["type"]
      );
      set({ log: [...get().log, logEntry] });
      await delay(1000);
    }

    set({
      players: updatedPlayers,
      monsters: updatedMonsters,
      selectedCardId: null,
      drawnCards: [],
    });

    // Check for round victory
    if (updatedMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    get().nextPhase();
  },

  monsterAct: async () => {
    const { players, monsters, turn } = get();
    const updatedPlayers = [...players];

    // Helper to delay with speed settings
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    for (const monster of monsters) {
      if (!monster.isAlive) continue;

      // Check if monster is stunned
      const isStunned = monster.debuffs.some((d) => d.type === "stun");
      if (isStunned) {
        get().addActionMessage(`${monster.name} is stunned!`, "debuff");
        set({
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${monster.name} is stunned and cannot act!`,
              "debuff"
            ),
          ],
        });
        await delay(1500);
        continue;
      }

      // Fast elite modifier - acts twice per turn
      const actCount = monster.eliteModifier === "fast" ? 2 : 1;

      for (let actionNum = 0; actionNum < actCount; actionNum++) {
        // Re-check if monster is still alive (might have died from counter-attack)
        const currentMonster = get().monsters.find((m) => m.id === monster.id);
        if (!currentMonster?.isAlive) break;

        // Show "Fast!" message on second action
        if (actionNum === 1) {
          get().addActionMessage(`${monster.name} acts again! ⚡`, "roll");
          await delay(800);
        }

        // Use the pre-rolled intent, or roll if not available
        const ability =
          monster.intent ||
          monster.abilities.find((a) => a.roll === rollD6()) ||
          monster.abilities[0];

        // Show monster preparing to attack
        get().addActionMessage(`${monster.name} uses ${ability.name}!`, "roll");
        set({
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${monster.name} uses ${ability.name}!`,
              "roll"
            ),
          ],
        });
        await delay(1500);

        // Find target(s)
        const alivePlayers = updatedPlayers.filter((p) => p.isAlive);
        if (alivePlayers.length === 0) continue;

        // Check for taunt
        const tauntPlayer = alivePlayers.find((p) => p.hasTaunt);

        let targets: Player[] = [];
        if (ability.target === "all") {
          targets = alivePlayers.filter((p) => !p.isStealth);
        } else if (ability.target === "random") {
          const validTargets = alivePlayers.filter((p) => !p.isStealth);
          if (validTargets.length > 0) {
            targets = [
              validTargets[Math.floor(Math.random() * validTargets.length)],
            ];
          }
        } else {
          // Single target - highest aggro or taunt
          if (tauntPlayer && !tauntPlayer.isStealth) {
            targets = [tauntPlayer];
          } else {
            const validTargets = alivePlayers.filter((p) => !p.isStealth);
            if (validTargets.length > 0) {
              // Sort by total aggro (baseAggro + diceAggro)
              validTargets.sort(
                (a, b) =>
                  b.baseAggro + b.diceAggro - (a.baseAggro + a.diceAggro)
              );
              targets = [validTargets[0]];
            }
          }
        }

        // Apply damage
        if (ability.damage > 0) {
          for (const target of targets) {
            const playerIndex = updatedPlayers.findIndex(
              (p) => p.id === target.id
            );
            if (playerIndex === -1) continue;

            let damage = ability.damage;

            // Apply enraged elite modifier (+50% damage)
            if (monster.eliteModifier === "enraged") {
              damage = Math.floor(damage * 1.5);
            }

            // Apply weakness debuff on monster (reduces damage)
            const weakness = monster.debuffs.find((d) => d.type === "weakness");
            if (weakness) {
              damage = Math.max(0, damage - weakness.value);
            }

            // Apply shield first
            let remainingDamage = damage;
            let newShield = updatedPlayers[playerIndex].shield;
            if (newShield > 0) {
              if (newShield >= remainingDamage) {
                newShield -= remainingDamage;
                remainingDamage = 0;
              } else {
                remainingDamage -= newShield;
                newShield = 0;
              }
            }

            const newHp = Math.max(
              0,
              updatedPlayers[playerIndex].hp - remainingDamage
            );
            const isAlive = newHp > 0;

            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              hp: newHp,
              shield: newShield,
              isAlive,
            };

            // Add floating damage number
            get().addDamageNumber(target.id, damage, "damage");

            // Resource gains from taking damage
            const damagedPlayer = updatedPlayers[playerIndex];
            if (damagedPlayer.class === "warrior" && damage > 0) {
              // Warrior gains Rage from taking damage
              const rageGain = Math.min(2, Math.ceil(damage / 15));
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                resource: Math.min(
                  updatedPlayers[playerIndex].resource + rageGain,
                  updatedPlayers[playerIndex].maxResource
                ),
              };
            } else if (damagedPlayer.class === "archer" && damage > 0) {
              // Archer loses Focus when hit
              updatedPlayers[playerIndex] = {
                ...updatedPlayers[playerIndex],
                resource: Math.max(0, updatedPlayers[playerIndex].resource - 1),
              };
            }

            // Update state and show damage
            const damageMsg = `${target.name} takes ${damage} damage!${
              !isAlive ? " 💀" : ""
            }`;
            get().addActionMessage(damageMsg, "damage");
            set({
              players: updatedPlayers,
              log: [
                ...get().log,
                createLogEntry(
                  turn,
                  "MONSTER_ACTION",
                  `${monster.name} deals ${damage} damage to ${target.name}!${
                    !isAlive ? ` ${target.name} falls!` : ""
                  }`,
                  "damage"
                ),
              ],
            });
            await delay(1200);
          }
        } else if (ability.damage < 0) {
          // Monster heals itself
          const monsterIndex = monsters.findIndex((m) => m.id === monster.id);
          const healAmount = Math.abs(ability.damage);
          const newHp = Math.min(monster.maxHp, monster.hp + healAmount);
          const updatedMonster = { ...monster, hp: newHp };
          const updatedMonstersArray = [...monsters];
          updatedMonstersArray[monsterIndex] = updatedMonster;

          // Add floating heal number
          get().addDamageNumber(monster.id, healAmount, "heal");

          get().addActionMessage(
            `${monster.name} heals for ${healAmount}!`,
            "heal"
          );
          set({
            monsters: updatedMonstersArray,
            log: [
              ...get().log,
              createLogEntry(
                turn,
                "MONSTER_ACTION",
                `${monster.name} heals for ${healAmount}!`,
                "heal"
              ),
            ],
          });
          await delay(1200);
        }

        // Apply debuff
        if (ability.debuff) {
          for (const target of targets) {
            const playerIndex = updatedPlayers.findIndex(
              (p) => p.id === target.id
            );
            if (playerIndex === -1) continue;

            const newDebuff: StatusEffect = {
              type: ability.debuff.type,
              value: ability.debuff.value,
              duration: ability.debuff.duration,
              source: monster.name,
            };

            updatedPlayers[playerIndex] = {
              ...updatedPlayers[playerIndex],
              debuffs: [...updatedPlayers[playerIndex].debuffs, newDebuff],
              isStunned:
                ability.debuff.type === "stun" ||
                updatedPlayers[playerIndex].isStunned,
              accuracyPenalty:
                ability.debuff.type === "accuracy"
                  ? updatedPlayers[playerIndex].accuracyPenalty +
                    ability.debuff.value
                  : updatedPlayers[playerIndex].accuracyPenalty,
            };

            get().addActionMessage(
              `${target.name} is ${formatDebuffMessage(ability.debuff!.type)}!`,
              "debuff"
            );
            set({
              players: updatedPlayers,
              log: [
                ...get().log,
                createLogEntry(
                  turn,
                  "MONSTER_ACTION",
                  `${target.name} is afflicted with ${ability.debuff!.type}!`,
                  "debuff"
                ),
              ],
            });
            await delay(1000);
          }
        }
      } // End of actCount loop for fast modifier

      // Small pause between monsters
      await delay(500);
    }

    // Final state update
    set({ players: updatedPlayers });

    // Check for defeat
    if (updatedPlayers.every((p) => !p.isAlive)) {
      set({ currentScreen: "defeat" });
      return;
    }

    get().nextPhase();
  },

  resolveDebuffs: () => {
    const { players, monsters, turn } = get();
    const updatedPlayers = [...players];
    const updatedMonsters = [...monsters];
    const logs: LogEntry[] = [];

    // Resolve player debuffs (DOTs)
    for (let i = 0; i < updatedPlayers.length; i++) {
      const player = updatedPlayers[i];
      if (!player.isAlive) continue;

      let totalDotDamage = 0;
      const dotSources: string[] = [];

      for (const debuff of player.debuffs) {
        if (debuff.type === "poison") {
          totalDotDamage += debuff.value;
          dotSources.push(`poison (${debuff.value})`);
        } else if (debuff.type === "burn") {
          totalDotDamage += debuff.value;
          dotSources.push(`burn (${debuff.value})`);
        } else if (debuff.type === "ice") {
          totalDotDamage += debuff.value;
          dotSources.push(`frost (${debuff.value})`);
        }
      }

      if (totalDotDamage > 0) {
        const newHp = Math.max(0, player.hp - totalDotDamage);
        const isAlive = newHp > 0;

        updatedPlayers[i] = {
          ...player,
          hp: newHp,
          isAlive,
        };

        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${
              player.name
            } takes ${totalDotDamage} damage from ${dotSources.join(", ")}!${
              !isAlive ? ` ${player.name} falls!` : ""
            }`,
            "damage"
          )
        );
      }

      // Tick down debuff durations
      const updatedDebuffs = player.debuffs
        .map((d) => ({ ...d, duration: d.duration - 1 }))
        .filter((d) => d.duration > 0);

      // Update status flags
      const hasStun = updatedDebuffs.some((d) => d.type === "stun");
      const hasStealth = updatedPlayers[i].buffs.some(
        (b) => b.type === "stealth"
      );
      const hasTaunt = updatedPlayers[i].buffs.some((b) => b.type === "taunt");
      const accuracyPenalty = updatedDebuffs
        .filter((d) => d.type === "accuracy")
        .reduce((sum, d) => sum + d.value, 0);

      // Tick down buff durations
      const updatedBuffs = updatedPlayers[i].buffs
        .map((b) => ({ ...b, duration: b.duration - 1 }))
        .filter((b) => b.duration > 0);

      updatedPlayers[i] = {
        ...updatedPlayers[i],
        debuffs: updatedDebuffs,
        buffs: updatedBuffs,
        isStunned: hasStun,
        isStealth: hasStealth,
        hasTaunt: hasTaunt,
        accuracyPenalty,
      };
    }

    // Resolve monster debuffs (DOTs) and elite modifiers
    for (let i = 0; i < updatedMonsters.length; i++) {
      const monster = updatedMonsters[i];
      if (!monster.isAlive) continue;

      let totalDotDamage = 0;
      const dotSources: string[] = [];

      for (const debuff of monster.debuffs) {
        if (debuff.type === "poison") {
          totalDotDamage += debuff.value;
          dotSources.push(`poison (${debuff.value})`);
        } else if (debuff.type === "burn") {
          totalDotDamage += debuff.value;
          dotSources.push(`burn (${debuff.value})`);
        } else if (debuff.type === "ice") {
          totalDotDamage += debuff.value;
          dotSources.push(`frost (${debuff.value})`);
        }
      }

      if (totalDotDamage > 0) {
        const newHp = Math.max(0, monster.hp - totalDotDamage);
        const isAlive = newHp > 0;

        updatedMonsters[i] = {
          ...monster,
          hp: newHp,
          isAlive,
        };

        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${
              monster.name
            } takes ${totalDotDamage} damage from ${dotSources.join(", ")}!${
              !isAlive ? ` ${monster.name} is defeated!` : ""
            }`,
            "damage"
          )
        );
      }

      // Regenerating elite modifier - heal 10 HP per turn
      if (monster.eliteModifier === "regenerating" && monster.isAlive) {
        const healAmount = 10;
        const newHp = Math.min(
          monster.maxHp,
          updatedMonsters[i].hp + healAmount
        );
        updatedMonsters[i] = {
          ...updatedMonsters[i],
          hp: newHp,
        };
        logs.push(
          createLogEntry(
            turn,
            "DEBUFF_RESOLUTION",
            `${monster.name} regenerates ${healAmount} HP! 💚`,
            "heal"
          )
        );
      }

      // Shielded elite modifier - regenerate shield each turn
      if (monster.eliteModifier === "shielded" && monster.isAlive) {
        const shieldRegen = Math.floor(monster.maxHp * 0.1); // 10% of max HP
        const newShield = Math.min(
          Math.floor(monster.maxHp * 0.2), // Cap at 20% of max HP
          updatedMonsters[i].shield + shieldRegen
        );
        if (newShield > updatedMonsters[i].shield) {
          updatedMonsters[i] = {
            ...updatedMonsters[i],
            shield: newShield,
          };
          logs.push(
            createLogEntry(
              turn,
              "DEBUFF_RESOLUTION",
              `${monster.name}'s shield regenerates! 🔰`,
              "buff"
            )
          );
        }
      }

      // Tick down debuff durations
      const updatedDebuffs = monster.debuffs
        .map((d) => ({ ...d, duration: d.duration - 1 }))
        .filter((d) => d.duration > 0);

      updatedMonsters[i] = {
        ...updatedMonsters[i],
        debuffs: updatedDebuffs,
      };
    }

    set({
      players: updatedPlayers,
      monsters: updatedMonsters,
      log: [...get().log, ...logs],
    });

    // Check for round victory/defeat
    if (updatedMonsters.every((m) => !m.isAlive)) {
      // Go to card reward phase before next round
      get().startRewardPhase();
      return;
    }
    if (updatedPlayers.every((p) => !p.isAlive)) {
      set({ currentScreen: "defeat" });
      return;
    }

    get().nextPhase();
  },

  endTurn: () => {
    const { turn, players, monsters } = get();

    // Find first alive player for new turn
    const firstAlivePlayerIndex = players.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // No alive players - defeat
      set({ currentScreen: "defeat" });
      return;
    }

    // Roll new intents for monsters at end of turn
    const updatedMonsters = rollMonsterIntents(monsters);

    // Regenerate resources at start of new turn
    get().regenerateResources();

    // Start new turn - all players act again
    set({
      currentPlayerIndex: firstAlivePlayerIndex,
      turn: turn + 1,
      phase: "DRAW",
      monsters: updatedMonsters,
      log: [
        ...get().log,
        createLogEntry(turn + 1, "DRAW", `--- Turn ${turn + 1} ---`, "info"),
      ],
    });
    get().drawCards();
  },

  nextPhase: () => {
    const { phase, players, currentPlayerIndex } = get();

    switch (phase) {
      case "DRAW":
        // Handled by drawCards
        break;
      case "SELECT":
        // Waiting for card selection
        break;
      case "TARGET_SELECT":
        // Waiting for target selection
        break;
      case "AGGRO":
        // Handled by rollAggro
        break;
      case "PLAYER_ACTION": {
        // Check if more players need to act this turn
        const nextAlivePlayer = players.findIndex(
          (p, i) => i > currentPlayerIndex && p.isAlive
        );

        if (nextAlivePlayer !== -1) {
          // More players to act - go to next player's draw phase
          set({
            currentPlayerIndex: nextAlivePlayer,
            phase: "DRAW",
          });
          get().drawCards();
        } else {
          // All players have acted - monster turn
          set({ phase: "MONSTER_ACTION" });
          get().monsterAct();
        }
        break;
      }
      case "MONSTER_ACTION":
        set({ phase: "DEBUFF_RESOLUTION" });
        get().resolveDebuffs();
        break;
      case "DEBUFF_RESOLUTION":
        set({ phase: "END_TURN" });
        get().endTurn();
        break;
      case "END_TURN":
        // Handled by endTurn
        break;
    }
  },

  // ============================================
  // CARD REWARDS
  // ============================================
  startRewardPhase: () => {
    const { players, selectedClasses } = get();

    // Get cards that weren't selected during deck building for the first player
    const firstAlivePlayer = players.find((p) => p.isAlive);
    if (!firstAlivePlayer) {
      get().nextRound();
      return;
    }

    const playerIndex = players.findIndex((p) => p.id === firstAlivePlayer.id);
    const playerClass = selectedClasses[playerIndex];
    const allClassCards = getCardsByClass(playerClass);

    // Get cards not in player's deck or discard
    const playerCardIds = new Set([
      ...firstAlivePlayer.deck.map((c) => c.id),
      ...firstAlivePlayer.discard.map((c) => c.id),
      ...firstAlivePlayer.hand.map((c) => c.id),
    ]);

    const availableRewards = allClassCards
      .filter((c: Card) => !playerCardIds.has(c.id))
      .slice(0, 3); // Show up to 3 reward options

    set({
      currentScreen: "cardReward",
      rewardPlayerIndex: playerIndex,
      rewardCards: availableRewards,
      selectedRewardCardId: null,
    });
  },

  selectRewardCard: (cardId) => {
    set({ selectedRewardCardId: cardId });
  },

  confirmRewardCard: () => {
    const {
      players,
      rewardPlayerIndex,
      rewardCards,
      selectedRewardCardId,
      selectedClasses,
    } = get();

    if (!selectedRewardCardId) return;

    const selectedCard = rewardCards.find((c) => c.id === selectedRewardCardId);
    if (!selectedCard) return;

    // Add card to player's deck
    const updatedPlayers = [...players];
    updatedPlayers[rewardPlayerIndex] = {
      ...updatedPlayers[rewardPlayerIndex],
      deck: [...updatedPlayers[rewardPlayerIndex].deck, selectedCard],
    };

    // Move to next alive player or continue game
    const nextAliveIndex = players.findIndex(
      (p, i) => i > rewardPlayerIndex && p.isAlive
    );

    if (nextAliveIndex !== -1) {
      // More players need to pick rewards
      const nextPlayerClass = selectedClasses[nextAliveIndex];
      const allClassCards = getCardsByClass(nextPlayerClass);
      const nextPlayer = updatedPlayers[nextAliveIndex];

      const playerCardIds = new Set([
        ...nextPlayer.deck.map((c) => c.id),
        ...nextPlayer.discard.map((c) => c.id),
        ...nextPlayer.hand.map((c) => c.id),
      ]);

      const availableRewards = allClassCards
        .filter((c: Card) => !playerCardIds.has(c.id))
        .slice(0, 3);

      set({
        players: updatedPlayers,
        rewardPlayerIndex: nextAliveIndex,
        rewardCards: availableRewards,
        selectedRewardCardId: null,
      });
    } else {
      // All players have picked, continue to next round
      set({ players: updatedPlayers });
      get().nextRound();
    }
  },

  skipReward: () => {
    const { players, rewardPlayerIndex, selectedClasses } = get();

    // Move to next alive player or continue game
    const nextAliveIndex = players.findIndex(
      (p, i) => i > rewardPlayerIndex && p.isAlive
    );

    if (nextAliveIndex !== -1) {
      const nextPlayerClass = selectedClasses[nextAliveIndex];
      const allClassCards = getCardsByClass(nextPlayerClass);
      const nextPlayer = players[nextAliveIndex];

      const playerCardIds = new Set([
        ...nextPlayer.deck.map((c) => c.id),
        ...nextPlayer.discard.map((c) => c.id),
        ...nextPlayer.hand.map((c) => c.id),
      ]);

      const availableRewards = allClassCards
        .filter((c: Card) => !playerCardIds.has(c.id))
        .slice(0, 3);

      set({
        rewardPlayerIndex: nextAliveIndex,
        rewardCards: availableRewards,
        selectedRewardCardId: null,
      });
    } else {
      get().nextRound();
    }
  },

  // ============================================
  // ANIMATION
  // ============================================
  setAnimation: (animationUpdate) => {
    set((state) => ({
      animation: { ...state.animation, ...animationUpdate },
    }));
  },

  addActionMessage: (text, type) => {
    const newMessage: ActionMessage = {
      id: generateId(),
      text,
      type,
      timestamp: Date.now(),
    };
    set((state) => ({
      animation: {
        ...state.animation,
        actionMessages: [...state.animation.actionMessages, newMessage],
      },
    }));
  },

  clearActionMessages: () => {
    set((state) => ({
      animation: { ...state.animation, actionMessages: [] },
    }));
  },

  addDamageNumber: (targetId, value, type) => {
    const newDamageNumber = {
      id: generateId(),
      targetId,
      value,
      type,
    };
    set((state) => ({
      animation: {
        ...state.animation,
        damageNumbers: [...state.animation.damageNumbers, newDamageNumber],
      },
    }));
    // Auto-remove after animation completes
    setTimeout(() => {
      set((state) => ({
        animation: {
          ...state.animation,
          damageNumbers: state.animation.damageNumbers.filter(
            (d) => d.id !== newDamageNumber.id
          ),
        },
      }));
    }, 1500);
  },

  // ============================================
  // RESOURCES
  // ============================================
  addResource: (playerId, amount) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId
          ? { ...p, resource: Math.min(p.resource + amount, p.maxResource) }
          : p
      ),
    }));
  },

  spendResource: (playerId, amount) => {
    const player = get().players.find((p) => p.id === playerId);
    if (!player || player.resource < amount) return false;
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, resource: p.resource - amount } : p
      ),
    }));
    return true;
  },

  regenerateResources: () => {
    // Called at start of turn - regenerate resources based on class
    set((state) => ({
      players: state.players.map((p) => {
        if (!p.isAlive) return p;
        let regen = 0;
        const hpPercent = p.hp / p.maxHp;
        switch (p.class) {
          case "mage":
            regen = 2; // Mage regenerates 2 Arcane per turn
            break;
          case "archer":
            // Archer gains Focus when not taking damage (handled elsewhere)
            break;
          case "barbarian":
            // Barbarian gains Fury from low HP (calculated based on HP%)
            if (hpPercent < 0.25) regen = 3;
            else if (hpPercent < 0.5) regen = 2;
            else if (hpPercent < 0.75) regen = 1;
            break;
          default:
            // Other classes gain resources through actions
            break;
        }
        return {
          ...p,
          resource: Math.min(p.resource + regen, p.maxResource),
        };
      }),
    }));
  },

  // ============================================
  // SPECIAL ABILITIES & ENHANCEMENT
  // ============================================
  canUseSpecialAbility: () => {
    const { players, currentPlayerIndex, phase } = get();
    const player = players[currentPlayerIndex];
    if (!player || !player.isAlive) return false;
    if (phase !== "SELECT") return false;
    return player.resource >= player.maxResource;
  },

  canEnhanceCard: () => {
    const { players, currentPlayerIndex, phase, selectedCardId } = get();
    const player = players[currentPlayerIndex];
    if (!player || !player.isAlive) return false;
    if (phase !== "SELECT" || !selectedCardId) return false;
    return player.resource >= player.maxResource;
  },

  setEnhanceMode: (enabled) => {
    set({ enhanceMode: enabled });
  },

  useSpecialAbility: async () => {
    const { players, monsters, currentPlayerIndex, turn, drawnCards } = get();
    const player = players[currentPlayerIndex];
    const config = CLASS_CONFIGS[player.class];

    // Helper to delay with speed settings
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, get().getDelay(ms)));

    // Spend all resources
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      resource: 0,
    };

    // Show special ability being used
    set({ phase: "PLAYER_ACTION", players: updatedPlayers });
    get().addActionMessage(
      `${player.name} uses ${config.specialAbility.name}!`,
      "action"
    );
    set({
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} uses ${config.specialAbility.name}! (${config.specialAbility.description})`,
          "action"
        ),
      ],
    });
    await delay(1200);

    // Apply special ability effects
    let finalPlayers = updatedPlayers;
    let finalMonsters = [...monsters];
    const logs: LogEntry[] = [];

    for (const effect of config.specialAbility.effects) {
      const result = applyEffect(
        effect,
        player,
        finalPlayers,
        finalMonsters,
        turn,
        null
      );
      finalPlayers = result.players;
      finalMonsters = result.monsters;
      logs.push(...result.logs);

      // Ensure resource stays at 0 after effect application
      finalPlayers[currentPlayerIndex] = {
        ...finalPlayers[currentPlayerIndex],
        resource: 0,
      };

      // Add damage numbers
      for (const monster of finalMonsters) {
        const oldMonster = monsters.find((m) => m.id === monster.id);
        if (oldMonster && oldMonster.hp > monster.hp) {
          get().addDamageNumber(
            monster.id,
            oldMonster.hp - monster.hp,
            "damage"
          );
        }
      }
      for (const p of finalPlayers) {
        const oldPlayer = players.find((pl) => pl.id === p.id);
        if (oldPlayer && oldPlayer.hp < p.hp) {
          get().addDamageNumber(p.id, p.hp - oldPlayer.hp, "heal");
        }
      }
    }

    // Show effect logs
    for (const logEntry of logs) {
      const msgType =
        logEntry.type === "damage"
          ? "damage"
          : logEntry.type === "heal"
          ? "heal"
          : "action";
      get().addActionMessage(
        logEntry.message,
        msgType as ActionMessage["type"]
      );
      set({ log: [...get().log, logEntry] });
      await delay(1000);
    }

    // Discard drawn cards back to deck
    const currentPlayer = finalPlayers[currentPlayerIndex];
    finalPlayers[currentPlayerIndex] = {
      ...currentPlayer,
      deck: [...currentPlayer.deck, ...drawnCards],
    };

    set({
      players: finalPlayers,
      monsters: finalMonsters,
      selectedCardId: null,
      drawnCards: [],
    });

    // Check for round victory
    if (finalMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    get().nextPhase();
  },

  startDiceRoll: () => {
    const { players, currentPlayerIndex, selectedCardId, drawnCards, turn } =
      get();
    const player = players[currentPlayerIndex];
    const selectedCard = drawnCards.find((c) => c.id === selectedCardId);

    if (!selectedCard) return;

    // Start dice rolling animation
    set((state) => ({
      phase: "AGGRO",
      animation: { ...state.animation, diceRolling: true, diceRoll: null },
    }));

    // Animate dice rolling for 1.5 seconds
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const fakeRoll = Math.floor(Math.random() * 20) + 1;
      set((state) => ({
        animation: { ...state.animation, diceRoll: fakeRoll },
      }));
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollInterval);

        // Final roll
        const finalRoll = rollD20();
        const cardAggro = selectedCard.aggro;
        const newBaseAggro = player.baseAggro + cardAggro;
        const totalAggro = newBaseAggro + finalRoll;

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = {
          ...player,
          baseAggro: newBaseAggro,
          diceAggro: finalRoll,
        };

        set((state) => ({
          players: updatedPlayers,
          animation: {
            ...state.animation,
            diceRoll: finalRoll,
            diceRolling: false,
          },
          log: [
            ...get().log,
            createLogEntry(
              turn,
              "AGGRO",
              `${player.name} rolls D20: ${finalRoll} + ${newBaseAggro} base = ${totalAggro} aggro`,
              "roll"
            ),
          ],
        }));

        // After showing the result for a moment, play the card
        setTimeout(() => {
          set((state) => ({
            animation: { ...state.animation, diceRoll: null },
          }));
          get().playCard();
        }, 1000);
      }
    }, 100);
  },

  // ============================================
  // UTILITY
  // ============================================
  addLog: (message, type) => {
    const { turn, phase, log } = get();
    set({ log: [...log, createLogEntry(turn, phase, message, type)] });
  },

  resetGame: () => {
    set(initialState);
  },

  // ============================================
  // SPEED SETTINGS
  // ============================================
  setGameSpeed: (speed: GameSpeed) => {
    set({ gameSpeed: speed });
  },

  toggleSkipAnimations: () => {
    set((state) => ({ skipAnimations: !state.skipAnimations }));
  },

  getDelay: (baseMs: number): number => {
    const { gameSpeed, skipAnimations } = get();
    if (skipAnimations) return 0;
    switch (gameSpeed) {
      case "fast":
        return Math.floor(baseMs * 0.4);
      case "instant":
        return 50; // Minimal delay for state updates
      default:
        return baseMs;
    }
  },

  // ============================================
  // QUICK RESTART
  // ============================================
  playAgainSameParty: () => {
    const { savedParty } = get();
    if (!savedParty) {
      // No saved party, just reset
      set(initialState);
      return;
    }

    // Reset to initial state but keep saved party and go to deck builder
    set({
      ...initialState,
      savedParty,
      selectedClasses: savedParty.classes,
      heroNames: savedParty.names,
      currentScreen: "deckBuilder",
    });

    // Trigger deck building setup
    get().confirmClassSelection();
  },

  playAgainNewParty: () => {
    // Full reset but keep speed settings
    const { gameSpeed, skipAnimations } = get();
    set({
      ...initialState,
      gameSpeed,
      skipAnimations,
      savedParty: null,
    });
  },
}));

// ============================================
// APPLY EFFECT HELPER
// ============================================
function applyEffect(
  effect: Effect,
  caster: Player,
  players: Player[],
  monsters: Monster[],
  turn: number,
  selectedTargetId: string | null = null
): { players: Player[]; monsters: Monster[]; logs: LogEntry[] } {
  const logs: LogEntry[] = [];
  const updatedPlayers = [...players];
  const updatedMonsters = [...monsters];

  const getTargets = (): Player[] => {
    switch (effect.target) {
      case "self":
        return [caster];
      case "ally":
        // If a specific target is selected, use it
        if (selectedTargetId) {
          const target = updatedPlayers.find(
            (p) => p.id === selectedTargetId && p.isAlive
          );
          return target ? [target] : [];
        }
        // Fallback to first alive ally
        return updatedPlayers
          .filter((p) => p.isAlive && p.id !== caster.id)
          .slice(0, 1);
      case "allAllies":
        return updatedPlayers.filter((p) => p.isAlive);
      default:
        return [];
    }
  };

  const getMonsterTargets = (): Monster[] => {
    switch (effect.target) {
      case "monster":
        // If a specific target is selected, use it
        if (selectedTargetId) {
          const target = updatedMonsters.find(
            (m) => m.id === selectedTargetId && m.isAlive
          );
          return target ? [target] : [];
        }
        // Fallback to first alive monster
        return updatedMonsters.filter((m) => m.isAlive).slice(0, 1);
      case "allMonsters":
        return updatedMonsters.filter((m) => m.isAlive);
      default:
        return [];
    }
  };

  switch (effect.type) {
    case "damage": {
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        let damage = effect.value || 0;

        // Check for strength buff on caster (use updatedPlayers to get current state)
        const currentCaster = updatedPlayers.find((p) => p.id === caster.id);
        const strengthBuff = currentCaster?.buffs.find(
          (b) => b.type === "strength"
        );
        if (strengthBuff) {
          damage += strengthBuff.value;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${caster.name}'s strength buff adds +${strengthBuff.value} damage!`,
              "buff",
              true // sub-entry
            )
          );
        }

        // Check accuracy (chance to miss) - use current state
        const currentAccuracyPenalty = currentCaster?.accuracyPenalty || 0;
        if (currentAccuracyPenalty > 0) {
          const roll = rollD20();
          if (roll <= currentAccuracyPenalty) {
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${caster.name} misses! (rolled ${roll} ≤ ${currentAccuracyPenalty})`,
                "info"
              )
            );
            continue;
          }
        }

        // Apply armored elite modifier (25% damage reduction)
        if (monster.damageReduction) {
          const reducedAmount = Math.floor(damage * monster.damageReduction);
          damage = damage - reducedAmount;
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${monster.name}'s armor reduces damage by ${reducedAmount}!`,
              "info",
              true
            )
          );
        }

        // Apply damage to shield first (for shielded monsters)
        let remainingDamage = damage;
        let newShield = monster.shield;
        if (newShield > 0) {
          if (newShield >= remainingDamage) {
            newShield -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newShield;
            newShield = 0;
          }
        }

        const newHp = Math.max(0, monster.hp - remainingDamage);
        const isAlive = newHp > 0;

        updatedMonsters[idx] = {
          ...monster,
          hp: newHp,
          shield: newShield,
          isAlive,
        };

        // Cursed elite modifier - apply random debuff to attacker
        if (monster.eliteModifier === "cursed" && currentCaster) {
          const debuffTypes: Array<"poison" | "burn" | "weakness" | "ice"> = [
            "poison",
            "burn",
            "weakness",
            "ice",
          ];
          const randomDebuff =
            debuffTypes[Math.floor(Math.random() * debuffTypes.length)];
          const casterIdx = updatedPlayers.findIndex((p) => p.id === caster.id);
          if (casterIdx !== -1) {
            const existingDebuff = updatedPlayers[casterIdx].debuffs.find(
              (d) => d.type === randomDebuff
            );
            if (existingDebuff) {
              existingDebuff.duration = Math.max(existingDebuff.duration, 2);
            } else {
              updatedPlayers[casterIdx] = {
                ...updatedPlayers[casterIdx],
                debuffs: [
                  ...updatedPlayers[casterIdx].debuffs,
                  { type: randomDebuff, value: 2, duration: 2 },
                ],
              };
            }
            logs.push(
              createLogEntry(
                turn,
                "PLAYER_ACTION",
                `${monster.name}'s curse afflicts ${caster.name} with ${randomDebuff}!`,
                "debuff",
                true
              )
            );
          }
        }

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${caster.name} deals ${damage} damage to ${monster.name}!${
              !isAlive ? ` ${monster.name} is defeated!` : ""
            }`,
            "damage",
            true // sub-entry
          )
        );
      }

      // Self damage
      if (effect.target === "self" && effect.value) {
        const idx = updatedPlayers.findIndex((p) => p.id === caster.id);
        if (idx !== -1) {
          const newHp = Math.max(0, updatedPlayers[idx].hp - effect.value);
          updatedPlayers[idx] = {
            ...updatedPlayers[idx],
            hp: newHp,
            isAlive: newHp > 0,
          };
          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${caster.name} takes ${effect.value} self damage!`,
              "damage"
            )
          );
        }
      }
      break;
    }

    case "heal": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const healAmount = effect.value || 0;
        const newHp = Math.min(target.maxHp, target.hp + healAmount);

        updatedPlayers[idx] = {
          ...target,
          hp: newHp,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} heals for ${healAmount}!`,
            "heal"
          )
        );
      }
      break;
    }

    case "shield": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const shieldAmount = effect.value || 0;

        updatedPlayers[idx] = {
          ...target,
          shield: target.shield + shieldAmount,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} gains ${shieldAmount} shield!`,
            "buff"
          )
        );
      }
      break;
    }

    case "stealth":
    case "taunt":
    case "strength":
    case "block": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        const newBuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.duration || 1,
          source: caster.name,
        };

        updatedPlayers[idx] = {
          ...target,
          buffs: [...target.buffs, newBuff],
          isStealth: effect.type === "stealth" || target.isStealth,
          hasTaunt: effect.type === "taunt" || target.hasTaunt,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} gains ${effect.type}!`,
            "buff"
          )
        );
      }
      break;
    }

    case "poison":
    case "burn":
    case "ice":
    case "weakness":
    case "stun":
    case "accuracy": {
      const monsterTargets = getMonsterTargets();
      for (const monster of monsterTargets) {
        const idx = updatedMonsters.findIndex((m) => m.id === monster.id);
        if (idx === -1) continue;

        const newDebuff: StatusEffect = {
          type: effect.type,
          value: effect.value || 1,
          duration: effect.duration || 1,
          source: caster.name,
        };

        updatedMonsters[idx] = {
          ...monster,
          debuffs: [...monster.debuffs, newDebuff],
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${monster.name} is afflicted with ${effect.type}!`,
            "debuff"
          )
        );
      }
      break;
    }

    case "cleanse": {
      const targets = getTargets();
      for (const target of targets) {
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx === -1) continue;

        updatedPlayers[idx] = {
          ...target,
          debuffs: [],
          isStunned: false,
          accuracyPenalty: 0,
        };

        logs.push(
          createLogEntry(
            turn,
            "PLAYER_ACTION",
            `${target.name} is cleansed of all debuffs!`,
            "buff"
          )
        );
      }
      break;
    }

    case "revive": {
      const deadAllies = updatedPlayers.filter(
        (p) => !p.isAlive && p.id !== caster.id
      );
      if (deadAllies.length > 0) {
        const target = deadAllies[0];
        const idx = updatedPlayers.findIndex((p) => p.id === target.id);
        if (idx !== -1) {
          const reviveHp = Math.floor(
            target.maxHp * ((effect.value || 30) / 100)
          );

          updatedPlayers[idx] = {
            ...target,
            hp: reviveHp,
            isAlive: true,
            debuffs: [],
            isStunned: false,
            accuracyPenalty: 0,
          };

          logs.push(
            createLogEntry(
              turn,
              "PLAYER_ACTION",
              `${target.name} is revived with ${reviveHp} HP!`,
              "heal"
            )
          );
        }
      }
      break;
    }
  }

  return { players: updatedPlayers, monsters: updatedMonsters, logs };
}
