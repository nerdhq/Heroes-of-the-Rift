import type { SliceCreator, UserDataActions } from "../types";
import type { Card } from "../../types";
import { generateId } from "../utils";

const USER_DATA_KEY = "dungeon-crawler-user-data";

export const createUserDataSlice: SliceCreator<UserDataActions> = (set, get) => ({
  addUserGold: (amount: number) => {
    const { userData } = get();
    const currentGold = userData?.gold ?? 0;
    const currentOwnedCards = userData?.ownedCards ?? [];
    const newUserData = {
      gold: currentGold + amount,
      ownedCards: currentOwnedCards,
    };
    set({ userData: newUserData });
    get().saveUserData();
  },

  spendUserGold: (amount: number) => {
    const { userData } = get();
    const currentGold = userData?.gold ?? 0;
    if (currentGold < amount) return false;
    
    const newUserData = {
      gold: currentGold - amount,
      ownedCards: userData?.ownedCards ?? [],
    };
    set({ userData: newUserData });
    get().saveUserData();
    return true;
  },

  purchaseCardForCollection: (card: Card) => {
    const { userData } = get();
    const currentGold = userData?.gold ?? 0;
    const currentOwnedCards = userData?.ownedCards ?? [];
    const cardPrice = getCardPrice(card.rarity);
    
    if (currentGold < cardPrice) return false;
    
    // Create a unique copy of the card for the collection
    const purchasedCard: Card = {
      ...card,
      id: `${card.id}-owned-${generateId()}`,
    };
    
    const newUserData = {
      gold: currentGold - cardPrice,
      ownedCards: [...currentOwnedCards, purchasedCard],
    };
    set({ userData: newUserData });
    get().saveUserData();
    return true;
  },

  loadUserData: () => {
    try {
      const saved = localStorage.getItem(USER_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          userData: {
            gold: parsed.gold || 0,
            ownedCards: parsed.ownedCards || [],
          },
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  },

  saveUserData: () => {
    try {
      const { userData } = get();
      const dataToSave = {
        gold: userData?.gold ?? 0,
        ownedCards: userData?.ownedCards ?? [],
      };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  },
});

// Helper function for card prices
const getCardPrice = (rarity: Card["rarity"]): number => {
  const prices: Record<Card["rarity"], number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    legendary: 100,
  };
  return prices[rarity];
};
