import type { SliceCreator, PlayersActions } from "../types";
import { getCardsByClass } from "../../data/cards";
import { createPlayer, generateId, selectDeckBuildingCards } from "../utils";

export const createPlayersSlice: SliceCreator<PlayersActions> = (set, get) => ({
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
    const { selectedClasses, userData } = get();
    if (selectedClasses.length === 0) return;

    const firstClass = selectedClasses[0];
    const allCards = getCardsByClass(firstClass);
    const randomCards = selectDeckBuildingCards(allCards, 8);
    
    // Add owned cards for this class from user's collection
    const ownedClassCards = (userData?.ownedCards ?? []).filter(
      (card) => card.class === firstClass
    );
    
    // Combine random cards with owned cards (avoiding duplicates by name)
    const randomCardNames = new Set(randomCards.map((c) => c.name));
    const uniqueOwnedCards = ownedClassCards.filter(
      (c) => !randomCardNames.has(c.name)
    );
    const availableCards = [...randomCards, ...uniqueOwnedCards];

    set({
      currentScreen: "deckBuilder",
      deckBuildingPlayerIndex: 0,
      availableCards,
      selectedDeckCards: [],
      players: [],
    });
  },

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

    const classType = selectedClasses[deckBuildingPlayerIndex];
    const heroName =
      heroNames[deckBuildingPlayerIndex] ||
      `Hero ${deckBuildingPlayerIndex + 1}`;
    const deck = availableCards
      .filter((card) => selectedDeckCards.includes(card.id))
      .map((card) => ({
        ...card,
        id: `${card.id}-${deckBuildingPlayerIndex}-${generateId()}`,
      }));
    const newPlayer = createPlayer(
      `player-${deckBuildingPlayerIndex}`,
      heroName,
      classType,
      deck
    );

    const updatedPlayers = [...players, newPlayer];

    const nextIndex = deckBuildingPlayerIndex + 1;
    if (nextIndex < selectedClasses.length) {
      const { userData } = get();
      const nextClass = selectedClasses[nextIndex];
      const allNextCards = getCardsByClass(nextClass);
      const randomCards = selectDeckBuildingCards(allNextCards, 8);
      
      // Add owned cards for this class from user's collection
      const ownedClassCards = (userData?.ownedCards ?? []).filter(
        (card) => card.class === nextClass
      );
      
      // Combine random cards with owned cards (avoiding duplicates by name)
      const randomCardNames = new Set(randomCards.map((c) => c.name));
      const uniqueOwnedCards = ownedClassCards.filter(
        (c) => !randomCardNames.has(c.name)
      );
      const nextAvailableCards = [...randomCards, ...uniqueOwnedCards];
      
      set({
        players: updatedPlayers,
        deckBuildingPlayerIndex: nextIndex,
        availableCards: nextAvailableCards,
        selectedDeckCards: [],
      });
    } else {
      set({
        players: updatedPlayers,
        currentScreen: "game",
      });
      get().startGame();
    }
  },

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
    set((state) => ({
      players: state.players.map((p) => {
        if (!p.isAlive) return p;
        let regen = 0;
        const hpPercent = p.hp / p.maxHp;
        switch (p.class) {
          case "mage":
            regen = 2;
            break;
          case "archer":
            break;
          case "barbarian":
            if (hpPercent < 0.25) regen = 3;
            else if (hpPercent < 0.5) regen = 2;
            else if (hpPercent < 0.75) regen = 1;
            break;
          default:
            break;
        }
        return {
          ...p,
          resource: Math.min(p.resource + regen, p.maxResource),
        };
      }),
    }));
  },
});
