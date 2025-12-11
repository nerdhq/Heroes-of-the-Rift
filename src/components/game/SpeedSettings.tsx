import { Settings } from "lucide-react";
import type { GameSpeed } from "../../types";

interface SpeedSettingsProps {
  isOpen: boolean;
  gameSpeed: GameSpeed;
  skipAnimations: boolean;
  onSpeedChange: (speed: GameSpeed) => void;
  onToggleSkipAnimations: () => void;
}

export function SpeedSettings({
  isOpen,
  gameSpeed,
  skipAnimations,
  onSpeedChange,
  onToggleSkipAnimations,
}: SpeedSettingsProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute top-14 right-3 z-20 bg-stone-800 rounded-lg border border-stone-600 p-4 shadow-xl w-64">
      <div className="flex items-center gap-2 mb-3 text-amber-400">
        <Settings className="w-4 h-4" />
        <span className="font-bold">Speed Settings</span>
      </div>

      {/* Speed Options */}
      <div className="space-y-2 mb-4">
        <label className="text-stone-300 text-sm">Animation Speed</label>
        <div className="flex gap-1">
          {(["normal", "fast", "instant"] as GameSpeed[]).map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                gameSpeed === speed
                  ? "bg-amber-600 text-amber-100"
                  : "bg-stone-700 text-stone-300 hover:bg-stone-600"
              }`}
            >
              {speed === "normal" ? "1x" : speed === "fast" ? "2.5x" : "⚡"}
            </button>
          ))}
        </div>
      </div>

      {/* Skip Animations Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-stone-300 text-sm">Skip All Animations</span>
        <button
          onClick={onToggleSkipAnimations}
          className={`w-12 h-6 rounded-full transition-colors ${
            skipAnimations ? "bg-green-600" : "bg-stone-600"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              skipAnimations ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <p className="text-stone-500 text-xs mt-3">
        Speed up combat animations for faster gameplay
      </p>
    </div>
  );
}
