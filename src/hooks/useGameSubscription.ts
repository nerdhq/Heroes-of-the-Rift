import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { isSupabaseConfigured, getSupabase } from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook to manage realtime game state subscriptions
 * Subscribes to game_state and player_state changes
 */
export function useGameSubscription() {
  const channelRef = useRef<RealtimeChannel | null>(null);

  const currentGameId = useGameStore((state) => state.currentGameId);
  const isOnline = useGameStore((state) => state.isOnline);
  const setConnected = useGameStore((state) => state.setConnected);
  const handleStateUpdate = useGameStore((state) => state.handleStateUpdate);
  const syncState = useGameStore((state) => state.syncState);

  useEffect(() => {
    if (!isSupabaseConfigured() || !currentGameId || !isOnline) {
      return;
    }

    const client = getSupabase();

    // Clean up existing channel
    if (channelRef.current) {
      client.removeChannel(channelRef.current);
    }

    // Create new subscription
    const channel = client
      .channel(`game_state:${currentGameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_state",
          filter: `game_id=eq.${currentGameId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            handleStateUpdate(payload.new as Record<string, unknown>);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_state",
          filter: `game_id=eq.${currentGameId}`,
        },
        () => {
          // Refetch all player states when any change occurs
          syncState();
        }
      )
      .on("presence", { event: "sync" }, () => {
        setConnected(true);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
          // Initial sync
          syncState();
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        client.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setConnected(false);
    };
  }, [currentGameId, isOnline, setConnected, handleStateUpdate, syncState]);

  return {
    isSubscribed: channelRef.current !== null,
  };
}
