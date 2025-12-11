import { FastForward, HelpCircle, LogOut } from "lucide-react";
import type { GameSpeed } from "../../types";

interface TopControlsProps {
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  onToggleSpeedSettings: () => void;
  onShowHelp: () => void;
  onShowQuitConfirm: () => void;
}

export function TopControls({
  gameSpeed,
  skipAnimations,
  onToggleSpeedSettings,
  onShowHelp,
  onShowQuitConfirm,
}: TopControlsProps) {
  return (
    <div className="absolute top-3 right-3 z-10 flex gap-2">
      {/* Speed Settings Button */}
      <button
        onClick={onToggleSpeedSettings}
        className={`bg-stone-800 hover:bg-stone-700 p-2 rounded-full border transition-colors ${
          gameSpeed !== "normal" || skipAnimations
            ? "text-green-400 border-green-600"
            : "text-amber-400 border-stone-600"
        }`}
        title="Speed Settings"
      >
        <FastForward className="w-5 h-5" />
      </button>

      {/* Help Button */}
      <button
        onClick={onShowHelp}
        className="bg-stone-800 hover:bg-stone-700 text-amber-400 p-2 rounded-full border border-stone-600 transition-colors"
        title="Game Guide"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Quit Button */}
      <button
        onClick={onShowQuitConfirm}
        className="bg-stone-800 hover:bg-red-900 text-red-400 p-2 rounded-full border border-stone-600 hover:border-red-600 transition-colors"
        title="Quit Game"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
