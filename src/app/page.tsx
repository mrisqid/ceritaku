"use client";

import { useRouter } from "next/navigation";
import GameLayout from "@/components/ui/GameLayout";

export default function Home() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push("/game");
  };

  return (
    <GameLayout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Tebak Cerita
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            Game Tebak Kisah Multiplayer yang Seru!
          </p>
        </div>

        {/* Start Game Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleStartGame}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 text-white font-bold py-4 px-8 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
          >
            🎮 Mulai Bermain
          </button>
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-white/90 font-medium">Multiplayer</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-3xl mb-2">✍️</div>
            <p className="text-white/90 font-medium">Tulis Cerita</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-3xl mb-2">🤔</div>
            <p className="text-white/90 font-medium">Tebak Penulis</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-white/90 font-medium">Kumpulkan Poin</p>
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            🎯 Cara Bermain
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-white/90">Tulis cerita atau fakta menarik tentang dirimu</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-white/90">Cerita akan diacak dan ditampilkan secara anonim</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-white/90">Tebak siapa penulis dari setiap cerita</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-white/90">Kumpulkan poin dari tebakan yang benar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
