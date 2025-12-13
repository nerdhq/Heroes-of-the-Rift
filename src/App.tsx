import { useGameStore } from "./store/gameStore";
import { TitleScreen } from "./components/TitleScreen";
import { ClassSelectScreen } from "./components/ClassSelectScreen";
import { DeckBuilderScreen } from "./components/DeckBuilderScreen";
import { GameScreen } from "./components/GameScreen";
import { CardRewardScreen } from "./components/CardRewardScreen";
import { CardShopScreen } from "./components/CardShopScreen";
import { VictoryScreen } from "./components/VictoryScreen";
import { DefeatScreen } from "./components/DefeatScreen";

function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <>
      {currentScreen === "title" && <TitleScreen />}
      {currentScreen === "classSelect" && <ClassSelectScreen />}
      {currentScreen === "deckBuilder" && <DeckBuilderScreen />}
      {currentScreen === "game" && <GameScreen />}
      {currentScreen === "cardReward" && <CardRewardScreen />}
      {currentScreen === "cardShop" && <CardShopScreen />}
      {currentScreen === "victory" && <VictoryScreen />}
      {currentScreen === "defeat" && <DefeatScreen />}
    </>
  );
}

export default App;
