import { useGameStore } from "../store/gameStore";
import { Trophy, ArrowRight, Heart, Coins, Home } from "lucide-react";

export function QuestCompleteScreen() {
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const getCurrentQuest = useGameStore((state) => state.getCurrentQuest);
  const advanceToNextQuest = useGameStore((state) => state.advanceToNextQuest);
  const players = useGameStore((state) => state.players);
  const setScreen = useGameStore((state) => state.setScreen);
  const resetGame = useGameStore((state) => state.resetGame);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const setChampionGold = useGameStore((state) => state.setChampionGold);

  const quest = getCurrentQuest();

  if (!activeCampaign || !campaignProgress || !quest) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">No quest data available</p>
      </div>
    );
  }

  const questNumber = campaignProgress.currentQuestIndex + 1;
  const totalQuests = activeCampaign.quests.length;
  const nextQuest = activeCampaign.quests[campaignProgress.currentQuestIndex + 1];

  // Calculate party stats
  const totalGold = players.reduce((sum, p) => sum + p.gold, 0);
  const aliveCount = players.filter((p) => p.isAlive).length;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: `linear-gradient(to bottom, ${activeCampaign.themeColor}15, #1c1917, #1c1917)`,
      }}
    >
      <div className="max-w-2xl w-full text-center">
        {/* Victory Icon */}
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{ backgroundColor: `${activeCampaign.themeColor}30` }}
          >
            <Trophy className="w-12 h-12" style={{ color: activeCampaign.themeColor }} />
          </div>
        </div>

        {/* Quest Complete Header */}
        <h1 className="text-4xl font-bold text-amber-400 mb-2">Quest Complete!</h1>
        <p className="text-stone-400 mb-8">
          You have conquered <span className="text-stone-200">{quest.name}</span>
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-stone-400 mb-2">
            <span>Campaign Progress</span>
            <span>
              {questNumber} / {totalQuests} Quests
            </span>
          </div>
          <div className="h-3 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(questNumber / totalQuests) * 100}%`,
                backgroundColor: activeCampaign.themeColor,
              }}
            />
          </div>
        </div>

        {/* Party Status */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
              <Heart className="w-5 h-5" />
              <span className="font-bold">Party Status</span>
            </div>
            <div className="text-2xl font-bold text-stone-200">
              {aliveCount} / {players.length}
            </div>
            <div className="text-stone-500 text-sm">Heroes Alive</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700">
            <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
              <Coins className="w-5 h-5" />
              <span className="font-bold">Gold Earned</span>
            </div>
            <div className="text-2xl font-bold text-stone-200">{totalGold}</div>
            <div className="text-stone-500 text-sm">Total Gold</div>
          </div>
        </div>

        {/* Next Quest Preview */}
        {nextQuest && (
          <div className="bg-stone-800/30 rounded-xl p-4 border border-stone-700/50 mb-8">
            <div className="flex items-center justify-center gap-2 text-stone-400 text-sm mb-2">
              <ArrowRight className="w-4 h-4" />
              <span>Next Quest</span>
            </div>
            <h3 className="text-xl font-bold text-stone-200 mb-1">{nextQuest.name}</h3>
            <p className="text-stone-400 text-sm">{nextQuest.description}</p>
          </div>
        )}

        {/* Healing Notice */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-8">
          <p className="text-green-400 text-sm">
            ✨ Your party has been healed for 50% of missing HP
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              // Save gold to champion before resetting
              if (activeChampion) {
                const player = players.find((p) => p.championId === activeChampion.id);
                if (player) {
                  setChampionGold(activeChampion.id, player.gold);
                }
              }
              resetGame();
              setScreen("title");
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            Return to Title
          </button>
          <button
            onClick={advanceToNextQuest}
            className="px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            style={{
              backgroundColor: activeCampaign.themeColor,
              color: "#1c1917",
            }}
          >
            Continue to Quest {questNumber + 1} →
          </button>
        </div>
      </div>
    </div>
  );
}
