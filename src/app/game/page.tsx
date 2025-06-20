"use client";

import { useState } from "react";
import CardGame from "@/components/game/CardGame";
import GameLayout from "@/components/ui/GameLayout";

interface Player {
  id: string;
  name: string;
  hasSubmitted: boolean;
}

export default function GamePage() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', hasSubmitted: false },
    { id: '2', name: 'Player 2', hasSubmitted: true },
  ]);

  const handleSubmitStory = (story: string) => {
    // TODO: Implement socket.io connection
    console.log('Submitted story:', story);
    setPlayers(players.map(p => 
      p.id === '1' ? { ...p, hasSubmitted: true } : p
    ));
  };

  return (
    <GameLayout>
      <CardGame 
        players={players}
        onSubmitStory={handleSubmitStory}
      />
    </GameLayout>
  );
} 