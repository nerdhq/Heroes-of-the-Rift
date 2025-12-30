import { Heart, Shield, Skull, Zap } from "lucide-react";
import { CLASS_CONFIGS } from "../../data/classes";
import type { Player } from "../../types";
import { HealthBar } from "./HealthBar";
import { StatusEffects } from "./StatusEffects";

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isTargeted: boolean;
}

export function PlayerCard({
  player,
  isCurrentPlayer,
  isTargeted,
}: PlayerCardProps) {
  const config = CLASS_CONFIGS[player.class];
  const totalAggro = player.baseAggro + player.diceAggro;

  const getClassIcon = (playerClass: string) => {
    const icons: Record<string, string> = {
      warrior: "⚔️",
      rogue: "🗡️",
      paladin: "🛡️",
      mage: "🔮",
      priest: "✨",
      bard: "🎵",
      archer: "🏹",
      barbarian: "🪓",
    };
    return icons[playerClass] || "❓";
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all relative ${
        isCurrentPlayer
          ? "border-amber-500 bg-stone-800 shadow-lg shadow-amber-900/30"
          : player.isAlive
          ? "border-stone-700 bg-stone-800/50"
          : "border-red-900 bg-red-950/30 opacity-60"
      } ${isTargeted ? "animate-target-pulse" : ""}`}
    >
      {/* Target indicator */}
      {isTargeted && (
        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-intent">
          🎯 TARGET
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getClassIcon(player.class)}</span>
          <div>
            <h3 className="font-bold text-base" style={{ color: config.color }}>
              {player.name}
            </h3>
            <p className="text-xs text-stone-500">{config.name}</p>
          </div>
        </div>
        {!player.isAlive && <Skull className="w-5 h-5 text-red-500" />}
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-red-400">
            <Heart className="w-3 h-3" />
            {player.hp}/{player.maxHp}
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <Shield className="w-3 h-3" />
            {player.shield}
          </span>
        </div>
        <HealthBar current={player.hp} max={player.maxHp} color="bg-red-500" />
      </div>

      {/* Resource Bar */}
      {player.maxResource > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: config.color }} className="font-medium">
              {config.resourceName}
            </span>
            <span className="text-stone-400">
              {player.resource}/{player.maxResource}
            </span>
          </div>
          <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                player.resource >= player.maxResource
                  ? "animate-resource-glow"
                  : ""
              }`}
              style={{
                width: `${(player.resource / player.maxResource) * 100}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Aggro */}
      {totalAggro > 0 && (
        <div
          className={`text-sm mb-2 ${
            isCurrentPlayer ? "text-amber-400" : "text-amber-600"
          }`}
        >
          <Zap className="w-3 h-3 inline mr-1" />
          Aggro: {totalAggro}{" "}
          {player.baseAggro > 0 && `(${player.baseAggro} base)`}
        </div>
      )}

      {/* Status Effects */}
      <StatusEffects buffs={player.buffs} debuffs={player.debuffs} />
    </div>
  );
}
