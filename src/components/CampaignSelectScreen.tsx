import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { getDifficultyColor, getDifficultyBgColor } from "../data/campaigns";
import { ArrowLeft, Trophy, Skull, Swords, Play, Trash2 } from "lucide-react";

export function CampaignSelectScreen() {
  const availableCampaigns = useGameStore((state) => state.availableCampaigns);
  const completedCampaigns = useGameStore((state) => state.completedCampaigns);
  const loadCampaigns = useGameStore((state) => state.loadCampaigns);
  const startCampaign = useGameStore((state) => state.startCampaign);
  const setScreen = useGameStore((state) => state.setScreen);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const resumeCampaign = useGameStore((state) => state.resumeCampaign);
  const abandonCampaign = useGameStore((state) => state.abandonCampaign);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setScreen("title")}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Campaigns</h1>
            <p className="text-stone-400">
              Embark on epic adventures through connected quests
            </p>
          </div>
        </div>

        {/* Resume Campaign Banner */}
        {campaignProgress && activeCampaign && campaignProgress.status === "in_progress" && (
          <div
            className="mb-6 p-4 rounded-xl border-2 border-amber-500/50"
            style={{ backgroundColor: `${activeCampaign.themeColor}15` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{activeCampaign.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-amber-400">Campaign In Progress</h3>
                  <p className="text-stone-300">
                    {activeCampaign.name} - Quest {campaignProgress.currentQuestIndex + 1} of {activeCampaign.quests.length}
                  </p>
                  <p className="text-stone-500 text-sm">
                    Round {campaignProgress.currentRound} of {campaignProgress.totalRounds}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={abandonCampaign}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 text-red-400 font-semibold transition-colors border border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                  Abandon
                </button>
                <button
                  onClick={resumeCampaign}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
                  style={{
                    backgroundColor: activeCampaign.themeColor,
                    color: "#1c1917",
                  }}
                >
                  <Play className="w-4 h-4" />
                  Resume Campaign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign List */}
        <div className="grid gap-6">
          {availableCampaigns.map((campaign) => {
            const isCompleted = completedCampaigns.includes(campaign.id);

            return (
              <div
                key={campaign.id}
                className={`relative rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${getDifficultyBgColor(
                  campaign.difficulty
                )}`}
              >
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-amber-500/90 text-amber-900 px-3 py-1 rounded-full text-sm font-bold">
                    <Trophy className="w-4 h-4" />
                    Completed
                  </div>
                )}

                <div className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="text-5xl p-3 rounded-xl"
                      style={{ backgroundColor: `${campaign.themeColor}20` }}
                    >
                      {campaign.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-stone-100 mb-1">
                        {campaign.name}
                      </h2>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`text-sm font-semibold uppercase ${getDifficultyColor(
                            campaign.difficulty
                          )}`}
                        >
                          {campaign.difficulty}
                        </span>
                        <span className="text-stone-500">•</span>
                        <span className="text-stone-400 text-sm">
                          {campaign.quests.length} Quests
                        </span>
                      </div>
                      <p className="text-stone-300">{campaign.description}</p>
                    </div>
                  </div>

                  {/* Quest Preview */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-stone-400 mb-2">
                      Quest Chain
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {campaign.quests.map((quest, index) => (
                        <div
                          key={quest.id}
                          className="flex items-center gap-1 text-xs bg-stone-800/50 px-2 py-1 rounded"
                        >
                          <span className="text-stone-500">{index + 1}.</span>
                          <span className="text-stone-300">{quest.name}</span>
                          {index === campaign.quests.length - 1 && (
                            <Skull className="w-3 h-3 text-red-400 ml-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Boss Preview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Swords className="w-4 h-4 text-red-400" />
                      <span className="text-stone-400">Final Boss:</span>
                      <span className="text-red-400 font-semibold">
                        {campaign.finalBossName}
                      </span>
                    </div>

                    <button
                      onClick={() => startCampaign(campaign.id)}
                      className="px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105"
                      style={{
                        backgroundColor: campaign.themeColor,
                        color: "#1c1917",
                      }}
                    >
                      {isCompleted ? "Play Again" : "Begin Campaign"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-stone-800/50 rounded-xl border border-stone-700">
          <h3 className="text-amber-400 font-bold mb-2">Campaign Rules</h3>
          <ul className="text-stone-400 text-sm space-y-1">
            <li>• Progress through connected quests with escalating difficulty</li>
            <li>• Each quest ends with a boss fight</li>
            <li>• Party wipe = campaign over (restart from quest 1)</li>
            <li>• Defeat the final boss to complete the campaign</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
