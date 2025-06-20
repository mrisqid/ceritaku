"use client";

import { useState } from "react";
import GameLayout from "@/components/ui/GameLayout";
import PlayerList from "@/app/room/_components/PlayerList";
import GameArea from "@/app/room/_components/GameArea";
import { type Player } from "@/types/room";
import StoryInput from "./_components/StoryInput";
import AnswerAndChat from "./_components/AnswerAndChat";

// Mock data - replace with real data later
const mockPlayers: Player[] = [
  { id: "1", name: "devil", points: 64, isCurrentTurn: true },
  { id: "2", name: "JEN", points: 60 },
  { id: "3", name: "Lunie", points: 58 },
  { id: "4", name: "ObitoUvhiha", points: 9 },
  { id: "5", name: "TestTon", points: 8 },
  { id: "6", name: "Aripp", points: 0 },
  { id: "7", name: "Nagi seishiro", points: 0 },
];

export default function RoomPage() {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const handleSubmitAnswer = (answer: string) => {
    console.log("Submitted answer:", answer);
    // TODO: Implement socket.io connection to submit answer
  };

  function handleSubmitStory(story: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <GameLayout>
      <div className="flex gap-4 h-[calc(100vh-12rem)] max-w-7xl mx-auto p-4">
        {/* Left side - Player List */}
        <div className="w-80 flex-shrink-0 h-full overflow-y-auto"> 
          <PlayerList players={players} />
        </div>

        {/* Right side - Game Area */}
        <div className="flex-grow flex flex-col gap-4">
          {/* <GameArea 
            currentAnswer={currentAnswer}
            onAnswerChange={setCurrentAnswer}
            onSubmit={handleSubmitAnswer}
          /> */}
          <StoryInput onSubmit={handleSubmitStory} />
          <AnswerAndChat />
        </div>
      </div>
    </GameLayout>
  );
}