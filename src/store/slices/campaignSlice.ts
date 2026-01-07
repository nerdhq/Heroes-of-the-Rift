import type { StateCreator } from "zustand";
import type { GameStore } from "../types";
import type {
  CampaignState,
  CampaignActions,
  CampaignProgress,
  QuestDefinition,
} from "../../types/campaign";
import { CAMPAIGNS } from "../../data/campaigns";
import {
  createMonster,
  MONSTER_TIERS,
} from "../../data/monsters";
import { ENVIRONMENTS } from "../../data/environments";
import type { Monster, Environment } from "../../types";
import { createPlayer } from "../utils";

// ============================================
// INITIAL CAMPAIGN STATE
// ============================================
export const initialCampaignState: CampaignState = {
  availableCampaigns: [],
  activeCampaign: null,
  campaignProgress: null,
  completedCampaigns: [],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ============================================
// CREATE CAMPAIGN SLICE
// ============================================
export const createCampaignSlice: StateCreator<
  GameStore,
  [],
  [],
  CampaignState & CampaignActions
> = (set, get) => ({
  ...initialCampaignState,

  // Load campaigns from data
  loadCampaigns: () => {
    // Load completed campaigns from localStorage
    const savedCompleted = localStorage.getItem("completedCampaigns");
    const completedCampaigns = savedCompleted ? JSON.parse(savedCompleted) : [];

    // Load saved campaign progress
    const savedProgress = localStorage.getItem("campaignProgress");
    let campaignProgress: CampaignProgress | null = null;
    let activeCampaign = null;

    if (savedProgress) {
      campaignProgress = JSON.parse(savedProgress);
      if (campaignProgress) {
        activeCampaign = CAMPAIGNS.find((c) => c.id === campaignProgress!.campaignId) || null;
      }
    }

    set({
      availableCampaigns: CAMPAIGNS,
      completedCampaigns,
      campaignProgress,
      activeCampaign,
    });
  },

  // Start a new campaign
  startCampaign: (campaignId: string) => {
    const campaign = CAMPAIGNS.find((c) => c.id === campaignId);
    if (!campaign) {
      console.error(`Campaign not found: ${campaignId}`);
      return;
    }

    const { activeChampion } = get();
    if (!activeChampion) {
      console.error("No active champion selected for campaign");
      return;
    }

    // Determine total rounds for first quest
    const firstQuest = campaign.quests[0];
    const totalRounds = getRandomInt(firstQuest.minRounds, firstQuest.maxRounds) + 1; // +1 for boss round

    // Progress is created without deck - deck will be saved after deck building
    const progress: CampaignProgress = {
      campaignId,
      currentQuestIndex: 0,
      currentRound: 1,
      totalRounds,
      status: "in_progress",
      startedAt: Date.now(),
      savedChampionId: activeChampion.id,
      savedDeck: [], // Will be populated after deck building
    };

    // Save progress to localStorage
    localStorage.setItem("campaignProgress", JSON.stringify(progress));

    set({
      activeCampaign: campaign,
      campaignProgress: progress,
      currentScreen: "campaignIntro",
    });
  },

  // Start the current quest (show quest intro)
  startQuest: () => {
    const { activeCampaign, campaignProgress } = get();
    if (!activeCampaign || !campaignProgress) return;

    const quest = activeCampaign.quests[campaignProgress.currentQuestIndex];
    if (!quest) return;

    // Determine total rounds for this quest
    const totalRounds = getRandomInt(quest.minRounds, quest.maxRounds) + 1; // +1 for boss round

    const updatedProgress: CampaignProgress = {
      ...campaignProgress,
      currentRound: 1,
      totalRounds,
    };

    localStorage.setItem("campaignProgress", JSON.stringify(updatedProgress));

    set({
      campaignProgress: updatedProgress,
      currentScreen: "questIntro",
    });
  },

  // Get current quest
  getCurrentQuest: (): QuestDefinition | null => {
    const { activeCampaign, campaignProgress } = get();
    if (!activeCampaign || !campaignProgress) return null;
    return activeCampaign.quests[campaignProgress.currentQuestIndex] || null;
  },

  // Check if current quest is the final quest
  isFinalQuest: (): boolean => {
    const { activeCampaign, campaignProgress } = get();
    if (!activeCampaign || !campaignProgress) return false;
    return campaignProgress.currentQuestIndex === activeCampaign.quests.length - 1;
  },

  // Check if current round is the boss round
  isBossRound: (): boolean => {
    const { campaignProgress } = get();
    if (!campaignProgress) return false;
    return campaignProgress.currentRound === campaignProgress.totalRounds;
  },

  // Start a campaign round (generates monsters for the round)
  startCampaignRound: () => {
    const { activeCampaign, campaignProgress, players } = get();
    if (!activeCampaign || !campaignProgress) return;

    const quest = activeCampaign.quests[campaignProgress.currentQuestIndex];
    if (!quest) return;

    const isBossRound = campaignProgress.currentRound === campaignProgress.totalRounds;
    const isFinalBoss = get().isFinalQuest() && isBossRound;

    let monsters: Monster[] = [];

    if (isBossRound) {
      // Create boss monster
      let boss = createMonster(
        quest.bossId,
        quest.bossLevel,
        quest.bossEliteModifier
      );

      // Apply final boss difficulty multipliers
      if (isFinalBoss) {
        const { finalBossDifficulty, finalBossName } = activeCampaign;
        const scaledHp = Math.floor(boss.maxHp * finalBossDifficulty.hpMultiplier);
        boss = {
          ...boss,
          name: finalBossName,
          maxHp: scaledHp,
          hp: scaledHp,
          eliteModifier: finalBossDifficulty.eliteModifier || boss.eliteModifier,
        };
      }

      monsters = [boss];
    } else {
      // Generate regular monsters from quest tiers
      const availableMonsters: string[] = [];
      for (const tier of quest.monsterTiers) {
        const tierMonsters = MONSTER_TIERS[tier as keyof typeof MONSTER_TIERS];
        if (tierMonsters) {
          availableMonsters.push(...tierMonsters);
        }
      }

      // Pick 1-2 random monsters
      const monsterCount = Math.min(2, availableMonsters.length);
      const selectedIds = new Set<string>();

      for (let i = 0; i < monsterCount && availableMonsters.length > 0; i++) {
        const remaining = availableMonsters.filter((id) => !selectedIds.has(id));
        if (remaining.length === 0) break;

        const monsterId = pickRandom(remaining);
        selectedIds.add(monsterId);

        // Check for elite modifier based on quest's elite chance
        const eliteModifier =
          Math.random() < quest.eliteChance
            ? pickRandom(["fast", "armored", "enraged", "regenerating", "cursed", "shielded"] as const)
            : undefined;

        monsters.push(createMonster(monsterId, quest.monsterLevel, eliteModifier));
      }
    }

    // Set environment based on quest's environment pool
    let environment: Environment | null = null;
    if (quest.environmentPool && quest.environmentPool.length > 0) {
      const envType = pickRandom(quest.environmentPool) as keyof typeof ENVIRONMENTS;
      environment = ENVIRONMENTS[envType] || null;
    }

    // Reset player states for new round
    const resetPlayers = players.map((p) => ({
      ...p,
      hand: [],
      buffs: [],
      debuffs: [],
      shield: 0,
      diceAggro: 0,
      isStealth: false,
      hasTaunt: false,
      isStunned: false,
    }));

    set({
      monsters,
      environment,
      players: resetPlayers,
      round: campaignProgress.currentRound,
      maxRounds: campaignProgress.totalRounds,
      turn: 1,
      phase: "DRAW",
      currentPlayerIndex: 0,
      selectedCardId: null,
      selectedTargetId: null,
      log: [],
      currentScreen: "game",
    });

    // Draw cards for all players
    get().drawAllPlayersCards();
  },

  // Complete the current quest
  completeQuest: () => {
    const { activeCampaign, campaignProgress } = get();
    if (!activeCampaign || !campaignProgress) return;

    // Check if this was the final quest
    if (get().isFinalQuest()) {
      get().completeCampaign();
      return;
    }

    // Move to quest complete screen
    set({ currentScreen: "questComplete" });
  },

  // Advance to the next quest
  advanceToNextQuest: () => {
    const { activeCampaign, campaignProgress } = get();
    if (!activeCampaign || !campaignProgress) return;

    const nextQuestIndex = campaignProgress.currentQuestIndex + 1;
    if (nextQuestIndex >= activeCampaign.quests.length) {
      get().completeCampaign();
      return;
    }

    const nextQuest = activeCampaign.quests[nextQuestIndex];
    const totalRounds = getRandomInt(nextQuest.minRounds, nextQuest.maxRounds) + 1;

    const updatedProgress: CampaignProgress = {
      ...campaignProgress,
      currentQuestIndex: nextQuestIndex,
      currentRound: 1,
      totalRounds,
    };

    localStorage.setItem("campaignProgress", JSON.stringify(updatedProgress));

    set({
      campaignProgress: updatedProgress,
      currentScreen: "questIntro",
    });
  },

  // Complete the entire campaign
  completeCampaign: () => {
    const { activeCampaign, campaignProgress, completedCampaigns } = get();
    if (!activeCampaign || !campaignProgress) return;

    // Add to completed campaigns if not already there
    const newCompleted = completedCampaigns.includes(activeCampaign.id)
      ? completedCampaigns
      : [...completedCampaigns, activeCampaign.id];

    // Save to localStorage
    localStorage.setItem("completedCampaigns", JSON.stringify(newCompleted));
    localStorage.removeItem("campaignProgress");

    const finalProgress: CampaignProgress = {
      ...campaignProgress,
      status: "completed",
      completedAt: Date.now(),
    };

    set({
      campaignProgress: finalProgress,
      completedCampaigns: newCompleted,
      currentScreen: "campaignVictory",
    });
  },

  // Fail the campaign (party wipe)
  failCampaign: () => {
    const { campaignProgress } = get();
    if (!campaignProgress) return;

    // Clear saved progress
    localStorage.removeItem("campaignProgress");

    const failedProgress: CampaignProgress = {
      ...campaignProgress,
      status: "failed",
      completedAt: Date.now(),
    };

    set({
      campaignProgress: failedProgress,
      currentScreen: "campaignDefeat",
    });
  },

  // Resume a saved campaign
  resumeCampaign: () => {
    const { activeCampaign, campaignProgress, playerAccount } = get();
    if (!activeCampaign || !campaignProgress) return;

    // Find the saved champion
    const savedChampion = playerAccount?.champions.find(
      (c) => c.id === campaignProgress.savedChampionId
    );
    
    if (!savedChampion) {
      console.error("Saved champion not found for campaign");
      return;
    }

    // Set the saved champion as active
    set({ activeChampion: savedChampion });

    // If we have a saved deck, skip deck building and go directly to quest
    if (campaignProgress.savedDeck.length > 0) {
      // Restore the deck from saved card IDs
      const savedDeck = campaignProgress.savedDeck
        .map((cardId) => savedChampion.ownedCards.find((c) => c.id === cardId))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
        .map((card) => ({
          ...card,
          id: `${card.id}-0-${Date.now()}`, // Generate unique IDs for this game session
        }));

      // Create player with saved deck
      const newPlayer = createPlayer(
        "player-0",
        savedChampion.name,
        savedChampion.class,
        savedDeck,
        savedChampion
      );

      set({
        selectedClasses: [savedChampion.class],
        heroNames: [savedChampion.name],
        players: [newPlayer],
        currentScreen: "questIntro",
      });
    } else {
      // No saved deck yet - go to deck building
      set({ currentScreen: "questIntro" });
    }
  },

  // Save current campaign progress to localStorage
  saveCampaignProgress: () => {
    const { campaignProgress } = get();
    if (!campaignProgress) return;

    localStorage.setItem("campaignProgress", JSON.stringify(campaignProgress));
  },

  // Abandon campaign and clear progress
  abandonCampaign: () => {
    localStorage.removeItem("campaignProgress");

    set({
      activeCampaign: null,
      campaignProgress: null,
    });
  },
});
