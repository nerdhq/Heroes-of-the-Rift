import type { SliceCreator, ProgressionActions, ProgressionState } from "../types";
import type {
  Champion,
  PlayerAccount,
  CharacterAttributes,
  ClassType,
  Card,
  ChampionStats,
} from "../../types";
import { generateId } from "../utils";
import { getCardsByClass } from "../../data/cards";
import { getSupabase } from "../../lib/supabase";
import type { ChampionRow } from "../../lib/database.types";

const PROGRESSION_KEY = "heroes-progression";

// Convert database row to Champion type
const rowToChampion = (row: ChampionRow): Champion => ({
  id: row.id,
  name: row.name,
  class: row.class_type,
  createdAt: new Date(row.created_at).getTime(),
  level: row.level,
  xp: row.xp,
  xpToNextLevel: row.xp_to_next_level,
  unspentStatPoints: row.unspent_stat_points,
  attributes: row.attributes,
  gold: row.gold,
  ownedCards: row.owned_cards,
  stats: row.stats,
});

// Default attributes for new champions
const DEFAULT_ATTRIBUTES: CharacterAttributes = {
  STR: 10,
  AGI: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  LCK: 10,
};

// Default stats for new champions
const DEFAULT_STATS: ChampionStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  monstersKilled: 0,
  bossesKilled: 0,
  totalDamageDealt: 0,
  totalHealingDone: 0,
  totalGoldEarned: 0,
  roundsCompleted: 0,
  deaths: 0,
};

// Stat soft cap - costs double above this
const STAT_SOFT_CAP = 50;
const STAT_HARD_CAP = 99;

// Generate starter cards for a specific class
const generateStarterCardsForClass = (classType: ClassType): Card[] => {
  const classCards = getCardsByClass(classType);

  // Filter to common and uncommon cards
  const commonUncommonCards = classCards.filter(
    (card: Card) => card.rarity === "common" || card.rarity === "uncommon"
  );

  // Get rare cards for this class
  const rareCards = classCards.filter((card: Card) => card.rarity === "rare");

  const starterCards: Card[] = [];
  const usedCardNames = new Set<string>();

  // 50% chance to include a rare card
  const includeRare = Math.random() < 0.5;
  if (includeRare && rareCards.length > 0) {
    const shuffledRares = [...rareCards].sort(() => Math.random() - 0.5);
    const rareCard = shuffledRares[0];
    starterCards.push({
      ...rareCard,
      id: `${rareCard.id}-starter-${generateId()}`,
    });
    usedCardNames.add(rareCard.name);
  }

  // Fill the rest with common/uncommon cards (shuffled randomly)
  const shuffledCommonUncommon = [...commonUncommonCards].sort(
    () => Math.random() - 0.5
  );

  for (const card of shuffledCommonUncommon) {
    if (starterCards.length >= 8) break;
    if (usedCardNames.has(card.name)) continue;

    starterCards.push({
      ...card,
      id: `${card.id}-starter-${generateId()}`,
    });
    usedCardNames.add(card.name);
  }

  return starterCards;
};

// Create a new champion
const createNewChampion = (name: string, classType: ClassType): Champion => ({
  id: generateId(),
  name,
  class: classType,
  createdAt: Date.now(),
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  unspentStatPoints: 0,
  attributes: { ...DEFAULT_ATTRIBUTES },
  gold: 50, // Starting gold
  ownedCards: generateStarterCardsForClass(classType),
  stats: { ...DEFAULT_STATS },
});

// Create default player account
const createDefaultAccount = (): PlayerAccount => ({
  id: generateId(),
  champions: [],
  maxChampionSlots: 3,
  activeChampionId: null,
  createdAt: Date.now(),
  lastPlayedAt: Date.now(),
});

export const createProgressionSlice: SliceCreator<ProgressionActions> = (
  set,
  get
) => ({
  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  loadProgression: async () => {
    const { user } = get();

    // If authenticated, load from Supabase
    if (user) {
      try {
        // Load profile with active champion
        const { data: profile } = await getSupabase()
          .from("profiles")
          .select("active_champion_id, max_champion_slots")
          .eq("id", user.id)
          .single();

        // Load all champions for this user
        const { data: championRows, error } = await getSupabase()
          .from("champions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const champions: Champion[] = (championRows || []).map(rowToChampion);
        const activeChampion = profile?.active_champion_id
          ? champions.find((c: Champion) => c.id === profile.active_champion_id) || null
          : null;

        const account: PlayerAccount = {
          id: user.id,
          champions,
          maxChampionSlots: profile?.max_champion_slots || 3,
          activeChampionId: profile?.active_champion_id || null,
          createdAt: Date.now(),
          lastPlayedAt: Date.now(),
        };

        set({
          playerAccount: account,
          activeChampion,
        });
        return;
      } catch (error) {
        console.error("Failed to load from Supabase:", error);
      }
    }

    // Fallback to localStorage for offline play
    try {
      const saved = localStorage.getItem(PROGRESSION_KEY);
      if (saved) {
        const account: PlayerAccount = JSON.parse(saved);
        const activeChampion = account.activeChampionId
          ? account.champions.find((c) => c.id === account.activeChampionId) ||
            null
          : null;

        set({
          playerAccount: account,
          activeChampion,
        });
      } else {
        const newAccount = createDefaultAccount();
        set({
          playerAccount: newAccount,
          activeChampion: null,
        });
        localStorage.setItem(PROGRESSION_KEY, JSON.stringify(newAccount));
      }
    } catch (error) {
      console.error("Failed to load progression:", error);
      const newAccount = createDefaultAccount();
      set({
        playerAccount: newAccount,
        activeChampion: null,
      });
    }
  },

  saveProgression: async () => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    // If authenticated, Supabase handles persistence automatically
    // Just update lastPlayedAt in localStorage as backup
    if (!user) {
      try {
        playerAccount.lastPlayedAt = Date.now();
        localStorage.setItem(PROGRESSION_KEY, JSON.stringify(playerAccount));
      } catch (error) {
        console.error("Failed to save progression:", error);
      }
    }
  },

  // ============================================
  // CHAMPION MANAGEMENT
  // ============================================

  createChampion: async (name: string, classType: ClassType): Promise<Champion | null> => {
    const { playerAccount, user } = get();
    if (!playerAccount) return null;

    // Check slot limit
    if (playerAccount.champions.length >= playerAccount.maxChampionSlots) {
      console.warn("Maximum champion slots reached");
      return null;
    }

    const starterCards = generateStarterCardsForClass(classType);

    // If authenticated, create in Supabase
    if (user) {
      try {
        const { data: championId, error } = await getSupabase().rpc("create_champion", {
          p_name: name,
          p_class_type: classType,
          p_starter_cards: starterCards,
        });

        if (error) throw error;

        // Fetch the created champion
        const { data: row } = await getSupabase()
          .from("champions")
          .select("*")
          .eq("id", championId)
          .single();

        if (!row) throw new Error("Champion not found after creation");

        const newChampion = rowToChampion(row);
        const updatedAccount: PlayerAccount = {
          ...playerAccount,
          champions: [...playerAccount.champions, newChampion],
          activeChampionId: newChampion.id,
        };

        set({
          playerAccount: updatedAccount,
          activeChampion: newChampion,
        });

        return newChampion;
      } catch (error) {
        console.error("Failed to create champion in Supabase:", error);
        return null;
      }
    }

    // Offline mode - create locally
    const newChampion = createNewChampion(name, classType);
    const updatedAccount: PlayerAccount = {
      ...playerAccount,
      champions: [...playerAccount.champions, newChampion],
      activeChampionId: newChampion.id,
    };

    set({
      playerAccount: updatedAccount,
      activeChampion: newChampion,
    });
    get().saveProgression();

    return newChampion;
  },

  deleteChampion: async (championId: string): Promise<boolean> => {
    const { playerAccount, user } = get();
    if (!playerAccount) return false;

    const championIndex = playerAccount.champions.findIndex(
      (c) => c.id === championId
    );
    if (championIndex === -1) return false;

    // If authenticated, delete from Supabase
    if (user) {
      try {
        const { error } = await getSupabase()
          .from("champions")
          .delete()
          .eq("id", championId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (error) {
        console.error("Failed to delete champion from Supabase:", error);
        return false;
      }
    }

    const updatedChampions = playerAccount.champions.filter(
      (c) => c.id !== championId
    );

    // If deleting active champion, clear selection
    const wasActive = playerAccount.activeChampionId === championId;
    const updatedAccount: PlayerAccount = {
      ...playerAccount,
      champions: updatedChampions,
      activeChampionId: wasActive ? null : playerAccount.activeChampionId,
    };

    set({
      playerAccount: updatedAccount,
      activeChampion: wasActive ? null : get().activeChampion,
    });

    if (!user) {
      get().saveProgression();
    }

    return true;
  },

  selectChampion: async (championId: string) => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return;

    // If authenticated, update active champion in Supabase
    if (user) {
      try {
        await getSupabase()
          .from("profiles")
          .update({ active_champion_id: championId })
          .eq("id", user.id);
      } catch (error) {
        console.error("Failed to update active champion:", error);
      }
    }

    const updatedAccount: PlayerAccount = {
      ...playerAccount,
      activeChampionId: championId,
    };

    set({
      playerAccount: updatedAccount,
      activeChampion: champion,
    });

    if (!user) {
      get().saveProgression();
    }
  },

  getActiveChampion: (): Champion | null => {
    return get().activeChampion;
  },

  // ============================================
  // GAME FLOW
  // ============================================

  startChampionGame: () => {
    const { activeChampion } = get();
    if (!activeChampion) return;

    // Reset game state and ensure we're in local mode
    set({
      selectedClasses: [activeChampion.class],
      heroNames: [activeChampion.name],
      players: [], // Clear any existing players
      monsters: [], // Clear monsters
      isOnline: false, // Ensure local mode
      turn: 1,
      level: 1,
      round: 1,
      phase: "DRAW",
    });

    // Trigger class confirmation flow
    get().confirmClassSelection();
  },

  // ============================================
  // STAT ALLOCATION
  // ============================================

  getStatCost: (currentValue: number): number => {
    if (currentValue >= STAT_HARD_CAP) return Infinity;
    if (currentValue >= STAT_SOFT_CAP) return 2;
    return 1;
  },

  allocateStatPoint: async (stat: keyof CharacterAttributes): Promise<boolean> => {
    const { playerAccount, activeChampion, user } = get();
    if (!playerAccount || !activeChampion) return false;

    const currentValue = activeChampion.attributes[stat];
    const cost = get().getStatCost(currentValue);

    if (activeChampion.unspentStatPoints < cost) return false;
    if (currentValue >= STAT_HARD_CAP) return false;

    // If authenticated, use Supabase RPC
    if (user) {
      try {
        const { data, error } = await getSupabase().rpc("allocate_stat_point", {
          p_champion_id: activeChampion.id,
          p_stat: stat,
        });

        if (error) throw error;
        if (!data?.success) {
          console.error("Failed to allocate stat:", data?.error);
          return false;
        }

        // Update local state
        const updatedChampion: Champion = {
          ...activeChampion,
          unspentStatPoints: data.remaining_points,
          attributes: {
            ...activeChampion.attributes,
            [stat]: data.new_value,
          },
        };

        const updatedChampions = playerAccount.champions.map((c) =>
          c.id === updatedChampion.id ? updatedChampion : c
        );

        set({
          playerAccount: { ...playerAccount, champions: updatedChampions },
          activeChampion: updatedChampion,
        });

        return true;
      } catch (error) {
        console.error("Failed to allocate stat in Supabase:", error);
        return false;
      }
    }

    // Offline mode
    const updatedChampion: Champion = {
      ...activeChampion,
      unspentStatPoints: activeChampion.unspentStatPoints - cost,
      attributes: {
        ...activeChampion.attributes,
        [stat]: currentValue + 1,
      },
    };

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === updatedChampion.id ? updatedChampion : c
    );

    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: updatedChampion,
    });
    get().saveProgression();

    return true;
  },

  // ============================================
  // XP AND LEVELING
  // ============================================

  getXPForLevel: (level: number): number => {
    if (level <= 1) return 0;
    if (level <= 10) return Math.floor(100 * Math.pow(1.5, level - 2));
    if (level <= 20) return Math.floor(5000 + 1000 * (level - 10));
    return Math.floor(15000 + 2000 * (level - 20));
  },

  getStatPointsForLevel: (level: number): number => {
    if (level <= 10) return 3;
    if (level <= 20) return 2;
    return 1;
  },

  addXP: async (championId: string, amount: number) => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return;

    // If authenticated, use Supabase RPC
    if (user) {
      try {
        const { data, error } = await getSupabase().rpc("add_champion_xp", {
          p_champion_id: championId,
          p_xp_amount: amount,
        });

        if (error) throw error;
        if (!data?.success) {
          console.error("Failed to add XP:", data?.error);
          return;
        }

        // Update local state with server response
        const updatedChampion: Champion = {
          ...champion,
          xp: data.new_xp,
          level: data.new_level,
          xpToNextLevel: data.xp_to_next_level,
          unspentStatPoints: data.unspent_stat_points,
        };

        const updatedChampions = playerAccount.champions.map((c) =>
          c.id === championId ? updatedChampion : c
        );

        const isActive = get().activeChampion?.id === championId;
        set({
          playerAccount: { ...playerAccount, champions: updatedChampions },
          activeChampion: isActive ? updatedChampion : get().activeChampion,
        });
        return;
      } catch (error) {
        console.error("Failed to add XP in Supabase:", error);
      }
    }

    // Offline mode
    const updatedChampion: Champion = {
      ...champion,
      xp: champion.xp + amount,
    };

    // Check for level ups
    while (updatedChampion.xp >= updatedChampion.xpToNextLevel) {
      updatedChampion.xp -= updatedChampion.xpToNextLevel;
      updatedChampion.level += 1;
      updatedChampion.xpToNextLevel = get().getXPForLevel(
        updatedChampion.level + 1
      );
      updatedChampion.unspentStatPoints += get().getStatPointsForLevel(
        updatedChampion.level
      );
    }

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === championId ? updatedChampion : c
    );

    const isActive = get().activeChampion?.id === championId;
    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: isActive ? updatedChampion : get().activeChampion,
    });
    get().saveProgression();
  },

  checkLevelUp: (championId: string): boolean => {
    const { playerAccount } = get();
    if (!playerAccount) return false;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return false;

    return champion.xp >= champion.xpToNextLevel;
  },

  // ============================================
  // ECONOMY (PER-CHAMPION)
  // ============================================

  addChampionGold: async (championId: string, amount: number) => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return;

    const newGold = champion.gold + amount;
    const newStats = {
      ...champion.stats,
      totalGoldEarned: champion.stats.totalGoldEarned + amount,
    };

    // If authenticated, update in Supabase
    if (user) {
      try {
        await getSupabase()
          .from("champions")
          .update({ gold: newGold, stats: newStats })
          .eq("id", championId)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to add gold in Supabase:", error);
      }
    }

    const updatedChampion: Champion = {
      ...champion,
      gold: newGold,
      stats: newStats,
    };

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === championId ? updatedChampion : c
    );

    const isActive = get().activeChampion?.id === championId;
    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: isActive ? updatedChampion : get().activeChampion,
    });

    if (!user) {
      get().saveProgression();
    }
  },

  spendChampionGold: async (championId: string, amount: number): Promise<boolean> => {
    const { playerAccount, user } = get();
    if (!playerAccount) return false;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return false;

    if (champion.gold < amount) return false;

    const newGold = champion.gold - amount;

    // If authenticated, update in Supabase
    if (user) {
      try {
        await getSupabase()
          .from("champions")
          .update({ gold: newGold })
          .eq("id", championId)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to spend gold in Supabase:", error);
        return false;
      }
    }

    const updatedChampion: Champion = {
      ...champion,
      gold: newGold,
    };

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === championId ? updatedChampion : c
    );

    const isActive = get().activeChampion?.id === championId;
    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: isActive ? updatedChampion : get().activeChampion,
    });

    if (!user) {
      get().saveProgression();
    }

    return true;
  },

  addCardToChampion: async (championId: string, card: Card) => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return;

    // Create unique card ID
    const cardWithUniqueId: Card = {
      ...card,
      id: `${card.id}-earned-${generateId()}`,
    };

    const newOwnedCards = [...champion.ownedCards, cardWithUniqueId];

    // If authenticated, update in Supabase
    if (user) {
      try {
        await getSupabase()
          .from("champions")
          .update({ owned_cards: newOwnedCards })
          .eq("id", championId)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to add card in Supabase:", error);
      }
    }

    const updatedChampion: Champion = {
      ...champion,
      ownedCards: newOwnedCards,
    };

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === championId ? updatedChampion : c
    );

    const isActive = get().activeChampion?.id === championId;
    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: isActive ? updatedChampion : get().activeChampion,
    });

    if (!user) {
      get().saveProgression();
    }
  },

  // ============================================
  // STATS TRACKING
  // ============================================

  updateChampionStats: async (
    championId: string,
    stats: Partial<Champion["stats"]>
  ) => {
    const { playerAccount, user } = get();
    if (!playerAccount) return;

    const champion = playerAccount.champions.find((c) => c.id === championId);
    if (!champion) return;

    const newStats = {
      ...champion.stats,
      ...stats,
    };

    // If authenticated, update in Supabase
    if (user) {
      try {
        await getSupabase()
          .from("champions")
          .update({ stats: newStats })
          .eq("id", championId)
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Failed to update stats in Supabase:", error);
      }
    }

    const updatedChampion: Champion = {
      ...champion,
      stats: newStats,
    };

    const updatedChampions = playerAccount.champions.map((c) =>
      c.id === championId ? updatedChampion : c
    );

    const isActive = get().activeChampion?.id === championId;
    set({
      playerAccount: { ...playerAccount, champions: updatedChampions },
      activeChampion: isActive ? updatedChampion : get().activeChampion,
    });

    if (!user) {
      get().saveProgression();
    }
  },
});

// Initial state for progression
export const initialProgressionState: ProgressionState = {
  playerAccount: null,
  activeChampion: null,
};
