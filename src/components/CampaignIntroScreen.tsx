import { useGameStore } from "../store/gameStore";
import { ArrowRight, Swords } from "lucide-react";

export function CampaignIntroScreen() {
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const startQuest = useGameStore((state) => state.startQuest);
  const setScreen = useGameStore((state) => state.setScreen);

  if (!activeCampaign) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">No campaign selected</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: `linear-gradient(to bottom, ${activeCampaign.themeColor}15, #1c1917, #1c1917)`,
      }}
    >
      <div className="max-w-2xl w-full">
        {/* Campaign Icon */}
        <div className="text-center mb-6">
          <div
            className="inline-block text-8xl p-6 rounded-2xl mb-4"
            style={{ backgroundColor: `${activeCampaign.themeColor}20` }}
          >
            {activeCampaign.icon}
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: activeCampaign.themeColor }}
          >
            {activeCampaign.name}
          </h1>
          <p className="text-stone-400 uppercase tracking-wider text-sm">
            {activeCampaign.difficulty} difficulty • {activeCampaign.quests.length} quests
          </p>
        </div>

        {/* Story Text */}
        <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700 mb-8">
          <div className="prose prose-invert max-w-none">
            {activeCampaign.introText.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-stone-300 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Quest Preview */}
        <div className="bg-stone-800/30 rounded-xl p-4 border border-stone-700/50 mb-8">
          <h3 className="text-stone-400 text-sm font-semibold mb-3">Your Journey</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {activeCampaign.quests.map((quest, index) => (
              <div key={quest.id} className="flex items-center">
                <div
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    index === 0
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                      : "bg-stone-700/50 text-stone-400"
                  }`}
                >
                  {index + 1}. {quest.name}
                </div>
                {index < activeCampaign.quests.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-stone-600 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Boss Warning */}
        <div className="flex items-center justify-center gap-3 mb-8 text-red-400">
          <Swords className="w-5 h-5" />
          <span className="text-sm">
            Final Boss: <strong>{activeCampaign.finalBossName}</strong>
          </span>
          <Swords className="w-5 h-5" />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setScreen("campaignSelect")}
            className="px-6 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={startQuest}
            className="px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            style={{
              backgroundColor: activeCampaign.themeColor,
              color: "#1c1917",
            }}
          >
            Begin Quest 1 →
          </button>
        </div>
      </div>
    </div>
  );
}
