"use client";

import { type Player } from "@/types/room";

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg max-h-full h-full overflow-y-auto">
      {players.map((player, index) => (
        <div 
          key={player.id}
          className={`flex items-center gap-3 p-4 ${
            index !== players.length - 1 ? 'border-b border-gray-200' : ''
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              😊
            </div>
            {player.isCurrentTurn && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✏️</span>
              </div>
            )}
          </div>

          {/* Player Info */}
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{player.name}</span>
            </div>
            <div className="text-sm text-gray-500">
              {player.points} pts
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}