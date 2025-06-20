"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

const AVATARS = ["😃", "🦊", "🐼", "🐸", "🦄", "🐧", "🐯", "🐵", "🐱", "🐶"];

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCode, setNewRoomCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [shareMsg, setShareMsg] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [showJoinError, setShowJoinError] = useState(false);
  const [joinErrorMsg, setJoinErrorMsg] = useState("");
  const [createRoomLoading, setCreateRoomLoading] = useState(false);
  const router = useRouter();

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
    // Open modal and generate code
    setNewRoomName(playerName ? `Ruangan ${playerName}` : "Ruangan Baru");
    setMaxPlayers(3);
    setNewRoomCode(generateRoomCode());
    setShowCreateRoomModal(true);
    setShareMsg("");
  };

  const handleCreateRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateRoomLoading(true);
    // 1. Insert room
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .insert([
        {
          code: newRoomCode,
          name: newRoomName,
        },
      ])
      .select()
      .single();
    if (roomError || !roomData) {
      setCreateRoomLoading(false);
      setShowCreateRoomModal(false);
      setJoinErrorMsg("Gagal membuat ruangan. Silakan coba lagi.");
      setShowJoinError(true);
      return;
    }
    // 2. Insert player (host)
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert([
        {
          room_id: roomData.id,
          name: playerName,
          avatar,
          is_host: true,
        },
      ])
      .select()
      .single();
    if (playerError || !playerData) {
      setCreateRoomLoading(false);
      setShowCreateRoomModal(false);
      setJoinErrorMsg("Gagal menambahkan host ke ruangan.");
      setShowJoinError(true);
      return;
    }
    // 3. Simulate loading, redirect
    setShowCreateRoomModal(false);
    setCreateRoomLoading(false);
    router.push(`/room/${newRoomCode}`);
  };

  const handleShareCode = async () => {
    const url = `${window.location.origin}/room/${newRoomCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link ruangan disalin!");
      setTimeout(() => setShareMsg(""), 1500);
    } catch {
      setShareMsg("Gagal menyalin link");
      setTimeout(() => setShareMsg(""), 1500);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;
    setJoinLoading(true);
    // 1. Check if room exists
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("id, code")
      .eq("code", roomCode.trim())
      .single();
    if (roomErr || !room) {
      setJoinLoading(false);
      setJoinErrorMsg("Kode ruangan tidak ditemukan.");
      setShowJoinError(true);
      return;
    }
    // 2. Insert player
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .insert([
        {
          room_id: room.id,
          name: playerName,
          avatar,
          is_host: false,
        },
      ])
      .select()
      .single();
    if (playerError || !playerData) {
      setJoinLoading(false);
      setJoinErrorMsg("Gagal join ke ruangan. Coba lagi.");
      setShowJoinError(true);
      return;
    }
    // 3. Redirect
    setJoinLoading(false);
    router.push(`/room/${roomCode.trim()}`);
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
          <span className="text-4xl md:text-5xl drop-shadow-lg">🕵️</span>
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">
            CeritaKu
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
            CeritaKu
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
                disabled={!roomCode.trim() || joinLoading}
                className={`w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-200 hover:scale-105 ${
                  joinLoading ? "opacity-70" : ""
                }`}
              >
                {joinLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <>🚀 Gabung</>
                )}
              </button>
            </div>
          </div>

          {/* Create Room Modal */}
          {showCreateRoomModal && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCreateRoomModal(false)}
              ></div>
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <form
                  onSubmit={handleCreateRoomSubmit}
                  className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-300 max-w-md w-full relative animate-fadeIn flex flex-col gap-4"
                >
                  <button
                    aria-label="Tutup"
                    type="button"
                    onClick={() => setShowCreateRoomModal(false)}
                    className="absolute top-3 right-3 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full p-2 border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                  <h3 className="text-xl font-bold text-blue-700 mb-2 text-center">
                    Buat Ruangan
                  </h3>
                  <label className="text-blue-700 font-semibold text-sm">
                    Nama Ruangan
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                    maxLength={30}
                    required
                  />
                  <label className="text-blue-700 font-semibold text-sm">
                    Jumlah Maksimal Pemain
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
                  >
                    <option value={3}>3 Orang</option>
                    <option value={4}>4 Orang</option>
                    <option value={5}>5 Orang</option>
                  </select>
                  <label className="text-blue-700 font-semibold text-sm">
                    Kode Ruangan
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newRoomCode}
                      readOnly
                      className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-900 text-center font-mono text-lg w-40 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleShareCode}
                      className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg shadow-md border-2 border-blue-200 text-sm"
                    >
                      Share
                    </button>
                  </div>
                  {shareMsg && (
                    <span className="text-green-600 text-xs">{shareMsg}</span>
                  )}
                  <button
                    type="submit"
                    disabled={createRoomLoading}
                    className={`bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-2 px-6 rounded-lg shadow-md border-2 border-yellow-300 mt-2 w-full transition-all ${
                      createRoomLoading ? "opacity-70" : ""
                    }`}
                  >
                    {createRoomLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-blue-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <>Buat & Masuk Ruangan</>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

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
                className="absolute top-3 right-3 text-blue-700 bg-blue-100 hover:bg-blue-200 active:bg-blue-300 rounded-full p-2 border border-blue-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
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

        {/* Join Room Error Modal */}
        {showJoinError && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowJoinError(false)}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-red-300 max-w-xs w-full relative animate-fadeIn flex flex-col items-center">
                <h3 className="text-lg font-bold text-red-700 mb-4 text-center">
                  Kode Ruangan Tidak Valid
                </h3>
                <p className="text-red-700 text-center mb-2">
                  {joinErrorMsg ||
                    "Kode ruangan harus 6 karakter, huruf kapital/angka."}
                </p>
                <button
                  onClick={() => setShowJoinError(false)}
                  className="bg-red-400 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-md border-2 border-red-200 mt-2"
                >
                  Tutup
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-blue-700/70 text-sm">
          © 2025 CeritaKu - Game Tebak Cerita Multiplayer
        </footer>
      </main>
    </div>
  );
}
