import { useState, useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS, AVAILABLE_CLASSES } from "../data/classes";
import { Check, Users, Loader2, HelpCircle, Crown } from "lucide-react";
import { HelpModal } from "./HelpModal";
import type { ClassType } from "../types";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";

export function OnlineClassSelectScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myClass, setMyClass] = useState<ClassType | null>(null);
  const [myHeroName, setMyHeroName] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Store selectors
  const profile = useGameStore((state) => state.profile);
  const user = useGameStore((state) => state.user);
  const currentGameId = useGameStore((state) => state.currentGameId);
  const lobbyPlayers = useGameStore((state) => state.lobbyPlayers);
  const isHost = useGameStore((state) => state.isHost);
  const setScreen = useGameStore((state) => state.setScreen);
  const setLobbyPlayers = useGameStore((state) => state.setLobbyPlayers);

  // Load my existing selection and pre-fill hero name
  useEffect(() => {
    const myPlayer = lobbyPlayers.find((p) => p.user_id === user?.id);
    if (myPlayer) {
      if (myPlayer.class_type) {
        setMyClass(myPlayer.class_type);
      }
      // Use player's stored hero_name if set, otherwise fall back to profile username
      if (myPlayer.hero_name) {
        setMyHeroName(myPlayer.hero_name);
      } else if (profile?.username) {
        setMyHeroName(profile.username);
      }
      setIsReady(myPlayer.is_ready);
    } else if (profile?.username && !myHeroName) {
      // No player data yet, use profile username
      setMyHeroName(profile.username);
    }
  }, [lobbyPlayers, user?.id, profile?.username]);

  // Subscribe to player updates
  useEffect(() => {
    if (!isSupabaseConfigured() || !currentGameId) return;

    const client = getSupabase();
    const channel = client
      .channel(`class_select:${currentGameId}`)
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
        (payload) => {
          const game = payload.new as { status: string };
          if (game.status === "deck_building") {
            setScreen("deckBuilder");
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [currentGameId, setLobbyPlayers, setScreen]);

  const handleSelectClass = async (classType: ClassType) => {
    if (!isSupabaseConfigured() || !currentGameId || !user) return;

    setMyClass(classType);
    setIsSubmitting(true);

    try {
      const client = getSupabase();
      await client
        .from("game_players")
        .update({
          class_type: classType,
          hero_name: myHeroName || profile?.username || `Player`,
        })
        .eq("game_id", currentGameId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Failed to update class:", error);
    }

    setIsSubmitting(false);
  };

  const handleUpdateHeroName = async (name: string) => {
    setMyHeroName(name);

    if (!isSupabaseConfigured() || !currentGameId || !user) return;

    try {
      const client = getSupabase();
      await client
        .from("game_players")
        .update({ hero_name: name })
        .eq("game_id", currentGameId)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Failed to update hero name:", error);
    }
  };

  const handleReady = async () => {
    if (!isSupabaseConfigured() || !currentGameId || !user || !myClass) return;

    setIsSubmitting(true);

    try {
      const client = getSupabase();
      await client
        .from("game_players")
        .update({
          is_ready: true,
          hero_name: myHeroName || profile?.username || `Player`,
        })
        .eq("game_id", currentGameId)
        .eq("user_id", user.id);

      setIsReady(true);
    } catch (error) {
      console.error("Failed to mark ready:", error);
    }

    setIsSubmitting(false);
  };

  const handleStartGame = async () => {
    if (!isSupabaseConfigured() || !currentGameId || !isHost) return;

    setIsSubmitting(true);

    try {
      const client = getSupabase();
      await client
        .from("games")
        .update({ status: "deck_building" })
        .eq("id", currentGameId);
    } catch (error) {
      console.error("Failed to start deck building:", error);
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

  // Check if all players are ready
  const allPlayersReady = lobbyPlayers.length > 0 && lobbyPlayers.every((p) => p.is_ready);
  const readyCount = lobbyPlayers.filter((p) => p.is_ready).length;

  // Get other players' selections (excluding self)
  const otherPlayers = lobbyPlayers.filter((p) => p.user_id !== user?.id);

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
            Choose Your Class
          </h1>
          <div className="flex items-center justify-center gap-2 text-stone-400">
            <Users className="w-5 h-5" />
            <span>Select your class for this adventure</span>
          </div>
        </div>

        {/* Ready Status */}
        <div className="text-center mb-4">
          <span className="bg-stone-800 text-amber-400 px-4 py-2 rounded-full font-bold">
            {readyCount} / {lobbyPlayers.length} Players Ready
          </span>
        </div>

        {/* Party Members Panel */}
        <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700">
          <h3 className="text-lg font-bold text-amber-100 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Party Members
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {lobbyPlayers.map((player) => {
              const isMe = player.user_id === user?.id;
              const hasClass = !!player.class_type;

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg border ${
                    isMe
                      ? "border-amber-500 bg-amber-900/20"
                      : player.is_ready
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
                    {hasClass ? (
                      <span className="text-green-400">
                        {getClassIcon(player.class_type!)} {CLASS_CONFIGS[player.class_type!].name}
                      </span>
                    ) : (
                      <span className="text-stone-500">Selecting...</span>
                    )}
                  </div>
                  {player.is_ready && (
                    <span className="inline-block mt-1 text-xs bg-green-600 text-green-100 px-2 py-0.5 rounded">
                      Ready
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Hero Name */}
        <div className="bg-stone-800/50 rounded-xl p-4 mb-6 border border-stone-700">
          <h3 className="text-lg font-bold text-amber-100 mb-3">Your Hero Name</h3>
          <input
            type="text"
            value={myHeroName}
            onChange={(e) => handleUpdateHeroName(e.target.value)}
            placeholder="Enter your hero name..."
            className="w-full max-w-xs bg-stone-700 border border-stone-600 rounded px-3 py-2 text-amber-100 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            maxLength={20}
            disabled={isReady}
          />
        </div>

        {/* Class grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {AVAILABLE_CLASSES.map((classType) => {
            const config = CLASS_CONFIGS[classType];
            const isSelected = myClass === classType;
            const isUsedByOther = otherPlayers.some((p) => p.class_type === classType);

            return (
              <button
                key={classType}
                onClick={() => !isReady && !isUsedByOther && handleSelectClass(classType)}
                disabled={isReady || isUsedByOther}
                className={`relative p-6 rounded-xl border-2 transition-all transform ${
                  isReady || isUsedByOther ? "" : "hover:scale-105"
                } ${
                  isSelected
                    ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30"
                    : isUsedByOther
                    ? "border-stone-700 bg-stone-900/50 opacity-50 cursor-not-allowed"
                    : "border-stone-700 bg-stone-800/50 hover:border-stone-600"
                }`}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-amber-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-stone-900" />
                  </div>
                )}

                {/* Taken indicator */}
                {isUsedByOther && (
                  <div className="absolute top-3 right-3 bg-stone-600 rounded-full px-2 py-1 text-xs text-stone-300">
                    Taken
                  </div>
                )}

                {/* Class icon */}
                <div className="text-5xl mb-4">{getClassIcon(classType)}</div>

                {/* Class name */}
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: isUsedByOther ? "#78716c" : config.color }}
                >
                  {config.name}
                </h3>

                {/* Description */}
                <p className="text-stone-400 text-sm mb-4">{config.description}</p>

                {/* Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">❤️ {config.baseHp} HP</span>
                  <span className="text-blue-400">⚡ {config.resourceName}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {!isReady ? (
            <button
              onClick={handleReady}
              disabled={!myClass || isSubmitting}
              className={`px-8 py-4 rounded-lg font-bold text-xl transition-all ${
                myClass && !isSubmitting
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
                "I'm Ready!"
              )}
            </button>
          ) : (
            <div className="text-green-400 font-medium">
              Waiting for other players...
            </div>
          )}

          {isHost && allPlayersReady && (
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
                "Start Deck Building →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
