# Campaign System Implementation Plan

## Overview

Add a campaign mode where players progress through 6-8 connected quests (dungeons), each with story/lore introductions. Each quest has a random number of rounds ending with a boss fight. The final campaign boss is significantly harder than all previous bosses.

**Key Decisions:**
- Global progress (shared across champions)
- Party wipe = campaign over (restart from quest 1)
- Start with 2-3 campaigns

---

## Data Structures

### New Types (`src/types/campaign.ts`)

```typescript
export interface CampaignDefinition {
  id: string;
  name: string;
  description: string;
  introText: string;              // Story shown at campaign start
  difficulty: 'normal' | 'hard' | 'nightmare';
  icon: string;
  themeColor: string;

  quests: QuestDefinition[];      // 6-8 quests

  // Final boss config
  finalBossId: string;
  finalBossName: string;
  finalBossDifficulty: {
    hpMultiplier: number;         // 1.5-2.0x
    damageMultiplier: number;     // 1.3-1.5x
    eliteModifier?: EliteModifier;
  };
  finalBossIntroText: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  introText: string;              // Story shown before quest

  minRounds: number;              // e.g., 3
  maxRounds: number;              // e.g., 5
  monsterTiers: string[];         // ["tier1", "tier2"]
  monsterLevel: number;
  eliteChance: number;

  bossId: string;
  bossLevel: number;
  bossEliteModifier?: EliteModifier;

  environmentPool?: EnvironmentType[];
}

export interface CampaignProgress {
  campaignId: string;
  currentQuestIndex: number;
  status: 'in_progress' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
}
```

### Add to ScreenType (`src/types/index.ts`)

```typescript
| "campaignSelect"
| "campaignIntro"
| "questIntro"
| "questComplete"
| "campaignVictory"
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/campaign.ts` | Campaign type definitions |
| `src/data/campaigns.ts` | Campaign definitions (2-3 campaigns) |
| `src/store/slices/campaignSlice.ts` | Campaign state management |
| `src/components/CampaignSelectScreen.tsx` | Campaign selection UI |
| `src/components/CampaignIntroScreen.tsx` | Campaign story intro |
| `src/components/QuestIntroScreen.tsx` | Quest story intro |
| `src/components/QuestCompleteScreen.tsx` | Quest victory screen |
| `src/components/CampaignVictoryScreen.tsx` | Campaign complete celebration |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add new ScreenTypes |
| `src/store/types.ts` | Add CampaignState, CampaignActions |
| `src/store/gameStore.ts` | Integrate campaign slice |
| `src/store/initialState.ts` | Add initial campaign state |
| `src/store/slices/combatSlice.ts` | Add `startCampaignRound()`, modify `nextRound()` |
| `src/App.tsx` | Add campaign screen routing |
| `src/components/TitleScreen.tsx` | Add "Campaigns" button |

---

## Campaign Data Structure

### Example Campaign (`src/data/campaigns.ts`)

```typescript
export const CAMPAIGN_FALLEN_KINGDOM: CampaignDefinition = {
  id: "fallen-kingdom",
  name: "The Fallen Kingdom",
  description: "An ancient kingdom corrupted by dark magic.",
  difficulty: "normal",
  icon: "💀",
  themeColor: "#a855f7",

  introText: `Long ago, the Kingdom of Valdoria stood as a beacon of hope.
But when King Aldric sought immortality, he made a pact with darkness.
Now, as the Lich King, he commands an army of the undead.

You must descend into the corrupted lands and end his reign.`,

  quests: [
    {
      id: "fk-1",
      name: "The Blighted Village",
      description: "A village overrun by undead.",
      introText: "The village of Millbrook was the first to fall...",
      minRounds: 2, maxRounds: 3,
      monsterTiers: ["tier1"], monsterLevel: 1, eliteChance: 0,
      bossId: "skeleton", bossLevel: 1,
    },
    // ... 5-7 more quests, increasing difficulty
    {
      id: "fk-6",
      name: "The Throne of Bones",
      description: "Face the Lich King.",
      introText: "The final battle awaits...",
      minRounds: 3, maxRounds: 4,
      monsterTiers: ["tier2", "tier3"], monsterLevel: 3, eliteChance: 0.3,
      bossId: "lich-king", bossLevel: 3,
    },
  ],

  finalBossId: "lich-king",
  finalBossName: "Aldric the Undying",
  finalBossDifficulty: { hpMultiplier: 1.75, damageMultiplier: 1.4, eliteModifier: "regenerating" },
  finalBossIntroText: `Aldric rises from his throne, dark energy swirling.
"Fools! You dare challenge the eternal king?"`,
};

export const CAMPAIGNS = [CAMPAIGN_FALLEN_KINGDOM, /* 2 more */];
```

---

## State Management

### Campaign Slice (`src/store/slices/campaignSlice.ts`)

```typescript
interface CampaignState {
  availableCampaigns: CampaignDefinition[];
  activeCampaign: CampaignDefinition | null;
  campaignProgress: CampaignProgress | null;
  completedCampaigns: string[];  // Global completion tracking
}

interface CampaignActions {
  loadCampaigns: () => void;
  startCampaign: (campaignId: string) => void;
  startQuest: () => void;
  completeQuest: () => void;
  failCampaign: () => void;      // Party wipe
  advanceToNextQuest: () => void;
  completeCampaign: () => void;
}
```

### Persistence

- Store `completedCampaigns[]` in localStorage (global)
- Store active `campaignProgress` in localStorage
- On party wipe: clear progress, redirect to campaign select

---

## Combat Flow Modifications

### New: `startCampaignRound()` in combatSlice

```typescript
startCampaignRound: () => {
  const { activeCampaign, campaignProgress } = get();
  const quest = activeCampaign.quests[campaignProgress.currentQuestIndex];
  const isBossRound = currentRound === totalRounds;
  const isFinalBoss = isLastQuest && isBossRound;

  let monsters;
  if (isBossRound) {
    monsters = [createBoss(quest, isFinalBoss ? activeCampaign.finalBossDifficulty : null)];
  } else {
    monsters = generateQuestMonsters(quest);
  }

  set({ monsters, round: currentRound, maxRounds: totalRounds });
  get().drawCards();
}
```

### Modify: `nextRound()` in combatSlice

```typescript
// After round victory:
if (campaignProgress) {
  if (isBossRound) {
    get().completeQuest();  // -> questComplete screen
  } else {
    // Advance round within quest
    set({ campaignProgress: { ...progress, currentRound: currentRound + 1 } });
    set({ currentScreen: "roundComplete" });
  }
  return;
}
```

### Modify: Defeat handling

```typescript
// On party wipe:
if (campaignProgress) {
  get().failCampaign();  // Clears progress, shows defeat screen
  return;
}
```

---

## UI Flow

```
Title Screen
    |
    +-- [Campaigns] --> Campaign Select Screen
                            |
                            v
                    Campaign Intro Screen (story)
                            |
                            v
                    +-- Quest Loop --+
                    |                |
                    v                |
              Quest Intro Screen     |
                    |                |
                    v                |
              Combat Rounds          |
                    |                |
                    v                |
              Boss Fight             |
                    |                |
                    v                |
              Quest Complete --------+
                    |
                    v (if last quest)
            Campaign Victory Screen
```

---

## Implementation Order

### Phase 1: Foundation
1. Create `src/types/campaign.ts` with type definitions
2. Create `src/data/campaigns.ts` with 2-3 campaigns
3. Add ScreenTypes to `src/types/index.ts`

### Phase 2: State Management
4. Create `src/store/slices/campaignSlice.ts`
5. Add to `src/store/types.ts`
6. Integrate into `src/store/gameStore.ts`
7. Update `src/store/initialState.ts`

### Phase 3: Combat Integration
8. Add `startCampaignRound()` to `combatSlice.ts`
9. Modify `nextRound()` for campaign awareness
10. Modify defeat handling for campaign failure

### Phase 4: Screens
11. Create `CampaignSelectScreen.tsx`
12. Create `CampaignIntroScreen.tsx`
13. Create `QuestIntroScreen.tsx`
14. Create `QuestCompleteScreen.tsx`
15. Create `CampaignVictoryScreen.tsx`

### Phase 5: Integration
16. Update `App.tsx` with new screen routing
17. Add "Campaigns" button to `TitleScreen.tsx`
18. Test full campaign flow

---

## Initial Campaigns (2-3)

1. **The Fallen Kingdom** (Normal) - Undead theme, Lich King final boss
2. **Infernal Depths** (Hard) - Demon theme, Demon Lord final boss
3. **Dragon's Domain** (Nightmare) - Dragon theme, Ancient Dragon final boss

Each with unique quest chains, lore, and escalating difficulty.
