import { useEffect, useRef, useState } from "react";

// Import music assets
import forestTheme from "../assets/GameMusic_ForestTheme_24.mp3";

export type MusicTrack = "forest" | "none";

const TRACKS: Record<Exclude<MusicTrack, "none">, string> = {
  forest: forestTheme,
};

interface UseMusicOptions {
  volume?: number;
  loop?: boolean;
}

export function useMusic(track: MusicTrack = "none", options: UseMusicOptions = {}) {
  const { volume = 0.3, loop = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Clean up previous audio if track changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (track === "none") {
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(TRACKS[track]);
    audio.loop = loop;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Try to play (may be blocked by browser autoplay policy)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay was prevented, need user interaction
          setIsPlaying(false);
        });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [track, loop]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const play = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return {
    isPlaying,
    isMuted,
    play,
    pause,
    toggleMute,
  };
}
