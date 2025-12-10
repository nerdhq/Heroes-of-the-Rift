import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-900 border-2 border-amber-600 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-700 sticky top-0 bg-stone-900">
          <h2 className="text-2xl font-bold text-amber-400">📜 Game Guide</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-amber-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Game Flow */}
          <section>
            <h3 className="text-lg font-bold text-amber-300 mb-2">
              ⚔️ Game Flow
            </h3>
            <ul className="text-stone-300 space-y-1 text-sm">
              <li>• Each turn, you draw 2 cards and choose 1 to play</li>
              <li>• Roll a D20 + card's base aggro = your total aggro</li>
              <li>• Higher aggro = more likely to be targeted by monsters</li>
              <li>• All heroes act before monsters attack</li>
              <li>• Defeat all monsters in 3 rounds to win!</li>
            </ul>
          </section>

          {/* Buffs */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-2">
              ✨ Buffs (Positive Effects)
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <span className="font-bold text-green-300">💪 Strength</span>
                <p className="text-stone-300">
                  Adds bonus damage to your attacks for the duration.
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <span className="font-bold text-green-300">🛡️ Shield</span>
                <p className="text-stone-300">
                  Absorbs incoming damage before HP is affected. Doesn't expire.
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <span className="font-bold text-green-300">👁️ Stealth</span>
                <p className="text-stone-300">
                  Monsters cannot target you while stealthed.
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <span className="font-bold text-green-300">🎯 Taunt</span>
                <p className="text-stone-300">
                  Forces monsters to target you instead of allies.
                </p>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg border border-green-800">
                <span className="font-bold text-green-300">🚫 Block</span>
                <p className="text-stone-300">
                  Completely blocks the next incoming attack.
                </p>
              </div>
            </div>
          </section>

          {/* Debuffs */}
          <section>
            <h3 className="text-lg font-bold text-red-400 mb-2">
              💀 Debuffs (Negative Effects)
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">☠️ Poison</span>
                <p className="text-stone-300">
                  Deals damage at the end of each turn. Stacks with other
                  poisons.
                </p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">🔥 Burn</span>
                <p className="text-stone-300">
                  Deals fire damage at the end of each turn.
                </p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">❄️ Frost</span>
                <p className="text-stone-300">
                  Deals cold damage at the end of each turn.
                </p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">💔 Weakness</span>
                <p className="text-stone-300">Reduces your damage output.</p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">💫 Stun</span>
                <p className="text-stone-300">
                  Skip your next turn - you cannot act while stunned.
                </p>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-800">
                <span className="font-bold text-red-300">
                  🎯 Accuracy Penalty
                </span>
                <p className="text-stone-300">
                  Chance to miss your attacks. Roll must exceed penalty to hit.
                </p>
              </div>
            </div>
          </section>

          {/* Card Rarities */}
          <section>
            <h3 className="text-lg font-bold text-amber-300 mb-2">
              🃏 Card Rarities
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-3 bg-stone-800 p-2 rounded border border-stone-600">
                <span className="text-stone-400 font-bold">Common</span>
                <span className="text-stone-400">
                  Basic cards with simple effects
                </span>
              </div>
              <div className="flex items-center gap-3 bg-green-950/30 p-2 rounded border border-green-600">
                <span className="text-green-400 font-bold">Uncommon</span>
                <span className="text-stone-300">
                  Better effects or multi-target
                </span>
              </div>
              <div className="flex items-center gap-3 bg-blue-950/30 p-2 rounded border border-blue-600">
                <span className="text-blue-400 font-bold">Rare</span>
                <span className="text-stone-300">
                  Powerful effects with strong impact
                </span>
              </div>
              <div className="flex items-center gap-3 bg-amber-950/30 p-2 rounded border border-amber-600">
                <span className="text-amber-400 font-bold">Legendary</span>
                <span className="text-stone-300">
                  Ultimate abilities with game-changing effects
                </span>
              </div>
            </div>
          </section>

          {/* Aggro System */}
          <section>
            <h3 className="text-lg font-bold text-amber-300 mb-2">
              ⚡ Aggro System
            </h3>
            <ul className="text-stone-300 space-y-1 text-sm">
              <li>• Each card has a base aggro value</li>
              <li>
                • When you play a card, roll D20 + base aggro = total aggro
              </li>
              <li>• Monsters target the hero with the highest aggro</li>
              <li>• Tanks can use high-aggro cards to protect allies</li>
              <li>
                • Rogues can use low-aggro cards + stealth to avoid attacks
              </li>
            </ul>
          </section>

          {/* Classes */}
          <section>
            <h3 className="text-lg font-bold text-amber-300 mb-2">
              🎭 Classes
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-red-400">⚔️ Warrior</span>
                <p className="text-stone-400 text-xs">
                  Tank with high damage and strength buffs
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-purple-400">🗡️ Rogue</span>
                <p className="text-stone-400 text-xs">
                  Stealth and poison specialist
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-yellow-400">🛡️ Paladin</span>
                <p className="text-stone-400 text-xs">
                  Defensive tank with healing
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-blue-400">🔮 Mage</span>
                <p className="text-stone-400 text-xs">
                  High damage with elemental effects
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-green-400">✨ Priest</span>
                <p className="text-stone-400 text-xs">
                  Healer with cleanse and revive
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-pink-400">🎵 Bard</span>
                <p className="text-stone-400 text-xs">
                  Support with party-wide buffs
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-emerald-400">🏹 Archer</span>
                <p className="text-stone-400 text-xs">
                  Ranged damage with debuffs
                </p>
              </div>
              <div className="bg-stone-800 p-2 rounded">
                <span className="font-bold text-orange-400">🪓 Barbarian</span>
                <p className="text-stone-400 text-xs">
                  Berserker with self-buffs
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
