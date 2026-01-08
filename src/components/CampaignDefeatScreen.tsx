import { useGameStore } from "../store/gameStore";
import { Skull, RotateCcw, Home } from "lucide-react";

export function CampaignDefeatScreen() {
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const getCurrentQuest = useGameStore((state) => state.getCurrentQuest);
  const setScreen = useGameStore((state) => state.setScreen);
  const resetGame = useGameStore((state) => state.resetGame);
  const startCampaign = useGameStore((state) => state.startCampaign);
  const players = useGameStore((state) => state.players);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const setChampionGold = useGameStore((state) => state.setChampionGold);

  const quest = getCurrentQuest();

  if (!activeCampaign || !campaignProgress) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">No campaign data available</p>
      </div>
    );
  }

  const questNumber = campaignProgress.currentQuestIndex + 1;

  const handleReturnToTitle = () => {
    // Save gold to champion before resetting
    if (activeChampion) {
      const player = players.find((p) => p.championId === activeChampion.id);
      if (player) {
        setChampionGold(activeChampion.id, player.gold);
      }
    }
    resetGame();
    setScreen("title");
  };

  const handleTryAgain = () => {
    startCampaign(activeCampaign.id);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-red-950/50 via-stone-900 to-stone-900">
      <div className="max-w-2xl w-full text-center">
        {/* Defeat Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-red-900/30 mb-4">
            <Skull className="w-14 h-14 text-red-500" />
          </div>
        </div>

        {/* Defeat Header */}
        <h1 className="text-4xl font-bold text-red-500 mb-2">Campaign Failed</h1>
        <p className="text-stone-400 mb-8">Your party has been defeated</p>

        {/* Campaign Info */}
        <div className="bg-stone-800/50 rounded-xl p-6 border border-red-900/50 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">{activeCampaign.icon}</span>
            <div className="text-left">
              <h2 className="text-xl font-bold text-stone-200">
                {activeCampaign.name}
              </h2>
              <p className="text-stone-400 text-sm">
                Fallen at Quest {questNumber}: {quest?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Progress Lost */}
          <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
            <p className="text-red-400 text-sm">
              ⚠️ All campaign progress has been lost. You must restart from Quest 1.
            </p>
          </div>
        </div>

        {/* Defeat Message */}
        <div className="bg-stone-800/30 rounded-xl p-4 border border-stone-700/50 mb-8">
          <p className="text-stone-400 italic">
            "Even the mightiest heroes can fall. But legends are born from those who rise again."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleReturnToTitle}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Title
          </button>
          <button
            onClick={handleTryAgain}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
