"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const AVATARS = ["😃", "🦊", "🐼", "🐸", "🦄", "🐧", "🐯", "🐵", "🐱", "🐶"];

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    // Prefill from localStorage
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("playerName");
      const savedAvatar = localStorage.getItem("playerAvatar");
      if (savedName) setPlayerName(savedName);
      if (savedAvatar && AVATARS.includes(savedAvatar)) setAvatar(savedAvatar);
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError("Nama tidak boleh kosong!");
      return;
    }
    localStorage.setItem("playerName", playerName.trim());
    localStorage.setItem("playerAvatar", avatar);
    setSaved(true);
    setError("");
    setTimeout(() => setSaved(false), 1500);
  };

  const handleAvatarSelect = (a: string) => {
    setAvatar(a);
    setShowAvatarModal(false);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-yellow-200 to-yellow-400 relative overflow-hidden font-poppins">
      {/* Playful background shapes */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300 rounded-full opacity-30 blur-2xl z-0"></div>
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-yellow-200 rounded-full opacity-40 blur-2xl z-0"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-40 bg-blue-200 rounded-t-full opacity-30 blur-2xl z-0 -translate-x-1/2"></div>

      {/* Header with logo and info button */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image
            src="/globe.svg"
            alt="Logo"
            width={48}
            height={48}
            className="drop-shadow-lg"
          />
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">
            Ceritaku
          </span>
        </div>
        <button
          aria-label="Cara Bermain"
          onClick={() => setShowHowToPlay(true)}
          className="ml-4 p-2 rounded-full bg-blue-100 hover:bg-blue-200 border-2 border-blue-200 text-blue-700 shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="text-xl">ℹ️</span>
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center w-full max-w-lg border-4 border-yellow-300">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">
            Tebak Cerita
          </h1>
          <p className="text-lg md:text-xl text-blue-800 mb-6 text-center font-medium">
            Game Tebak Kisah Multiplayer Seru!
          </p>

          {/* Player Profile Form (simplified) */}
          <form
            onSubmit={handleSaveProfile}
            className="w-full mb-8 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-4 w-full justify-center">
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="text-4xl border-2 border-yellow-300 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center shadow hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Pilih avatar"
              >
                {avatar}
              </button>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                placeholder="Nama kamu..."
                maxLength={20}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all border-2 border-blue-200 mt-2 w-full"
            >
              Simpan Profil
            </button>
            {error && (
              <span className="text-red-500 text-xs mt-2">{error}</span>
            )}
            {saved && (
              <span className="text-green-600 text-xs mt-2">
                Profil disimpan!
              </span>
            )}
          </form>

          {/* Avatar Modal */}
          {showAvatarModal && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAvatarModal(false)}
              ></div>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-blue-100 max-w-xs w-full relative animate-fadeIn flex flex-col items-center">
                  <button
                    aria-label="Tutup"
                    onClick={() => setShowAvatarModal(false)}
                    className="absolute top-3 right-3 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full p-2 border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                  <h3 className="text-lg font-bold text-blue-700 mb-4 text-center">
                    Pilih Avatar
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center mb-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={`text-3xl p-2 rounded-full border-2 ${
                          avatar === a
                            ? "border-yellow-400 bg-yellow-100"
                            : "border-transparent hover:border-blue-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                        onClick={() => handleAvatarSelect(a)}
                        aria-label={`Pilih avatar ${a}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col md:flex-row gap-4 w-full mb-6">
            <button
              onClick={handleCreateRoom}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-400 text-blue-900 font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-lg border-2 border-blue-200 hover:scale-105"
            >
              🎮 Buat Ruangan
            </button>
            <div className="flex-1 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Kode Ruangan..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 hover:scale-105"
              >
                🚀 Gabung
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              👥 Multiplayer
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
              🏆 Sistem Poin
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              ⚡ Real-time
            </span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
              📱 Mobile Ready
            </span>
          </div>
        </div>

        {/* Modal Cara Bermain */}
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-blue-100 max-w-md w-full relative animate-fadeIn">
              <button
                aria-label="Tutup"
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-3 right-3 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full p-2 border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <span className="text-lg">✕</span>
              </button>
              <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
                🎯 Cara Bermain
              </h2>
              <ol className="space-y-3 text-blue-900 text-base font-medium">
                <li className="flex items-start gap-3">
                  <span className="bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center text-base font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Pemain membuat ruangan dan membagikan kode ruangan kepada
                  teman-teman
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center text-base font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Setiap pemain menulis cerita atau fakta menarik tentang diri
                  sendiri
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center text-base font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Pemain lain menebak siapa yang menulis cerita tersebut
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-blue-200 rounded-full w-7 h-7 flex items-center justify-center text-base font-bold flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Dapatkan poin untuk setiap tebakan yang benar!
                </li>
              </ol>
            </div>
            {/* Click outside to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowHowToPlay(false)}
            ></div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-blue-700/70 text-sm">
          © 2025 Ceritaku - Game Tebak Cerita Multiplayer
        </footer>
      </main>
    </div>
  );
}