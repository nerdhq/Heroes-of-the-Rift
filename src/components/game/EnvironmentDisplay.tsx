import type { Environment } from "../../types";

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
    <div className="relative inline-block group mb-2">
      {/* Main pill - just icon and name */}
      <div
        className="inline-flex items-center gap-2 rounded-lg border border-stone-700 px-3 py-1.5 cursor-help transition-colors hover:border-stone-500"
        style={{
          backgroundImage: `linear-gradient(to right, ${environment.theme.primaryColor}20, ${environment.theme.secondaryColor}10)`,
          borderColor: environment.theme.primaryColor + "50",
        }}
      >
        <span className="text-lg">{getEnvironmentIcon(environment.type)}</span>
        <span
          className="font-bold text-sm"
          style={{ color: environment.theme.primaryColor }}
        >
          {environment.name}
        </span>
      </div>

      {/* Hover tooltip with full details */}
      {environment.effects && environment.effects.length > 0 && (
        <div className="absolute left-0 top-full mt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div
            className="rounded-lg border border-stone-600 p-3 shadow-xl min-w-[200px] max-w-[300px]"
            style={{
              backgroundColor: "#1a1a1a",
              borderColor: environment.theme.primaryColor + "40",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-700">
              <span className="text-lg">{getEnvironmentIcon(environment.type)}</span>
              <span
                className="font-bold text-sm"
                style={{ color: environment.theme.primaryColor }}
              >
                {environment.name}
              </span>
            </div>

            {/* Effects list */}
            <div className="space-y-2">
              <div className="text-xs text-stone-400 uppercase tracking-wide">
                Active Effects
              </div>
              {environment.effects.map((effect, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="flex-shrink-0">{getEffectIcon(effect.type)}</span>
                  <span className="text-stone-200">{effect.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
