import { useGameStore } from "../store/gameStore";
import { Trophy, Star, Crown, Sparkles } from "lucide-react";

export function CampaignVictoryScreen() {
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const players = useGameStore((state) => state.players);
  const setScreen = useGameStore((state) => state.setScreen);
  const resetGame = useGameStore((state) => state.resetGame);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const setChampionGold = useGameStore((state) => state.setChampionGold);

  if (!activeCampaign || !campaignProgress) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">No campaign data available</p>
      </div>
    );
  }

  // Calculate stats
  const totalGold = players.reduce((sum, p) => sum + p.gold, 0);
  const aliveCount = players.filter((p) => p.isAlive).length;
  const completionTime = campaignProgress.completedAt
    ? Math.floor((campaignProgress.completedAt - campaignProgress.startedAt) / 60000)
    : 0;

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

  const handlePlayAgain = () => {
    setScreen("campaignSelect");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${activeCampaign.themeColor}20, #1c1917, ${activeCampaign.themeColor}10)`,
      }}
    >
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-amber-400/30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${20 + Math.random() * 20}px`,
              height: `${20 + Math.random() * 20}px`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Victory Crown */}
        <div className="mb-6">
          <div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 animate-bounce"
            style={{ backgroundColor: `${activeCampaign.themeColor}30` }}
          >
            <Crown className="w-16 h-16 text-amber-400" />
          </div>
        </div>

        {/* Victory Header */}
        <h1 className="text-5xl font-bold text-amber-400 mb-2">
          Campaign Complete!
        </h1>
        <p className="text-2xl text-stone-300 mb-2">{activeCampaign.name}</p>
        <p className="text-stone-400 mb-8">
          You have defeated{" "}
          <span className="text-red-400 font-bold">{activeCampaign.finalBossName}</span>
        </p>

        {/* Campaign Icon */}
        <div
          className="inline-block text-6xl p-4 rounded-2xl mb-8"
          style={{ backgroundColor: `${activeCampaign.themeColor}20` }}
        >
          {activeCampaign.icon}
        </div>

        {/* Victory Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-500/30">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-400">
              {activeCampaign.quests.length}
            </div>
            <div className="text-stone-500 text-sm">Quests Completed</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 border border-green-500/30">
            <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">
              {aliveCount}/{players.length}
            </div>
            <div className="text-stone-500 text-sm">Heroes Survived</div>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-500/30">
            <span className="text-3xl">💰</span>
            <div className="text-2xl font-bold text-amber-400">{totalGold}</div>
            <div className="text-stone-500 text-sm">Gold Earned</div>
          </div>
        </div>

        {/* Completion Time */}
        <div className="bg-stone-800/30 rounded-lg p-3 mb-8 inline-block">
          <span className="text-stone-400">Completion Time: </span>
          <span className="text-stone-200 font-bold">{completionTime} minutes</span>
        </div>

        {/* Victory Message */}
        <div className="bg-gradient-to-r from-amber-900/30 via-amber-800/30 to-amber-900/30 rounded-xl p-6 border border-amber-500/30 mb-8">
          <p className="text-amber-200 text-lg italic">
            "Your legend will be sung for generations. The realm is forever in your debt."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleReturnToTitle}
            className="px-6 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 font-semibold transition-colors"
          >
            Return to Title
          </button>
          <button
            onClick={handlePlayAgain}
            className="px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            style={{
              backgroundColor: activeCampaign.themeColor,
              color: "#1c1917",
            }}
          >
            Play Another Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
