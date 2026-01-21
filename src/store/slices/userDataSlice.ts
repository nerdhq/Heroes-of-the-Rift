import type { SliceCreator, UserDataActions } from "../types";
import type { Card, ClassType } from "../../types";
import { generateId } from "../utils";
import { getCardsByClass } from "../../data/cards";

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
        let ownedCards = parsed.ownedCards || [];
        
        // Check if user needs starter cards (no cards or less than expected per-class setup)
        // Expected: 8 cards per class = 64 cards minimum for starter set
        const needsStarterCards = ownedCards.length < 64;
        
        if (needsStarterCards) {
          // Generate new starter cards and merge with any existing purchased cards
          const starterCards = generateStarterCards();
          
          // Keep any cards that were purchased (not starter cards)
          const purchasedCards = ownedCards.filter(
            (card: Card) => !card.id.includes('-starter-')
          );
          
          ownedCards = [...starterCards, ...purchasedCards];
          
          set({
            userData: {
              gold: parsed.gold || 0,
              ownedCards,
            },
          });
          // Save the updated cards
          localStorage.setItem(USER_DATA_KEY, JSON.stringify({
            gold: parsed.gold || 0,
            ownedCards,
          }));
        } else {
          set({
            userData: {
              gold: parsed.gold || 0,
              ownedCards,
            },
          });
        }
      } else {
        // No saved data - create new user with starter cards
        const starterCards = generateStarterCards();
        const newUserData = {
          gold: 0,
          ownedCards: starterCards,
        };
        set({ userData: newUserData });
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUserData));
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

// Generate 8 starter cards PER CLASS: common/uncommon mix with 50% chance of a rare per class
const generateStarterCards = (): Card[] => {
  const allClasses: ClassType[] = [
    "warrior", "rogue", "paladin", "mage", "cleric", "bard", "archer", "barbarian"
  ];
  
  const starterCards: Card[] = [];
  
  for (const classType of allClasses) {
    const classCards = getCardsByClass(classType);
    
    // Filter to common and uncommon cards for this class
    const commonUncommonCards = classCards.filter(
      (card: Card) => card.rarity === "common" || card.rarity === "uncommon"
    );
    
    // Get rare cards for this class
    const rareCards = classCards.filter((card: Card) => card.rarity === "rare");
    
    const classStarterCards: Card[] = [];
    const usedCardNames = new Set<string>();
    
    // 50% chance to include a rare card for this class
    const includeRare = Math.random() < 0.5;
    if (includeRare && rareCards.length > 0) {
      const shuffledRares = [...rareCards].sort(() => Math.random() - 0.5);
      const rareCard = shuffledRares[0];
      classStarterCards.push({
        ...rareCard,
        id: `${rareCard.id}-starter-${generateId()}`,
      });
      usedCardNames.add(rareCard.name);
    }
    
    // Fill the rest with common/uncommon cards (shuffled randomly)
    const shuffledCommonUncommon = [...commonUncommonCards].sort(() => Math.random() - 0.5);
    
    for (const card of shuffledCommonUncommon) {
      if (classStarterCards.length >= 8) break;
      if (usedCardNames.has(card.name)) continue;
      
      classStarterCards.push({
        ...card,
        id: `${card.id}-starter-${generateId()}`,
      });
      usedCardNames.add(card.name);
    }
    
    starterCards.push(...classStarterCards);
  }
  
  return starterCards;
};
