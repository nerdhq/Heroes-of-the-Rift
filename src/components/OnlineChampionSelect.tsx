import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { CLASS_CONFIGS } from "../data/classes";
import {
  Crown,
  ArrowLeft,
  Users,
  Star,
  Coins,
  Library,
  Plus,
  Check,
} from "lucide-react";

const getClassIcon = (classType: string): string => {
  const icons: Record<string, string> = {
    fighter: "⚔️",
    rogue: "🗡️",
    paladin: "🛡️",
    mage: "🔮",
    cleric: "✨",
    bard: "🎵",
    archer: "🏹",
    barbarian: "🪓",
  };
  return icons[classType] || "👤";
};

export function OnlineChampionSelect() {
  const setScreen = useGameStore((state) => state.setScreen);
  const setReturnScreen = useGameStore((state) => state.setReturnScreen);
  const playerAccount = useGameStore((state) => state.playerAccount);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const selectChampion = useGameStore((state) => state.selectChampion);

  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(
    activeChampion?.id ?? null
  );

  const champions = playerAccount?.champions ?? [];

  const handleSelectChampion = (championId: string) => {
    setSelectedChampionId(championId);
  };

  const handleConfirmSelection = async () => {
    if (!selectedChampionId) return;

    const champion = champions.find((c) => c.id === selectedChampionId);
    if (champion) {
      await selectChampion(champion.id);
      setScreen("lobby");
    }
  };

  const handleCreateChampion = () => {
    setReturnScreen("onlineChampionSelect");
    setScreen("championCreate");
  };

  const handleBack = () => {
    setScreen("title");
  };

  // If no champions, show prompt to create one
  if (champions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-amber-100">Play Online</h1>
          </div>
          <p className="text-stone-400 text-lg">
            You need a champion to play online
          </p>
        </div>

        <div className="bg-stone-800/50 rounded-xl p-8 border border-stone-700 text-center max-w-md">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-amber-100 mb-2">
            No Champions Found
          </h2>
          <p className="text-stone-400 mb-6">
            Create a champion to join online games. Your champion's cards and
            stats will be used in battle!
          </p>
          <button
            onClick={handleCreateChampion}
            className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Champion
          </button>
        </div>

        <button
          onClick={handleBack}
          className="mt-6 flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>
      </div>
    );
  }

  const selectedChampion = champions.find((c) => c.id === selectedChampionId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Title
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-amber-100">Play Online</h1>
          </div>
          <p className="text-stone-400 text-lg">
            Select a champion to use in online play
          </p>
        </div>

        {/* Champion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {champions.map((champion) => {
            const isSelected = selectedChampionId === champion.id;
            const classConfig = CLASS_CONFIGS[champion.class];

            return (
              <button
                key={champion.id}
                onClick={() => handleSelectChampion(champion.id)}
                className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left ${
                  isSelected
                    ? "border-amber-400 bg-amber-900/30 ring-2 ring-amber-400"
                    : "border-stone-600 bg-stone-800/50 hover:border-stone-500"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-6 h-6 text-amber-400" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">
                    {getClassIcon(champion.class)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-amber-100">
                      {champion.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: classConfig.color }}
                    >
                      {classConfig.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4" />
                    <span>Lv. {champion.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-4 h-4" />
                    <span>{champion.gold}</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Library className="w-4 h-4" />
                    <span>{champion.ownedCards.length} cards</span>
                  </div>
                </div>

                {champion.unspentStatPoints > 0 && (
                  <div className="mt-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      +{champion.unspentStatPoints} stat points
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Create New Champion Card */}
          <button
            onClick={handleCreateChampion}
            className="p-4 rounded-xl border-2 border-dashed border-stone-600 bg-stone-800/30 hover:border-green-500 hover:bg-green-900/20 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px]"
          >
            <Plus className="w-8 h-8 text-stone-500" />
            <span className="text-stone-400 font-medium">Create New Champion</span>
          </button>
        </div>

        {/* Selected Champion Details & Confirm */}
        {selectedChampion && (
          <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-600/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {getClassIcon(selectedChampion.class)}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-amber-100">
                    {selectedChampion.name}
                  </h2>
                  <p
                    className="text-lg"
                    style={{ color: CLASS_CONFIGS[selectedChampion.class].color }}
                  >
                    Level {selectedChampion.level}{" "}
                    {CLASS_CONFIGS[selectedChampion.class].name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirmSelection}
                className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-blue-100 font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Continue to Lobby
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-stone-900/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-400">
                  {selectedChampion.ownedCards.length}
                </div>
                <div className="text-stone-400 text-sm">Cards</div>
              </div>
              <div className="bg-stone-900/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">
                  {selectedChampion.gold}
                </div>
                <div className="text-stone-400 text-sm">Gold</div>
              </div>
              <div className="bg-stone-900/50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">
                  {selectedChampion.attributes.CON * 10 + 50}
                </div>
                <div className="text-stone-400 text-sm">Max HP</div>
              </div>
            </div>
          </div>
        )}

        {!selectedChampion && (
          <div className="text-center py-8 text-stone-500">
            <p>Select a champion to continue to the online lobby</p>
          </div>
        )}
      </div>
    </div>
  );
}
