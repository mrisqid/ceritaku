"use client";

import { type Player } from "@/types/room";
import PlayerList from "./PlayerList";
import StoryInput from "./StoryInput";

interface CardRoomProps {
  players: Player[];
  onSubmitStory: (story: string) => void;
}

export default function CardGame({ players, onSubmitStory }: CardRoomProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <StoryInput onSubmit={onSubmitStory} />
      <PlayerList players={players} />
    </div>
  );
} 