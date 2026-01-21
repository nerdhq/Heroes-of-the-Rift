/**
 * Phase-related combat actions: startGame, startRound, nextRound, endTurn, startMockBattle
 */

import type { SetState, GetState } from "../types";
import type { SavedParty, ClassType, EliteModifier, EnvironmentType } from "../../../../types";
import {
  getMonstersForRound,
  ROUNDS,
  getRoundDescription,
  createMonster,
} from "../../../../data/monsters";
import { getEnvironmentForRound, ENVIRONMENTS } from "../../../../data/environments";
import { CARDS_BY_CLASS } from "../../../../data/cards";
import {
  shuffleArray,
  createLogEntry,
  rollMonsterIntents,
  createPlayer,
  generateId,
} from "../../../utils";
import { BETWEEN_ROUND_HEAL_PERCENT, GOLD_PER_ALIVE_PLAYER } from "../../../../constants";
import { storage, STORAGE_KEYS } from "../../../../lib/storage";

// Mock battle configuration type
export interface MockBattleConfig {
  heroes: Array<{
    id: string;
    name: string;
    classType: ClassType;
    deckCardIds: string[];
  }>;
  monsters: Array<{
    id: string;
    templateId: string;
    level: number;
    eliteModifier?: EliteModifier;
  }>;
  environmentType: EnvironmentType | null;
}

export const createPhaseActions = (set: SetState, get: GetState) => ({
  startGame: () => {
    const { players, selectedClasses, heroNames } = get();

    const savedParty: SavedParty = {
      classes: selectedClasses,
      names: heroNames,
    };

    const shuffledPlayers = players.map((player) => ({
      ...player,
      deck: shuffleArray(player.deck),
    }));

    set({
      players: shuffledPlayers,
      monsters: [],
      round: 1,
      turn: 1,
      currentPlayerIndex: 0,
      phase: "DRAW",
      selectedCardId: null,
      selectedTargetId: null,
      log: [],
      environment: null,
      savedParty,
    });

    get().startRound();
  },

  startRound: () => {
    const { round, players } = get();
    const roundConfig = ROUNDS.find((r) => r.round === round);
    const rawMonsters = getMonstersForRound(round);
    const monsters = rollMonsterIntents(rawMonsters);
    const environment = getEnvironmentForRound(round);

    const refreshedPlayers = players.map((player) => ({
      ...player,
      shield: 0,
    }));

    const firstAlivePlayerIndex = refreshedPlayers.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = refreshedPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      // Campaign mode: fail the campaign
      if (get().campaignProgress) {
        get().failCampaign();
      } else {
        set({ currentScreen: "defeat" });
      }
      return;
    }

    set({
      players: refreshedPlayers,
      monsters,
      environment,
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
        ...(environment
          ? [
              createLogEntry(
                get().turn,
                "DRAW",
                `Environment: ${environment.name} - ${environment.description}`,
                "info"
              ),
            ]
          : []),
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

    // Sync new round state before drawing cards
    get().syncAfterAction();

    // Use simultaneous draw for online mode, sequential for offline
    if (get().isOnline) {
      get().drawAllPlayersCards();
    } else {
      get().drawCards();
    }
  },

  nextRound: () => {
    const { round, maxRounds, players, campaignProgress } = get();

    // Campaign mode: check if this was a boss round (quest complete)
    if (campaignProgress) {
      const isBossRound = round >= maxRounds;

      if (isBossRound) {
        // Quest complete - call campaign slice handler
        get().completeQuest();
        return;
      }

      // Not boss round - advance to next round within quest
      const healedPlayers = players.map((player) => {
        if (!player.isAlive) return player;
        const missingHp = player.maxHp - player.hp;
        const healAmount = Math.floor(missingHp * BETWEEN_ROUND_HEAL_PERCENT);
        return {
          ...player,
          hp: Math.min(player.maxHp, player.hp + healAmount),
          baseAggro: 0,
          diceAggro: 0,
          gold: player.gold + GOLD_PER_ALIVE_PLAYER,
          deck: shuffleArray([...player.deck, ...player.discard]),
          discard: [],
          hand: [],
        };
      });

      const alivePlayerCount = players.filter((p) => p.isAlive).length;
      get().addUserGold(alivePlayerCount);

      // Update campaign progress
      const updatedProgress = {
        ...campaignProgress,
        currentRound: campaignProgress.currentRound + 1,
      };
      storage.set(STORAGE_KEYS.CAMPAIGN_PROGRESS, updatedProgress);

      set({
        round: round + 1,
        turn: get().turn + 1,
        players: healedPlayers,
        playerSelections: [],
        roundGoldEarned: alivePlayerCount,
        campaignProgress: updatedProgress,
        currentScreen: "roundComplete",
      });

      get().syncAfterAction();
      return;
    }

    // Non-campaign mode: original logic
    if (round >= maxRounds) {
      // Save gold to champion before showing victory
      const { activeChampion, players: currentPlayers } = get();
      if (activeChampion) {
        const championPlayer = currentPlayers.find((p) => p.championId === activeChampion.id);
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      set({ currentScreen: "victory" });
      return;
    }

    const healedPlayers = players.map((player) => {
      if (!player.isAlive) return player;
      const missingHp = player.maxHp - player.hp;
      const healAmount = Math.floor(missingHp * BETWEEN_ROUND_HEAL_PERCENT);
      return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + healAmount),
        baseAggro: 0,
        diceAggro: 0,
        gold: player.gold + GOLD_PER_ALIVE_PLAYER,
        deck: shuffleArray([...player.deck, ...player.discard]),
        discard: [],
        hand: [],
      };
    });

    // Award 1 gold to user's persistent gold for each alive player
    const alivePlayerCount = players.filter((p) => p.isAlive).length;
    get().addUserGold(alivePlayerCount);

    set({
      round: round + 1,
      turn: get().turn + 1,
      players: healedPlayers,
      playerSelections: [], // Clear selections for new round
      roundGoldEarned: alivePlayerCount,
      currentScreen: "roundComplete",
    });

    // Sync round transition
    get().syncAfterAction();
  },

  endTurn: () => {
    const { turn, players, monsters, isOnline } = get();

    const firstAlivePlayerIndex = players.findIndex((p) => p.isAlive);

    if (firstAlivePlayerIndex === -1) {
      // Save gold to champion before showing defeat
      const { activeChampion } = get();
      if (activeChampion) {
        const championPlayer = players.find((p) => p.championId === activeChampion.id);
        if (championPlayer) {
          get().setChampionGold(activeChampion.id, championPlayer.gold);
        }
      }
      // Campaign mode: fail the campaign
      if (get().campaignProgress) {
        get().failCampaign();
      } else {
        set({ currentScreen: "defeat" });
      }
      return;
    }

    const updatedMonsters = rollMonsterIntents(monsters);

    get().regenerateResources();

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

    // Use simultaneous draw for online mode, sequential for offline
    if (isOnline) {
      get().drawAllPlayersCards();
    } else {
      get().drawCards();
    }
  },

  startMockBattle: (config: MockBattleConfig) => {
    // 1. Create players from config
    const players = config.heroes.map((hero, idx) => {
      // Get the cards for the deck
      const availableCards = CARDS_BY_CLASS[hero.classType];
      const deck = availableCards
        .filter((card) => hero.deckCardIds.includes(card.id))
        .map((card) => ({
          ...card,
          id: `${card.id}-mock-${idx}-${generateId()}`,
        }));

      return createPlayer(
        `player-${idx}`,
        hero.name,
        hero.classType,
        shuffleArray(deck)
      );
    });

    // 2. Create monsters from config
    const rawMonsters = config.monsters.map((m) =>
      createMonster(m.templateId, m.level, m.eliteModifier)
    );
    const monsters = rollMonsterIntents(rawMonsters);

    // 3. Get environment
    const environment = config.environmentType
      ? ENVIRONMENTS[config.environmentType]
      : null;

    // 4. Set initial game state
    set({
      players,
      monsters,
      environment,
      round: 1,
      turn: 1,
      currentPlayerIndex: 0,
      phase: "DRAW",
      selectedCardId: null,
      selectedTargetId: null,
      log: [
        createLogEntry(1, "DRAW", `────────────────`, "info"),
        createLogEntry(1, "DRAW", `MOCK BATTLE: DevTools Test`, "info"),
        ...(environment
          ? [
              createLogEntry(
                1,
                "DRAW",
                `Environment: ${environment.name} - ${environment.description}`,
                "info"
              ),
            ]
          : []),
        createLogEntry(
          1,
          "DRAW",
          `${monsters.map((m) => m.name).join(" & ")} appear${
            monsters.length > 1 ? "" : "s"
          }!`,
          "info"
        ),
      ],
      currentScreen: "game",
      maxRounds: 1, // Mock battles are single round
      savedParty: null,
      campaignProgress: null, // Ensure not in campaign mode
    });

    // 5. Draw cards for first player
    get().drawCards();
  },
});
