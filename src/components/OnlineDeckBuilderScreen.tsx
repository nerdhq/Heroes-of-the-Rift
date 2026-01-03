import { useState, useEffect, useMemo } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import { Check, HelpCircle, Users, Loader2, Crown } from "lucide-react";
import { HelpModal } from "./HelpModal";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";
import type { Card, ClassType } from "../types";
import { getCardsByClass, getAllCards } from "../data/cards";
import { getMonstersForRound } from "../data/monsters";
import { getEnvironmentForRound } from "../data/environments";

export function OnlineDeckBuilderScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isDeckConfirmed, setIsDeckConfirmed] = useState(false);

  // Store selectors
  const user = useGameStore((state) => state.user);
  const currentGameId = useGameStore((state) => state.currentGameId);
  const lobbyPlayers = useGameStore((state) => state.lobbyPlayers);
  const isHost = useGameStore((state) => state.isHost);
  const setScreen = useGameStore((state) => state.setScreen);
  const setLobbyPlayers = useGameStore((state) => state.setLobbyPlayers);
  const initializeOnlineGame = useGameStore((state) => state.initializeOnlineGame);
  const activeChampion = useGameStore((state) => state.activeChampion);

  // Find my player data
  const myPlayer = useMemo(
    () => lobbyPlayers.find((p) => p.user_id === user?.id),
    [lobbyPlayers, user?.id]
  );

  const myClass = myPlayer?.class_type as ClassType | undefined;
  const myHeroName = myPlayer?.hero_name || "Hero";
  const classConfig = myClass ? CLASS_CONFIGS[myClass] : null;

  // Get cards available from the champion's owned cards
  const availableCards = useMemo(() => {
    // Use the champion's owned cards if available, otherwise fall back to class cards
    if (activeChampion && activeChampion.ownedCards.length > 0) {
      return activeChampion.ownedCards;
    }
    // Fallback to class cards if no champion or no owned cards
    if (!myClass) return [];
    return getCardsByClass(myClass);
  }, [activeChampion, myClass]);

  // Load my existing deck selection if any
  useEffect(() => {
    if (myPlayer?.deck && Array.isArray(myPlayer.deck) && myPlayer.deck.length > 0) {
      setSelectedCards(myPlayer.deck as string[]);
      setIsDeckConfirmed(myPlayer.deck_confirmed || false);
    }
  }, [myPlayer?.deck, myPlayer?.deck_confirmed]);

  // Subscribe to player updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !currentGameId) return;

    const client = getSupabase();
    const channel = client
      .channel(`deck_building:${currentGameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${currentGameId}`,
        },
        async () => {
          // Refetch all players
          const { data: players } = await client
            .from("game_players")
            .select("*")
            .eq("game_id", currentGameId)
            .order("player_index");

          if (players) {
            setLobbyPlayers(players);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${currentGameId}`,
        },
        async (payload) => {
          const game = payload.new as { status: string };
          if (game.status === "in_progress") {
            // Initialize local game state from Supabase data
            await initializeOnlineGame();
            setScreen("game");
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [currentGameId, setLobbyPlayers, setScreen, initializeOnlineGame]);

  const toggleCardSelection = (cardId: string) => {
    if (isDeckConfirmed) return;

    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length < 5) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  const handleConfirmDeck = async () => {
    if (!isSupabaseConfigured() || !currentGameId || !user || selectedCards.length !== 5) return;

    setIsSubmitting(true);

    try {
      const client = getSupabase();
      await client
        .from("game_players")
        .update({
          deck: selectedCards,
          deck_confirmed: true,
        })
        .eq("game_id", currentGameId)
        .eq("user_id", user.id);

      setIsDeckConfirmed(true);
    } catch (error) {
      console.error("Failed to confirm deck:", error);
    }

    setIsSubmitting(false);
  };

  const handleStartGame = async () => {
    if (!isSupabaseConfigured() || !currentGameId || !isHost) return;

    setIsSubmitting(true);

    try {
      const client = getSupabase();

      // Generate the initial game state (monsters, environment) on the host
      // This ensures all players get the same monsters
      const initialMonsters = getMonstersForRound(1);
      const initialEnvironment = getEnvironmentForRound(1);

      // Roll initial intents for monsters
      const monstersWithIntents = initialMonsters.map((monster) => {
        if (monster.abilities.length > 0) {
          const randomAbility = monster.abilities[Math.floor(Math.random() * monster.abilities.length)];
          return { ...monster, intent: randomAbility };
        }
        return monster;
      });

      // Create or update the game_state with initial values
      await client
        .from("game_state")
        .upsert({
          game_id: currentGameId,
          phase: "DRAW",
          current_player_index: 0,
          turn: 1,
          round: 1,
          max_rounds: 6,
          environment: initialEnvironment,
          monsters: monstersWithIntents,
          selected_card_id: null,
          selected_target_id: null,
          drawn_cards: [],
          log: [],
          version: 1,
        });

      // Now update game status to trigger all clients
      await client
        .from("games")
        .update({ status: "in_progress" })
        .eq("id", currentGameId);
    } catch (error) {
      console.error("Failed to start game:", error);
    }

    setIsSubmitting(false);
  };

  const getClassIcon = (classType: ClassType): string => {
    const icons: Record<ClassType, string> = {
      warrior: "⚔️",
      rogue: "🗡️",
      paladin: "🛡️",
      mage: "🔮",
      priest: "✨",
      bard: "🎵",
      archer: "🏹",
      barbarian: "🪓",
    };
    return icons[classType];
  };

  const getRarityColor = (rarity: Card["rarity"]): string => {
    const colors = {
      common: "border-stone-500 bg-stone-800",
      uncommon: "border-green-500 bg-green-900/30",
      rare: "border-blue-500 bg-blue-900/30",
      legendary: "border-amber-500 bg-amber-900/30",
    };
    return colors[rarity];
  };

  const getRarityTextColor = (rarity: Card["rarity"]): string => {
    const colors = {
      common: "text-stone-400",
      uncommon: "text-green-400",
      rare: "text-blue-400",
      legendary: "text-amber-400",
    };
    return colors[rarity];
  };

  // Check if all players have confirmed their decks
  const allDecksConfirmed = lobbyPlayers.length > 0 && lobbyPlayers.every((p) => p.deck_confirmed);
  const confirmedCount = lobbyPlayers.filter((p) => p.deck_confirmed).length;

  if (!myClass || !classConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8 relative">
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 z-10 bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
        title="Game Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-100 mb-2">
            Build {myHeroName}'s Deck
          </h1>
          <div className="flex items-center justify-center gap-2 text-stone-400">
            <span style={{ color: classConfig.color }} className="font-bold">
              {getClassIcon(myClass)} {classConfig.name}
            </span>
          </div>
        </div>

        {/* Party Status */}
        <div className="text-center mb-4">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {confirmedCount} / {lobbyPlayers.length} Decks Confirmed
          </span>
        </div>

        {/* Party Members Progress */}
        <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700">
          <h3 className="text-lg font-bold text-amber-100 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Party Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {lobbyPlayers.map((player) => {
              const isMe = player.user_id === user?.id;
              const deckLength = Array.isArray(player.deck) ? player.deck.length : 0;

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border ${
                    isMe
                      ? "border-amber-500 bg-amber-900/20"
                      : player.deck_confirmed
                      ? "border-green-500 bg-green-900/20"
                      : "border-stone-600 bg-stone-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {player.player_index === 0 && (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                    <span className={`font-medium ${isMe ? "text-amber-400" : "text-stone-300"}`}>
                      {player.hero_name || `Player ${player.player_index + 1}`}
                      {isMe && " (You)"}
                    </span>
                  </div>
                  <div className="text-sm">
                    {player.class_type && (
                      <span className="text-stone-400">
                        {getClassIcon(player.class_type as ClassType)} {CLASS_CONFIGS[player.class_type as ClassType].name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs">
                    {player.deck_confirmed ? (
                      <span className="bg-green-600 text-green-100 px-2 py-0.5 rounded">
                        Deck Ready
                      </span>
                    ) : (
                      <span className="text-stone-500">
                        {deckLength}/5 cards selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Selection */}
        {!isDeckConfirmed ? (
          <>
            {/* Selected count */}
            <div className="text-center mb-8">
              <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
                {selectedCards.length} / 5 Cards Selected
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {availableCards.map((card) => {
                const isSelected = selectedCards.includes(card.id);

                return (
                  <button
                    key={card.id}
                    onClick={() => toggleCardSelection(card.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${getRarityColor(
                      card.rarity
                    )} ${
                      isSelected
                        ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900"
                        : ""
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-stone-900" />
                      </div>
                    )}

                    {/* Card name */}
                    <h3 className="text-lg font-bold text-amber-100 mb-1">
                      {card.name}
                    </h3>

                    {/* Rarity */}
                    <p
                      className={`text-xs uppercase mb-2 ${getRarityTextColor(
                        card.rarity
                      )}`}
                    >
                      {card.rarity}
                    </p>

                    {/* Description */}
                    <p className="text-stone-300 text-sm mb-3">
                      {card.description}
                    </p>

                    {/* Aggro */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-400">⚡ Aggro: {card.aggro}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm button */}
            <div className="text-center">
              <button
                onClick={handleConfirmDeck}
                disabled={selectedCards.length !== 5 || isSubmitting}
                className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
                  selectedCards.length === 5 && !isSubmitting
                    ? "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 transform hover:scale-105 shadow-lg"
                    : "bg-stone-700 text-stone-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </span>
                ) : (
                  "Confirm Deck"
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-green-400 text-2xl font-bold mb-4">
              ✓ Deck Confirmed!
            </div>
            <p className="text-stone-400 mb-8">
              Waiting for other players to finish building their decks...
            </p>

            {/* Show my selected cards */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-amber-100 mb-4">Your Deck</h3>
              <div className="grid grid-cols-5 gap-2">
                {selectedCards.map((cardId) => {
                  const card = getAllCards().find((c: Card) => c.id === cardId);
                  if (!card) return null;
                  return (
                    <div
                      key={cardId}
                      className={`p-2 rounded-lg border ${getRarityColor(card.rarity)}`}
                    >
                      <p className="text-sm font-medium text-amber-100">{card.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Start Game Button (Host only) */}
        {isHost && allDecksConfirmed && (
          <div className="text-center mt-8">
            <button
              onClick={handleStartGame}
              disabled={isSubmitting}
              className="px-8 py-4 rounded-lg font-bold text-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 transform hover:scale-105 shadow-lg shadow-amber-900/50 transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting...
                </span>
              ) : (
                "Start Adventure! ⚔️"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
