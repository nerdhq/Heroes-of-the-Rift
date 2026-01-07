// ============================================
// CAMPAIGN SYSTEM - TYPE DEFINITIONS
// ============================================

import type { EliteModifier, EnvironmentType } from "./index";

// ============================================
// QUEST DEFINITION
// ============================================
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  introText: string; // Story shown before quest

  minRounds: number; // e.g., 2
  maxRounds: number; // e.g., 4
  monsterTiers: string[]; // ["tier1", "tier2"]
  monsterLevel: number;
  eliteChance: number; // 0-1

  bossId: string;
  bossLevel: number;
  bossEliteModifier?: EliteModifier;

  environmentPool?: EnvironmentType[];
}

// ============================================
// CAMPAIGN DEFINITION
// ============================================
export interface CampaignDefinition {
  id: string;
  name: string;
  description: string;
  introText: string; // Story shown at campaign start
  difficulty: "normal" | "hard" | "nightmare";
  icon: string;
  themeColor: string;

  quests: QuestDefinition[]; // 6-8 quests

  // Final boss config
  finalBossId: string;
  finalBossName: string;
  finalBossDifficulty: {
    hpMultiplier: number; // 1.5-2.0x
    damageMultiplier: number; // 1.3-1.5x
    eliteModifier?: EliteModifier;
  };
  finalBossIntroText: string;
}

// ============================================
// CAMPAIGN PROGRESS
// ============================================
export interface CampaignProgress {
  campaignId: string;
  currentQuestIndex: number;
  currentRound: number; // Current round within the quest
  totalRounds: number; // Total rounds for current quest (randomly determined)
  status: "in_progress" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  
  // Locked-in selections for the campaign
  savedChampionId: string; // Champion used for this campaign
  savedDeck: string[]; // Card IDs of the deck selected at campaign start
}

// ============================================
// CAMPAIGN STATE
// ============================================
export interface CampaignState {
  availableCampaigns: CampaignDefinition[];
  activeCampaign: CampaignDefinition | null;
  campaignProgress: CampaignProgress | null;
  completedCampaigns: string[]; // Campaign IDs that have been completed
}

// ============================================
// CAMPAIGN ACTIONS
// ============================================
export interface CampaignActions {
  loadCampaigns: () => void;
  startCampaign: (campaignId: string) => void;
  resumeCampaign: () => void; // Resume saved campaign progress
  saveCampaignProgress: () => void; // Save current progress to localStorage
  abandonCampaign: () => void; // Abandon campaign and clear progress
  startQuest: () => void;
  completeQuest: () => void;
  failCampaign: () => void; // Party wipe
  advanceToNextQuest: () => void;
  completeCampaign: () => void;
  startCampaignRound: () => void;
  getCurrentQuest: () => QuestDefinition | null;
  isFinalQuest: () => boolean;
  isBossRound: () => boolean;
}
