import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { Sword, Shield, Scroll, Users, Wifi, Coins, ShoppingBag, Library, Crown, Star, Map, Play, Wrench } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";
import { CLASS_CONFIGS } from "../data/classes";

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

export function TitleScreen() {
  const setScreen = useGameStore((state) => state.setScreen);
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);
  const loadUserData = useGameStore((state) => state.loadUserData);
  const activeChampion = useGameStore((state) => state.activeChampion);
  const loadProgression = useGameStore((state) => state.loadProgression);
  const campaignProgress = useGameStore((state) => state.campaignProgress);
  const activeCampaign = useGameStore((state) => state.activeCampaign);
  const resumeCampaign = useGameStore((state) => state.resumeCampaign);
  const loadCampaigns = useGameStore((state) => state.loadCampaigns);

  // Load user data, progression, and campaigns on mount
  useEffect(() => {
    loadUserData();
    loadProgression();
    loadCampaigns();
  }, [loadUserData, loadProgression, loadCampaigns]);

  const handlePlayOnline = () => {
    if (isAuthenticated) {
      setScreen("onlineChampionSelect");
    } else {
      setScreen("login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Sword className="w-12 h-12 text-amber-500" />
          <h1 className="text-6xl font-bold text-amber-100 tracking-wider">
            HEROES OF THE RIFT
          </h1>
          <Shield className="w-12 h-12 text-amber-500" />
        </div>
        <p className="text-stone-400 text-xl">A Co-op Card Dungeon Crawler</p>
        <p className="text-stone-600 text-sm mt-2">Up to 5 Heroes • Turn-based Combat • Deck Building</p>
      </div>

      {/* Active Champion Display */}
      {activeChampion ? (
        <button
          onClick={() => setScreen("championSelect")}
          className="flex items-center gap-4 mb-8 bg-stone-800/50 px-6 py-3 rounded-xl border border-amber-600/30 hover:border-amber-500 transition-colors"
        >
          <span className="text-3xl">{getClassIcon(activeChampion.class)}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-lg">{activeChampion.name}</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-400">{CLASS_CONFIGS[activeChampion.class].name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3" />
                <span>Lv. {activeChampion.level}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="w-3 h-3" />
                <span>{activeChampion.gold}</span>
              </div>
              <div className="text-stone-400">
                {activeChampion.ownedCards.length} cards
              </div>
            </div>
          </div>
          {activeChampion.unspentStatPoints > 0 && (
            <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              +{activeChampion.unspentStatPoints} pts
            </div>
          )}
        </button>
      ) : (
        <button
          onClick={() => setScreen("championSelect")}
          className="flex items-center gap-3 mb-8 bg-stone-800/50 px-6 py-3 rounded-xl border border-stone-600 hover:border-amber-500 transition-colors text-stone-400 hover:text-amber-400"
        >
          <Crown className="w-6 h-6" />
          <span className="font-bold">Select a Champion to Play</span>
        </button>
      )}

      {/* Decorative scroll */}
      <div className="relative mb-12">
        <Scroll className="w-24 h-24 text-amber-700 opacity-30" />
      </div>

      {/* Menu buttons */}
      <div className="flex flex-col gap-4 w-80">
        {/* Continue Campaign button - shown when there's an active campaign */}
        {campaignProgress && activeCampaign && campaignProgress.status === "in_progress" && (
          <button
            onClick={resumeCampaign}
            className="bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-emerald-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-3 border-2 border-emerald-400/50"
          >
            <Play className="w-6 h-6" />
            Continue Campaign
          </button>
        )}

        <button
          onClick={() => setScreen("gameChampionSelect")}
          className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-900/50"
        >
          Quick Game
        </button>

        <button
          onClick={() => setScreen("campaignSelect")}
          className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-red-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 flex items-center justify-center gap-3"
        >
          <Map className="w-6 h-6" />
          Campaigns
        </button>

        <button
          onClick={() => setScreen("championSelect")}
          className="bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-900/50 flex items-center justify-center gap-3"
        >
          <Crown className="w-6 h-6" />
          Champions
        </button>

        <button
          onClick={() => setScreen("myCards")}
          disabled={!activeChampion}
          className={`font-bold py-4 px-8 rounded-lg text-xl transition-all flex items-center justify-center gap-3 ${
            activeChampion
              ? "bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-indigo-100 transform hover:scale-105 shadow-lg shadow-indigo-900/50"
              : "bg-stone-700 text-stone-500 cursor-not-allowed"
          }`}
        >
          <Library className="w-6 h-6" />
          My Cards ({activeChampion?.ownedCards?.length ?? 0})
        </button>

        <button
          onClick={() => setScreen("cardShop")}
          disabled={!activeChampion}
          className={`font-bold py-4 px-8 rounded-lg text-xl transition-all flex items-center justify-center gap-3 ${
            activeChampion
              ? "bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-green-100 transform hover:scale-105 shadow-lg shadow-green-900/50"
              : "bg-stone-700 text-stone-500 cursor-not-allowed"
          }`}
        >
          <ShoppingBag className="w-6 h-6" />
          Card Shop
        </button>

        {isSupabaseConfigured() ? (
          <button
            onClick={handlePlayOnline}
            className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-blue-100 font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-900/50 flex items-center justify-center gap-3"
          >
            <Users className="w-6 h-6" />
            Play Online
          </button>
        ) : (
          <button
            disabled
            className="bg-stone-700 text-stone-500 font-bold py-4 px-8 rounded-lg text-xl cursor-not-allowed opacity-50 flex items-center justify-center gap-3"
            title="Supabase not configured"
          >
            <Wifi className="w-6 h-6" />
            Online (Not Configured)
          </button>
        )}

        <button
          disabled
          className="bg-stone-700 text-stone-500 font-bold py-4 px-8 rounded-lg text-xl cursor-not-allowed opacity-50"
        >
          Options
        </button>

        <button
          onClick={() => setScreen("devTools")}
          className="bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-600 hover:to-stone-500 text-stone-300 font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-stone-900/50 flex items-center justify-center gap-2 mt-4"
        >
          <Wrench className="w-5 h-5" />
          Dev Tools
        </button>
      </div>

    </div>
  );
}
