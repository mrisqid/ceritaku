"use client";

import { type Player } from "@/types/game";

interface PlayerListProps {
  players: Player[];
}

export default function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        👥 Status Pemain
      </h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                👤
              </div>
              <span className="text-white font-medium">{player.name}</span>
            </div>
            <div className="flex items-center">
              {player.hasSubmitted ? (
                <span className="text-green-400 bg-green-400/20 px-3 py-1 rounded-full text-sm">
                  ✓ Submitted
                </span>
              ) : (
                <span className="text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full text-sm">
                  ⏳ Waiting
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 