import { useGameStore } from "../store/gameStore";
import { Swords, Shield, Skull } from "lucide-react";

export function QuestIntroScreen() {
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const getCurrentQuest = useGameStore((state) => state.getCurrentQuest);
  const isFinalQuest = useGameStore((state) => state.isFinalQuest);
  const setScreen = useGameStore((state) => state.setScreen);
  const startCampaignRound = useGameStore((state) => state.startCampaignRound);
  const players = useGameStore((state) => state.players);

  // Check if we have a saved deck (resuming campaign) - player should already be set up
  const hasSavedDeck = campaignProgress?.savedDeck && campaignProgress.savedDeck.length > 0;
  const hasPlayerSetUp = players.length > 0;

  const quest = getCurrentQuest();

  if (!activeCampaign || !campaignProgress || !quest) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">No quest available</p>
      </div>
    );
  }

  const questNumber = campaignProgress.currentQuestIndex + 1;
  const totalQuests = activeCampaign.quests.length;
  const isFinal = isFinalQuest();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: `linear-gradient(to bottom, ${activeCampaign.themeColor}10, #1c1917, #1c1917)`,
      }}
    >
      <div className="max-w-2xl w-full">
        {/* Quest Progress */}
        <div className="text-center mb-4">
          <span className="text-stone-500 text-sm uppercase tracking-wider">
            {activeCampaign.name}
          </span>
        </div>

        {/* Quest Number Badge */}
        <div className="flex justify-center mb-6">
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              isFinal
                ? "bg-red-500/20 text-red-400 border border-red-500/50"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/50"
            }`}
          >
            {isFinal ? "⚔️ FINAL QUEST" : `Quest ${questNumber} of ${totalQuests}`}
          </div>
        </div>

        {/* Quest Title */}
        <h1 className="text-4xl font-bold text-center text-stone-100 mb-2">
          {quest.name}
        </h1>
        <p className="text-center text-stone-400 mb-8">{quest.description}</p>

        {/* Story Text */}
        <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700 mb-6">
          <div className="prose prose-invert max-w-none">
            {quest.introText.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-stone-300 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Quest Info */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-stone-800/30 rounded-lg p-4 text-center border border-stone-700/50">
            <Swords className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-stone-400 text-xs uppercase mb-1">Rounds</div>
            <div className="text-stone-200 font-bold">
              {quest.minRounds + 1}-{quest.maxRounds + 1}
            </div>
          </div>
          <div className="bg-stone-800/30 rounded-lg p-4 text-center border border-stone-700/50">
            <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-stone-400 text-xs uppercase mb-1">Difficulty</div>
            <div className="text-stone-200 font-bold">Level {quest.monsterLevel}</div>
          </div>
          <div className="bg-stone-800/30 rounded-lg p-4 text-center border border-stone-700/50">
            <Skull className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-stone-400 text-xs uppercase mb-1">Boss</div>
            <div className="text-stone-200 font-bold text-sm truncate">
              {isFinal ? activeCampaign.finalBossName : "Quest Boss"}
            </div>
          </div>
        </div>

        {/* Final Boss Warning */}
        {isFinal && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3 text-red-400">
              <Skull className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-bold">Final Boss Awaits</div>
                <div className="text-sm text-red-400/80">
                  {activeCampaign.finalBossName} is significantly more powerful than previous bosses.
                  Prepare yourself for the ultimate challenge!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setScreen("campaignSelect")}
            className="px-6 py-3 rounded-lg bg-stone-700 hover:bg-stone-600 text-stone-300 font-semibold transition-colors"
          >
            Abandon Campaign
          </button>
          <button
            onClick={() => {
              if (hasSavedDeck && hasPlayerSetUp) {
                // Resuming with saved deck - start the round directly
                startCampaignRound();
              } else {
                // New campaign or no deck yet - go to champion/deck selection
                setScreen("gameChampionSelect");
              }
            }}
            className="px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            style={{
              backgroundColor: activeCampaign.themeColor,
              color: "#1c1917",
            }}
          >
            {hasSavedDeck && hasPlayerSetUp ? "Begin Quest →" : "Select Champions →"}
          </button>
        </div>
      </div>
    </div>
  );
}
