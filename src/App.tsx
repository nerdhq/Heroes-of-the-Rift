import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { TitleScreen } from "./components/TitleScreen";
import { LoginScreen } from "./components/LoginScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { WaitingRoom } from "./components/WaitingRoom";
import { ChampionSelectScreen } from "./components/ChampionSelectScreen";
import { ChampionCreateScreen } from "./components/ChampionCreateScreen";
import { StatAllocationScreen } from "./components/StatAllocationScreen";
import { ClassSelectScreen } from "./components/ClassSelectScreen";
import { OnlineClassSelectScreen } from "./components/OnlineClassSelectScreen";
import { DeckBuilderScreen } from "./components/DeckBuilderScreen";
import { OnlineDeckBuilderScreen } from "./components/OnlineDeckBuilderScreen";
import { GameScreen } from "./components/GameScreen";
import { CardRewardScreen } from "./components/CardRewardScreen";
import { CardShopScreen } from "./components/CardShopScreen";
import { MyCardsScreen } from "./components/MyCardsScreen";
import { RoundCompleteScreen } from "./components/RoundCompleteScreen";
import { VictoryScreen } from "./components/VictoryScreen";
import { DefeatScreen } from "./components/DefeatScreen";
import { PostGameScreen } from "./components/PostGameScreen";
import { OnlineChampionSelect } from "./components/OnlineChampionSelect";
import { CampaignSelectScreen } from "./components/CampaignSelectScreen";
import { CampaignIntroScreen } from "./components/CampaignIntroScreen";
import { QuestIntroScreen } from "./components/QuestIntroScreen";
import { QuestCompleteScreen } from "./components/QuestCompleteScreen";
import { CampaignVictoryScreen } from "./components/CampaignVictoryScreen";
import { CampaignDefeatScreen } from "./components/CampaignDefeatScreen";
import { DevToolsScreen } from "./components/DevToolsScreen";

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const isOnline = useGameStore((state) => state.isOnline);
  const initializeAuth = useGameStore((state) => state.initializeAuth);

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      {currentScreen === "title" && <TitleScreen />}
      {currentScreen === "login" && <LoginScreen />}
      {currentScreen === "lobby" && <LobbyScreen />}
      {currentScreen === "waitingRoom" && <WaitingRoom />}
      {currentScreen === "onlineChampionSelect" && <OnlineChampionSelect />}
      {currentScreen === "championSelect" && <ChampionSelectScreen />}
      {currentScreen === "championCreate" && <ChampionCreateScreen />}
      {currentScreen === "statAllocation" && <StatAllocationScreen />}
      {currentScreen === "classSelect" && (
        isOnline ? <OnlineClassSelectScreen /> : <ClassSelectScreen />
      )}
      {currentScreen === "deckBuilder" && (
        isOnline ? <OnlineDeckBuilderScreen /> : <DeckBuilderScreen />
      )}
      {currentScreen === "game" && <GameScreen />}
      {currentScreen === "cardReward" && <CardRewardScreen />}
      {currentScreen === "cardShop" && <CardShopScreen />}
      {currentScreen === "myCards" && <MyCardsScreen />}
      {currentScreen === "roundComplete" && <RoundCompleteScreen />}
      {currentScreen === "postGame" && <PostGameScreen />}
      {currentScreen === "victory" && <VictoryScreen />}
      {currentScreen === "defeat" && <DefeatScreen />}
      {currentScreen === "campaignSelect" && <CampaignSelectScreen />}
      {currentScreen === "campaignIntro" && <CampaignIntroScreen />}
      {currentScreen === "questIntro" && <QuestIntroScreen />}
      {currentScreen === "questComplete" && <QuestCompleteScreen />}
      {currentScreen === "campaignVictory" && <CampaignVictoryScreen />}
      {currentScreen === "campaignDefeat" && <CampaignDefeatScreen />}
      {currentScreen === "devTools" && <DevToolsScreen />}
    </>
  );
}

export default App;
