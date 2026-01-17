import { FastForward, HelpCircle, LogOut, ScrollText, Volume2, VolumeX } from "lucide-react";
import type { GameSpeed } from "../../types";

interface TopControlsProps {
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  showBattleLog: boolean;
  isMuted?: boolean;
  onToggleSpeedSettings: () => void;
  onShowHelp: () => void;
  onShowQuitConfirm: () => void;
  onToggleBattleLog: () => void;
  onToggleMute?: () => void;
}

export function TopControls({
  gameSpeed,
  skipAnimations,
  showBattleLog,
  isMuted = false,
  onToggleSpeedSettings,
  onShowHelp,
  onShowQuitConfirm,
  onToggleBattleLog,
  onToggleMute,
}: TopControlsProps) {
  return (
    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex gap-1 sm:gap-2">
      {/* Speed Settings Button */}
      <button
        onClick={onToggleSpeedSettings}
        className={`bg-stone-800 hover:bg-stone-700 p-1.5 sm:p-2 rounded-full border transition-colors ${
          gameSpeed !== "normal" || skipAnimations
            ? "text-green-400 border-green-600"
            : "text-amber-400 border-stone-600"
        }`}
        title="Speed Settings"
      >
        <FastForward className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Music Mute Button */}
      {onToggleMute && (
        <button
          onClick={onToggleMute}
          className={`bg-stone-800 hover:bg-stone-700 p-1.5 sm:p-2 rounded-full border transition-colors ${
            isMuted
              ? "text-stone-500 border-stone-600"
              : "text-amber-400 border-stone-600"
          }`}
          title={isMuted ? "Unmute Music" : "Mute Music"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      )}

      {/* Help Button - hidden on mobile, accessible via menu */}
      <button
        onClick={onShowHelp}
        className="hidden sm:block bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
        title="Game Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Battle Log Toggle Button - hidden on mobile (has dedicated tab) */}
      <button
        onClick={onToggleBattleLog}
        className={`hidden lg:block bg-stone-800 hover:bg-stone-700 p-2 rounded-full border transition-colors ${
          showBattleLog
            ? "text-amber-400 border-amber-600"
            : "text-stone-400 border-stone-600"
        }`}
        title={showBattleLog ? "Hide Battle Log" : "Show Battle Log"}
      >
        <ScrollText className="w-5 h-5" />
      </button>

      {/* Quit Button */}
      <button
        onClick={onShowQuitConfirm}
        className="bg-stone-800 hover:bg-red-900 text-red-400 p-1.5 sm:p-2 rounded-full border border-stone-600 hover:border-red-600 transition-colors"
        title="Quit Game"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}
