import type { SliceCreator, PlayersActions } from "../types";
import { createPlayer, generateId } from "../utils";

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
    const { selectedClasses, userData, activeChampion } = get();
    if (selectedClasses.length === 0) return;

    const firstClass = selectedClasses[0];

    // Check if we're playing with the active champion (solo mode)
    const isChampionSolo = activeChampion &&
      selectedClasses.length === 1 &&
      selectedClasses[0] === activeChampion.class;

    // Get owned cards for this class from champion or legacy userData
    const ownedClassCards = isChampionSolo
      ? activeChampion.ownedCards.filter((card) => card.class === firstClass)
      : (userData?.ownedCards ?? []).filter((card) => card.class === firstClass);

    // Use owned cards as the available cards for deck building
    const availableCards = [...ownedClassCards];

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
      activeChampion,
      userData,
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

    // Check if first player is the active champion (for stat scaling)
    const isChampionPlayer =
      deckBuildingPlayerIndex === 0 &&
      activeChampion &&
      selectedClasses.length === 1 &&
      selectedClasses[0] === activeChampion.class;

    const newPlayer = createPlayer(
      `player-${deckBuildingPlayerIndex}`,
      heroName,
      classType,
      deck,
      isChampionPlayer ? activeChampion : undefined
    );

    const updatedPlayers = [...players, newPlayer];

    const nextIndex = deckBuildingPlayerIndex + 1;
    if (nextIndex < selectedClasses.length) {
      const nextClass = selectedClasses[nextIndex];

      // Get owned cards for this class - check if it matches a champion
      const isNextChampion =
        activeChampion &&
        selectedClasses.length === 1 &&
        nextClass === activeChampion.class;

      const ownedClassCards = isNextChampion
        ? activeChampion.ownedCards.filter((card) => card.class === nextClass)
        : (userData?.ownedCards ?? []).filter((card) => card.class === nextClass);

      const nextAvailableCards = [...ownedClassCards];

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
      
      // Save deck to campaign progress if in campaign mode and deck not yet saved
      const { campaignProgress } = get();
      if (campaignProgress && campaignProgress.savedDeck.length === 0) {
        // Save the original card IDs (before unique ID generation) to campaign progress
        const originalCardIds = availableCards
          .filter((card) => selectedDeckCards.includes(card.id))
          .map((card) => card.id);
        
        const updatedProgress = {
          ...campaignProgress,
          savedDeck: originalCardIds,
        };
        
        set({ campaignProgress: updatedProgress });
        localStorage.setItem("campaignProgress", JSON.stringify(updatedProgress));
      }
      
      // Use campaign round start if in campaign mode, otherwise regular game start
      if (get().campaignProgress) {
        get().startCampaignRound();
      } else {
        get().startGame();
      }
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
