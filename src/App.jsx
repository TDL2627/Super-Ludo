import { useState } from "react";
import GameScreen from "./components/GameScreen";
import IntroPage from "./components/IntroPage";

export default function App() {
  const [players, setPlayers] = useState(null);

  if (!players) {
    return <IntroPage onStart={setPlayers} />;
  }

  return <GameScreen players={players} onRestart={() => setPlayers(null)} />;
}
