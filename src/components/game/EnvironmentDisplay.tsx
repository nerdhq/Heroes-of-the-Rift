import type { Environment } from "../../types";
import { Sparkles } from "lucide-react";

interface EnvironmentDisplayProps {
  environment: Environment | null;
}

export function EnvironmentDisplay({ environment }: EnvironmentDisplayProps) {
  if (!environment) return null;

  const getEnvironmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      forest: "🌲",
      castle: "🏰",
      volcano: "🌋",
      iceCave: "❄️",
      swamp: "🐊",
      desert: "🏜️",
      crypt: "💀",
      void: "🌀",
    };
    return icons[type] || "🗺️";
  };

  const getEffectIcon = (effectType: string) => {
    const icons: Record<string, string> = {
      frostBonus: "❄️",
      fireBonus: "🔥",
      poisonBonus: "☠️",
      healingBonus: "💚",
      damageBonus: "⚔️",
      shieldBonus: "🛡️",
    };
    return icons[effectType] || "✨";
  };

  return (
    <div
      className="rounded-lg border-2 border-stone-700 p-4 mb-4 bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${environment.theme.primaryColor}15, ${environment.theme.secondaryColor}10)`,
        borderColor: environment.theme.primaryColor + "40",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{getEnvironmentIcon(environment.type)}</span>
        <div>
          <h2
            className="font-bold text-lg"
            style={{ color: environment.theme.primaryColor }}
          >
            {environment.name}
          </h2>
          <p className="text-xs text-stone-400 italic">{environment.description}</p>
        </div>
      </div>

      {/* Effects */}
      {environment.effects && environment.effects.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1 text-xs text-stone-400 mb-1">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">Environmental Effects:</span>
          </div>
          {environment.effects.map((effect, idx) => (
            <div
              key={idx}
              className="text-xs text-stone-300 flex items-center gap-1 pl-4"
            >
              <span>{getEffectIcon(effect.type)}</span>
              <span>{effect.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
