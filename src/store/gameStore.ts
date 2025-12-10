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
} from "../types";
import { CLASS_CONFIGS } from "../data/classes";
import { getCardsByClass } from "../data/cards";
import { getMonstersForRound, ROUNDS } from "../data/monsters";

// ============================================
// UTILITY FUNCTIONS
// ============================================
const rollD20 = (): number => Math.floor(Math.random() * 20) + 1;
const rollD6 = (): number => Math.floor(Math.random() * 6) + 1;

const generateId = (): string => Math.random().toString(36).substring(2, 9);

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
  maxRounds: 3,
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

  // Utility
  addLog: (message: string, type: LogEntry["type"]) => void;
  resetGame: () => void;
  needsTargetSelection: () => boolean;
  getTargetType: () => "ally" | "monster" | null;
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
    newNames[index] = name || `Hero ${index + 1}`;
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

    // Create player with selected deck
    const classType = selectedClasses[deckBuildingPlayerIndex];
    const heroName =
      heroNames[deckBuildingPlayerIndex] ||
      `Hero ${deckBuildingPlayerIndex + 1}`;
    const deck = availableCards.filter((card) =>
      selectedDeckCards.includes(card.id)
    );
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
    const { players } = get();

    // Shuffle all player decks
    const shuffledPlayers = players.map((player) => ({
      ...player,
      deck: shuffleArray(player.deck),
    }));

    set({
      players: shuffledPlayers,
      round: 1,
      turn: 1,
    });

    // Start first round
    get().startRound();
  },

  startRound: () => {
    const { round, players } = get();
    const roundConfig = ROUNDS.find((r) => r.round === round);
    const monsters = getMonstersForRound(round);

    // Reset player shields and clear some status effects between rounds
    const refreshedPlayers = players.map((player) => ({
      ...player,
      shield: 0,
      baseAggro: 0,
      diceAggro: 0,
    }));

    set({
      players: refreshedPlayers,
      monsters,
      phase: "DRAW",
      currentPlayerIndex: 0,
      log: [
        ...get().log,
        createLogEntry(
          get().turn,
          "DRAW",
          `═══════════════════════════════════`,
          "info"
        ),
        createLogEntry(
          get().turn,
          "DRAW",
          `ROUND ${round}: ${roundConfig?.name || "Unknown"}`,
          "info"
        ),
        createLogEntry(
          get().turn,
          "DRAW",
          roundConfig?.description || "",
          "info"
        ),
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

    // Auto-draw cards for first player
    get().drawCards();
  },

  nextRound: () => {
    const { round, maxRounds, players } = get();

    if (round >= maxRounds) {
      // Game complete - victory!
      set({ currentScreen: "victory" });
      return;
    }

    // Heal players between rounds (50% of missing HP)
    const healedPlayers = players.map((player) => {
      if (!player.isAlive) return player;
      const missingHp = player.maxHp - player.hp;
      const healAmount = Math.floor(missingHp * 0.5);
      return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + healAmount),
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

    if (!player.isAlive) {
      get().nextPhase();
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
    // Move to aggro phase after target is confirmed
    get().rollAggro();
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
    const baseAggro = selectedCard.aggro;
    const totalAggro = baseAggro + diceAggro;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...player,
      baseAggro,
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
          `${player.name} rolls D20: ${diceAggro} + ${baseAggro} base = ${totalAggro} aggro`,
          "roll"
        ),
      ],
    });

    // Automatically play the card after rolling aggro
    get().playCard();
  },

  playCard: () => {
    const {
      players,
      monsters,
      currentPlayerIndex,
      selectedCardId,
      selectedTargetId,
      drawnCards,
      turn,
    } = get();
    const player = players[currentPlayerIndex];

    // Check if stunned
    if (player.isStunned) {
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
      });
      get().nextPhase();
      return;
    }

    const selectedCard = drawnCards.find((c) => c.id === selectedCardId);
    if (!selectedCard) return;

    let updatedPlayers = [...players];
    let updatedMonsters = [...monsters];
    const logs: LogEntry[] = [];

    // Apply each effect
    for (const effect of selectedCard.effects) {
      const result = applyEffect(
        effect,
        player,
        updatedPlayers,
        updatedMonsters,
        turn,
        selectedTargetId
      );
      updatedPlayers = result.players;
      updatedMonsters = result.monsters;
      logs.push(...result.logs);
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

    set({
      players: updatedPlayers,
      monsters: updatedMonsters,
      selectedCardId: null,
      drawnCards: [],
      log: [
        ...get().log,
        createLogEntry(
          turn,
          "PLAYER_ACTION",
          `${player.name} plays ${selectedCard.name}!`,
          "action"
        ),
        ...logs,
      ],
    });

    // Check for round victory
    if (updatedMonsters.every((m) => !m.isAlive)) {
      get().nextRound();
      return;
    }

    get().nextPhase();
  },

  monsterAct: () => {
    const { players, monsters, turn } = get();
    const updatedPlayers = [...players];
    const logs: LogEntry[] = [];

    for (const monster of monsters) {
      if (!monster.isAlive) continue;

      // Check if monster is stunned
      const isStunned = monster.debuffs.some((d) => d.type === "stun");
      if (isStunned) {
        logs.push(
          createLogEntry(
            turn,
            "MONSTER_ACTION",
            `${monster.name} is stunned and cannot act!`,
            "debuff"
          )
        );
        continue;
      }

      // Roll D6 for ability
      const roll = rollD6();
      const ability = monster.abilities.find((a) => a.roll === roll);

      if (!ability) continue;

      logs.push(
        createLogEntry(
          turn,
          "MONSTER_ACTION",
          `${monster.name} rolls ${roll}: ${ability.name}!`,
          "roll"
        )
      );

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
              (a, b) => b.baseAggro + b.diceAggro - (a.baseAggro + a.diceAggro)
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

          logs.push(
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${monster.name} deals ${damage} damage to ${target.name}!${
                !isAlive ? ` ${target.name} falls!` : ""
              }`,
              "damage"
            )
          );
        }
      } else if (ability.damage < 0) {
        // Monster heals itself
        const monsterIndex = monsters.findIndex((m) => m.id === monster.id);
        const healAmount = Math.abs(ability.damage);
        const newHp = Math.min(monster.maxHp, monster.hp + healAmount);
        const updatedMonster = { ...monster, hp: newHp };
        const updatedMonstersArray = [...monsters];
        updatedMonstersArray[monsterIndex] = updatedMonster;
        set({ monsters: updatedMonstersArray });

        logs.push(
          createLogEntry(
            turn,
            "MONSTER_ACTION",
            `${monster.name} heals for ${healAmount}!`,
            "heal"
          )
        );
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

          logs.push(
            createLogEntry(
              turn,
              "MONSTER_ACTION",
              `${target.name} is afflicted with ${ability.debuff.type}!`,
              "debuff"
            )
          );
        }
      }
    }

    set({
      players: updatedPlayers,
      log: [...get().log, ...logs],
    });

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

    // Resolve monster debuffs (DOTs)
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
    const { turn } = get();

    // Start new turn - all players act again
    set({
      currentPlayerIndex: 0,
      turn: turn + 1,
      phase: "DRAW",
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
  // UTILITY
  // ============================================
  addLog: (message, type) => {
    const { turn, phase, log } = get();
    set({ log: [...log, createLogEntry(turn, phase, message, type)] });
  },

  resetGame: () => {
    set(initialState);
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

        const newHp = Math.max(0, monster.hp - damage);
        const isAlive = newHp > 0;

        updatedMonsters[idx] = {
          ...monster,
          hp: newHp,
          isAlive,
        };

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
