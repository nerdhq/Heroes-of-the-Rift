import { useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import { TitleScreen } from "./components/TitleScreen";
import { LoginScreen } from "./components/LoginScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { WaitingRoom } from "./components/WaitingRoom";
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
      {currentScreen === "victory" && <VictoryScreen />}
      {currentScreen === "defeat" && <DefeatScreen />}
    </>
  );
}

export default App;
