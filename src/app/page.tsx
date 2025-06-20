"use client";

import { useState } from "react";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = () => {
    // TODO: Implement create room functionality
    console.log("Creating room...");
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      // TODO: Implement join room functionality
      console.log("Joining room:", roomCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-4xl font-bold text-white">📖</span>
            </div>
          </div>

          {/* Game Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            Tebak Cerita
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            Game Tebak Kisah Multiplayer
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md">
          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 text-white font-bold py-4 px-6 rounded-xl border border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🎮 Buat Ruangan Baru
            </button>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <input
                  type="text"
                  placeholder="Masukkan kode ruangan..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full bg-white/20 rounded-lg px-4 py-3 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomCode.trim()}
                  className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🚀 Gabung Ruangan
                </button>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              🎯 Cara Bermain
            </h2>
            <div className="space-y-3 text-white/90 text-sm">
              <div className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Pemain membuat ruangan dan membagikan kode ruangan kepada
                  teman-teman
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Setiap pemain menulis cerita atau fakta menarik tentang diri
                  sendiri
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <p>Pemain lain menebak siapa yang menulis cerita tersebut</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>Dapatkan poin untuk setiap tebakan yang benar!</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <div className="text-2xl mb-1">👥</div>
              <p className="text-white/90 text-xs font-medium">Multiplayer</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-white/90 text-xs font-medium">Sistem Poin</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-white/90 text-xs font-medium">Real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <div className="text-2xl mb-1">📱</div>
              <p className="text-white/90 text-xs font-medium">Mobile Ready</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            © 2024 Tebak Cerita - Game Tebak Kisah Multiplayer
          </p>
        </div>
      </div>
    </div>
  );
}
