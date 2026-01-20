import type { SliceCreator, RewardsActions } from "../types";
import type { Card } from "../../types";
import { getCardsByClass } from "../../data/cards";
import { generateId, selectWeightedRandomCards, getCardPrice } from "../utils";

export const createRewardsSlice: SliceCreator<RewardsActions> = (set, get) => ({
  startRewardPhase: () => {
    const { players, selectedClasses } = get();

    const firstAlivePlayer = players.find((p) => p.isAlive);
    if (!firstAlivePlayer) {
      get().nextRound();
      return;
    }

    const playerIndex = players.findIndex((p) => p.id === firstAlivePlayer.id);
    const playerClass = selectedClasses[playerIndex];
    const allClassCards = getCardsByClass(playerClass);

    const playerCardIds = new Set([
      ...firstAlivePlayer.deck.map((c) => c.id),
      ...firstAlivePlayer.discard.map((c) => c.id),
      ...firstAlivePlayer.hand.map((c) => c.id),
    ]);

    const availableRewards = allClassCards
      .filter((c: Card) => !playerCardIds.has(c.id))
      .slice(0, 3);

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

    const updatedPlayers = [...players];
    updatedPlayers[rewardPlayerIndex] = {
      ...updatedPlayers[rewardPlayerIndex],
      deck: [...updatedPlayers[rewardPlayerIndex].deck, selectedCard],
    };

    const nextAliveIndex = players.findIndex(
      (p, i) => i > rewardPlayerIndex && p.isAlive
    );

    if (nextAliveIndex !== -1) {
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
      set({ players: updatedPlayers });
      get().nextRound();
    }
  },

  skipReward: () => {
    const { players, rewardPlayerIndex, selectedClasses } = get();

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

  startShopPhase: () => {
    const { players, selectedClasses, round } = get();

    if (round <= 2) {
      get().nextRound();
      return;
    }

    const firstAlivePlayer = players.find((p) => p.isAlive);
    if (!firstAlivePlayer) {
      get().nextRound();
      return;
    }

    const playerIndex = players.findIndex((p) => p.id === firstAlivePlayer.id);
    const playerClass = selectedClasses[playerIndex];
    const allClassCards = getCardsByClass(playerClass);

    const playerCardNames = new Set([
      ...firstAlivePlayer.deck.map((c) => c.name),
      ...firstAlivePlayer.discard.map((c) => c.name),
      ...firstAlivePlayer.hand.map((c) => c.name),
    ]);

    const availableCards = allClassCards.filter(
      (c: Card) => !playerCardNames.has(c.name)
    );

    const shopCards = selectWeightedRandomCards(availableCards, 3);

    set({
      currentScreen: "cardShop",
      shopPlayerIndex: playerIndex,
      shopCards,
      selectedShopCardId: null,
    });
  },

  selectShopCard: (cardId) => {
    set({ selectedShopCardId: cardId });
  },

  purchaseShopCard: () => {
    const {
      players,
      shopPlayerIndex,
      shopCards,
      selectedShopCardId,
      selectedClasses,
    } = get();

    if (!selectedShopCardId) return;

    const selectedCard = shopCards.find((c) => c.id === selectedShopCardId);
    if (!selectedCard) return;

    const currentPlayer = players[shopPlayerIndex];
    const cardPrice = getCardPrice(selectedCard.rarity);

    if (currentPlayer.gold < cardPrice) {
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[shopPlayerIndex] = {
      ...updatedPlayers[shopPlayerIndex],
      gold: updatedPlayers[shopPlayerIndex].gold - cardPrice,
      deck: [
        ...updatedPlayers[shopPlayerIndex].deck,
        {
          ...selectedCard,
          id: `${selectedCard.id}-shop-${generateId()}`,
        },
      ],
    };

    const nextAliveIndex = players.findIndex(
      (p, i) => i > shopPlayerIndex && p.isAlive
    );

    if (nextAliveIndex !== -1) {
      const nextPlayerClass = selectedClasses[nextAliveIndex];
      const allClassCards = getCardsByClass(nextPlayerClass);
      const nextPlayer = updatedPlayers[nextAliveIndex];

      const playerCardNames = new Set([
        ...nextPlayer.deck.map((c) => c.name),
        ...nextPlayer.discard.map((c) => c.name),
        ...nextPlayer.hand.map((c) => c.name),
      ]);

      const availableCards = allClassCards.filter(
        (c: Card) => !playerCardNames.has(c.name)
      );

      const nextShopCards = selectWeightedRandomCards(availableCards, 3);

      set({
        players: updatedPlayers,
        shopPlayerIndex: nextAliveIndex,
        shopCards: nextShopCards,
        selectedShopCardId: null,
      });
    } else {
      set({ players: updatedPlayers });
      get().nextRound();
    }
  },

  skipShop: () => {
    const { players, shopPlayerIndex, selectedClasses } = get();

    const nextAliveIndex = players.findIndex(
      (p, i) => i > shopPlayerIndex && p.isAlive
    );

    if (nextAliveIndex !== -1) {
      const nextPlayerClass = selectedClasses[nextAliveIndex];
      const allClassCards = getCardsByClass(nextPlayerClass);
      const nextPlayer = players[nextAliveIndex];

      const playerCardNames = new Set([
        ...nextPlayer.deck.map((c) => c.name),
        ...nextPlayer.discard.map((c) => c.name),
        ...nextPlayer.hand.map((c) => c.name),
      ]);

      const availableCards = allClassCards.filter(
        (c: Card) => !playerCardNames.has(c.name)
      );

      const nextShopCards = selectWeightedRandomCards(availableCards, 3);

      set({
        shopPlayerIndex: nextAliveIndex,
        shopCards: nextShopCards,
        selectedShopCardId: null,
      });
    } else {
      get().nextRound();
    }
  },

  continueFromRoundComplete: (cardSelections: Record<number, string>) => {
    const { players, userData, activeChampion, selectedClasses } = get();
    const updatedPlayers = [...players];

    // Add selected cards to each player's deck
    for (const [playerIndexStr, cardId] of Object.entries(cardSelections)) {
      const playerIndex = parseInt(playerIndexStr);
      const player = updatedPlayers[playerIndex];
      if (!player) continue;

      // Check if this player is the active champion (first player in solo champion mode)
      const isChampionPlayer = 
        playerIndex === 0 && 
        activeChampion && 
        selectedClasses.length === 1 && 
        selectedClasses[0] === activeChampion.class;

      // Find the card in owned cards (use champion's cards if playing as champion)
      const ownedCards = isChampionPlayer 
        ? activeChampion.ownedCards 
        : (userData?.ownedCards ?? []);
      const card = ownedCards.find((c) => c.id === cardId);
      if (!card) continue;

      // Add card to player's deck with unique ID
      updatedPlayers[playerIndex] = {
        ...player,
        deck: [
          ...player.deck,
          {
            ...card,
            id: `${card.id}-added-${Math.random().toString(36).substring(2, 9)}`,
          },
        ],
      };
    }

    set({
      players: updatedPlayers,
      roundGoldEarned: 0,
      currentScreen: "game",
    });

    // Continue to start the next round - use campaign round if in campaign mode
    if (get().campaignProgress) {
      get().startCampaignRound();
    } else {
      get().startRound();
    }
  },
});
