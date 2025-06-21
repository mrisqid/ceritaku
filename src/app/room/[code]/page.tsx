"use client";

import { useState, useEffect, useCallback } from "react";
import { GuessPlayer, PlayerListProps, StepperProps, StoryInputProps, type Player } from "@/types/room";
import { useRouter, useParams } from "next/navigation";

// Import helper function
import { getCurrentTime12Hour } from "@/helper/timeUtils";
import EmojiReaction from "@/components/ui/EmojiReaction";
import GenreSelection from "@/components/ui/GenreSelection";

// Import Supabase services
import {
  getRoomByCode,
  joinRoom,
  getPlayersInRoom,
  updatePlayerReady,
  submitStory,
  getCurrentStory,
  submitGuess,
  getGuessResults,
  leaveRoom,
  updateRoomPhase,
  subscribeToRoom
} from "@/services/roomService";

// ============ COMPONENTS ============

// Stepper Component - Updated
function Stepper({ currentStep, onStepChange, allowBackNavigation = false }: StepperProps & { allowBackNavigation?: boolean }) {
  const steps = [
    { id: 1, title: "Tulis Cerita", icon: "✍️", description: "" },
    { id: 2, title: "Tebak Penulis", icon: "🤔", description: "" },
    { id: 3, title: "Review Hasil", icon: "📊", description: "" }
  ];

  const handleStepClick = (stepId: number) => {
    // Jika allowBackNavigation false, hanya bisa ke step yang sama atau lebih tinggi
    if (!allowBackNavigation && stepId < currentStep) {
      return; // Tidak bisa kembali ke step sebelumnya
    }

    // Jika allowBackNavigation true, atau step yang diklik >= currentStep
    if (allowBackNavigation || stepId <= currentStep) {
      onStepChange(stepId);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-white/20 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = allowBackNavigation ? true : step.id <= currentStep; // Hanya bisa klik jika allowBackNavigation true atau step <= currentStep
          const isDisabled = !allowBackNavigation && step.id < currentStep; // Disabled jika tidak bisa back navigation dan step < currentStep

          return (
            <div
              key={step.id}
              className={`relative flex flex-col items-center group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              onClick={() => handleStepClick(step.id)}
            >
              {/* Step Circle */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 relative z-10 ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-110'
                  : isCompleted
                    ? 'bg-green-500 text-white shadow-md'
                    : isDisabled
                      ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed' // Style untuk disabled
                      : 'bg-white/20 text-white/70 group-hover:bg-white/30'
                  }`}
              >
                {isCompleted ? '✅' : step.icon}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center">
                <h3 className={`font-bold text-sm lg:text-base transition-colors ${isActive
                  ? 'text-white'
                  : isDisabled
                    ? 'text-white/40'
                    : 'text-white/80'
                  }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-white/60 mt-1 hidden lg:block">
                  {step.description}
                </p>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-2 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}

              {/* Lock Icon untuk step yang tidak bisa diakses */}
              {isDisabled && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PlayerList Component
function PlayerList({ 
  players, 
  onReady, 
  currentUserId, 
  gameStarted, 
  onLeaveRoom 
}: PlayerListProps & {
  onReady: () => void;
  currentUserId: string;
  gameStarted: boolean;
  onLeaveRoom?: () => void;
}) {
  const handleLeaveRoom = () => {
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  const currentUser = players.find(p => p.local_id === currentUserId);

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 text-lg">
          Players ({players.length})
        </h2>
        <button
          onClick={handleLeaveRoom}
          className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          title="Keluar dari room"
        >
          <span className="text-lg transition-transform group-hover:scale-110">🚪</span>
          <span className="text-sm font-medium hidden sm:inline">Keluar</span>
        </button>
      </div>

      {/* Scrollable Player List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors rounded-lg"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                  😊
                </div>
                {player.isCurrentTurn && gameStarted && (
                  <div className="absolute -top-1 -left-1 w-4 h-4 lg:w-5 lg:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✏️</span>
                  </div>
                )}
                {player.isReady && !gameStarted && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 truncate text-sm lg:text-base">
                    {player.name}
                  </span>

                </div>

                <div className="text-xs lg:text-sm text-gray-500">
                  {player.points} pts
                </div>
              </div>

              {/* Status Badge */}
              {player.id === currentUserId && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  You
                </span>
              )}
              {player.isHost && (
                <div className="flex-shrink-0">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Host
                  </span>
                </div>
              )}
              {player.isReady && !gameStarted && (
                <div className="flex-shrink-0">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Ready
                  </span>
                </div>
              )}
              {player.isCurrentTurn && gameStarted && (
                <div className="flex-shrink-0">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Turn
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ready Button - Only show in lobby */}
      {!gameStarted && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={onReady}
            className={`w-full font-bold py-3 px-6 rounded-lg shadow-md transition-all border-2 ${currentUser?.isReady
              ? 'bg-gray-400 hover:bg-gray-500 text-white border-gray-300'
              : 'bg-green-500 hover:bg-green-600 text-white border-green-300'
              }`}
          >
            {currentUser?.isReady ? '❌ Batal Siap' : '✅ Ready'}
          </button>
        </div>
      )}
    </div>
  );
}

// StoryInput Component
function StoryInput({ onSubmit }: StoryInputProps) {
  const [story, setStory] = useState("");
  const maxLength = 200;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story.trim()) {
      onSubmit(story);
      setStory("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setStory(value);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">
        ✍️ Tulis Cerita Kamu
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={story}
          onChange={handleChange}
          placeholder="Tulis cerita atau fun fact menarik tentang dirimu..."
          className="w-full bg-white/20 rounded-lg px-4 py-3 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[120px] resize-none"
        />
        <div className="text-sm text-white/70 flex justify-end">
          {story.length}/{maxLength}
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
          disabled={!story.trim()}
        >
          📝 Kirim Cerita
        </button>
      </form>
    </div>
  );
}

// Answer Component - Updated with Countdown
function Answer({
  currentStory,
  players,
  onSubmitAnswer
}: {
  currentStory: string;
  players: Player[];
  onSubmitAnswer: (guessedPlayerId: string) => void;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [countdown, setCountdown] = useState(10); // 10 detik countdown
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Convert Player[] ke GuessPlayer[] format dan exclude current user
  const currentUserId = '1'; // ID user saat ini (dari session/auth)
  const availablePlayers: GuessPlayer[] = players
    .filter(player => player.id !== currentUserId) // Exclude current user
    .map(player => ({
      id: player.id,
      name: player.name
    }));

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0 && !isTimeUp) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isTimeUp) {
      // Waktu habis - auto submit dengan jawaban kosong
      setIsTimeUp(true);
      handleTimeUp();
    }
  }, [countdown, isTimeUp]);

  const handleTimeUp = () => {
    // Auto submit dengan jawaban kosong (akan mendapat 0 poin)
    onSubmitAnswer(''); // Empty string berarti tidak ada tebakan
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer && !isTimeUp) {
      const selectedPlayerName = availablePlayers.find(p => p.id === selectedPlayer)?.name;
      console.log('Tebakan:', selectedPlayerName);

      // Kirim ID yang ditebak ke parent
      onSubmitAnswer(selectedPlayer);
      setSelectedPlayer('');
    }
  };

  // Determine countdown color based on time remaining
  const getCountdownColor = () => {
    if (countdown <= 3) return 'text-red-400';
    if (countdown <= 5) return 'text-orange-400';
    return 'text-purple-100';
  };

  const getCountdownBgColor = () => {
    if (countdown <= 3) return 'bg-red-500/20';
    if (countdown <= 5) return 'bg-orange-500/20';
    return 'bg-purple-500/20';
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              🤔 Siapa Yang Menulis Cerita Ini?
            </h2>
            <p className="text-purple-100 text-sm mt-1">Tebak siapa penulis cerita di bawah ini</p>
          </div>
          
          {/* Countdown Display */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getCountdownBgColor()} border border-white/20`}>
              <span className="text-lg">⏰</span>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getCountdownColor()} ${countdown <= 3 ? 'animate-pulse' : ''}`}>
                  {countdown}
                </div>
                <div className="text-xs text-purple-100">detik</div>
              </div>
            </div>
            {countdown <= 5 && (
              <div className="text-xs text-yellow-200 mt-1 animate-bounce">
                ⚠️ Waktu hampir habis!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Up Overlay */}
      {isTimeUp && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Waktu Habis!</h3>
            <p className="text-gray-600 mb-4">Anda tidak sempat menebak</p>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              <span className="font-medium">+0 poin</span>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 p-6">
        {/* Story Display */}
        <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm w-full">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📖 Cerita:</h3>
          <div className="w-full overflow-hidden bg-gray-50 rounded-lg p-3">
            <p
              className="text-lg text-gray-800 italic leading-relaxed"
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'anywhere',
                hyphens: 'auto',
                maxWidth: '100%',
                whiteSpace: 'pre-wrap'
              }}
            >
              "{currentStory || 'Belum ada cerita yang di-submit'}"
            </p>
          </div>
        </div>

        {/* Player Options */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Pilih siapa yang menulis cerita ini:
          </h4>
          
          {/* Scrollable Player List */}
          <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {availablePlayers.length > 0 ? (
              availablePlayers.map((player) => (
                <label
                  key={player.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isTimeUp 
                      ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-100'
                      : selectedPlayer === player.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="player"
                    value={player.id}
                    checked={selectedPlayer === player.id}
                    onChange={(e) => !isTimeUp && setSelectedPlayer(e.target.value)}
                    className="sr-only"
                    disabled={isTimeUp}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedPlayer === player.id
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlayer === player.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>

                  {/* Player Avatar */}
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center mr-3">
                    👤
                  </div>

                  <span className={`font-medium ${
                    selectedPlayer === player.id ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {player.name}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada pemain lain untuk ditebak</p>
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          {availablePlayers.length > 4 && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <span>⬇️</span>
                <span>Scroll untuk melihat pemain lainnya</span>
                <span>⬇️</span>
              </p>
            </div>
          )}
        </div>

        {/* Extra space for content below sticky button */}
        <div className="h-2"></div>
      </div>

      {/* Sticky Submit Button */}
      <div className="flex-shrink-0 sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleAnswerSubmit}
          disabled={!selectedPlayer || availablePlayers.length === 0 || isTimeUp}
          className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform ${
            selectedPlayer && availablePlayers.length > 0 && !isTimeUp
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div>
       {isTimeUp
            ? '⏰ Waktu Habis - Tidak Ada Tebakan'
            : availablePlayers.length === 0
              ? '😔 Tidak ada pemain untuk ditebak'
              : selectedPlayer
                ? `🎯 Kirim Tebakan: ${availablePlayers.find(p => p.id === selectedPlayer)?.name}`
                : '🤔 Pilih pemain terlebih dahulu'
          }
          </div>
   
        </button>
      </div>
    </div>
  );
}

// NEW: Enhanced Review Component with all stories and guesses
function EnhancedReview({
  submittedStory,
  storyAuthor,
  playerGuess,
  players,
  guessResults,
  allSubmittedStories,
  onPlayAgain
}: {
  submittedStory: string;
  storyAuthor: string;
  playerGuess: string;
  players: Player[];
  guessResults: any[];
  allSubmittedStories: Map<string, string>;
  onPlayAgain: () => void;
}) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [activeTab, setActiveTab] = useState<'guessing' | 'allstories'>('guessing');

  // Hitung apakah tebakan benar
  const isGuessCorrect = playerGuess === storyAuthor;

  const correctGuesses = guessResults.filter(r => r.correct).length;
  const totalGuesses = guessResults.length;

  // Cari nama penulis dari ID
  const authorPlayer = players.find(p => p.id === storyAuthor);
  const authorName = authorPlayer ? authorPlayer.name : storyAuthor;

  // Cari nama dari player guess
  const guessedPlayer = players.find(p => p.id === playerGuess);
  const guessedPlayerName = guessedPlayer ? guessedPlayer.name : playerGuess;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 rounded-xl shadow-lg h-full overflow-hidden flex flex-col relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="animate-pulse">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-6 px-6 flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
            🎉 Review Hasil Tebakan
          </h2>
          <p className="text-emerald-100 text-sm">Lihat hasil tebakan dan semua cerita yang ditulis!</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white/20 border-b border-white/30">
        <div className="flex">
          <button
            onClick={() => setActiveTab('guessing')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
              activeTab === 'guessing'
                ? 'bg-white text-gray-800 border-b-2 border-emerald-500'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            🎯 Hasil Tebakan
          </button>
          <button
            onClick={() => setActiveTab('allstories')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
              activeTab === 'allstories'
                ? 'bg-white text-gray-800 border-b-2 border-emerald-500'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            📚 Semua Cerita
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'guessing' ? (
          // Guessing Results Tab
          <>
        {/* Story Author Reveal Section */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <div>
                    <h3 className="text-xl font-bold">Cerita yang Ditebak</h3>
                    <p className="text-blue-100 text-sm">Penulis: {authorName}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 w-full overflow-hidden">
                  <div className="w-full overflow-hidden bg-white/20 rounded-lg p-3 mb-3">
                    <p
                      className="text-white/90 italic leading-relaxed"
                      style={{
                        wordBreak: 'break-all',
                        overflowWrap: 'anywhere',
                        hyphens: 'auto',
                        maxWidth: '100%',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      "{submittedStory}"
                    </p>
                  </div>

                  {/* Your Guess Result */}
                  <div className="p-3 rounded-lg bg-white/20">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl ${isGuessCorrect ? '✅' : '❌'}`}></span>
                      <span className="font-medium break-words">
                        Tebakan Anda: {playerGuess === '' ? 'Tidak menebak (waktu habis)' : guessedPlayerName}
                        {playerGuess === '' ? ' (+0 poin)' : isGuessCorrect ? ' (BENAR! +10 poin)' : ' (SALAH)'}
                      </span>
                    </div>
                  </div>
                    </div>
                    </div>
                    </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{correctGuesses}</div>
                <div className="text-sm text-gray-600">Tebakan Benar</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{totalGuesses - correctGuesses}</div>
                <div className="text-sm text-gray-600">Tebakan Salah</div>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{guessResults.reduce((sum, r) => sum + r.points, 0)}</div>
                    <div className="text-sm text-gray-600">Total Poin</div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>

            {/* Results List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Detail Tebakan Pemain
          </h3>

          {guessResults.map((result, index) => (
            <div
              key={result.id}
              className={`relative overflow-hidden rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg w-full ${result.correct
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50'
                : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                }`}
            >
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  {/* Player Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${result.correct ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                    <span className="text-white">👤</span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`font-bold text-lg ${result.correct ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                        {result.player}
                      </span>
                      <span className="text-gray-500">menebak:</span>
                      <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded-lg break-words">
                        {result.guess}
                      </span>
                      {result.correct && (
                        <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          +{result.points} poin!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="text-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result.correct ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                      <span className="text-white text-sm font-bold">
                        {result.correct ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold ${result.correct ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                      +{result.points}
                    </div>
                    <div className="text-xs text-gray-500">poin</div>
                  </div>
                </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // All Stories Tab
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📚 Semua Cerita yang Ditulis
            </h3>

            {Array.from(allSubmittedStories.entries()).map(([authorId, story], index) => {
              const author = players.find(p => p.id === authorId);
              const isCurrentUser = authorId === '1'; // current user ID
              
              return (
                <div
                  key={authorId}
                  className={`relative overflow-hidden rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg w-full ${
                    isCurrentUser
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
                      : 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Author Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                        isCurrentUser ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        <span className="text-white">👤</span>
                      </div>

                      {/* Story Content */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-bold text-lg ${
                            isCurrentUser ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {author?.name}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Your Story
                            </span>
                          )}
                          {authorId === storyAuthor && (
                            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                              Was Guessed
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-white/70 p-4 rounded-lg border-l-4 border-gray-300 overflow-hidden">
                          <p
                            className="text-gray-800 leading-relaxed"
                    style={{
                              wordBreak: 'break-all',
                              overflowWrap: 'anywhere',
                              hyphens: 'auto',
                              maxWidth: '100%',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            "{story}"
                          </p>
                </div>

                        {/* Story Stats */}
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span>📝</span>
                            <span>{story.length} karakter</span>
              </div>
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>Oleh {author?.name}</span>
            </div>
        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🔄 Main Lagi
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🚪 Keluar Room
          </button>
        </div>
      </div>
    </div>
  );
}

// Lobby Component - Updated with Countdown
function Lobby({
  players,
  onReady,
  onStartGame,
  onCancelCountdown,
  currentUserId,
  isHost,
  waitingForPlayers,
  countdown,
  minPlayersRequired = 3
}: {
  players: Player[];
  onReady: () => void;
  onStartGame: () => void;
  onCancelCountdown: () => void;
  currentUserId: string;
  isHost: boolean;
  waitingForPlayers: boolean;
  countdown: number | null;
  minPlayersRequired?: number;
}) {
  const currentUser = players.find(p => p.id === currentUserId);
  const readyPlayers = players.filter(p => p.isReady);
  const allPlayersReady = players.length >= minPlayersRequired && readyPlayers.length === players.length;
  const minPlayersReached = players.length >= minPlayersRequired;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-6 flex-shrink-0">
        <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
          🎮 Lobby Game
        </h2>
        <p className="text-blue-100 text-sm">
          {countdown !== null
            ? `🚀 Game dimulai dalam ${countdown} detik...`
            : waitingForPlayers
              ? "🚀 Memulai permainan..."
              : "Tunggu semua pemain siap untuk memulai permainan"
          }
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Show countdown animation when counting down */}
        {countdown !== null && (
          <div className="text-center p-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg mb-6 border border-orange-400/30">
            <div className="relative">
              {/* Countdown Circle */}
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <div className="w-full h-full rounded-full border-8 border-orange-200/30"></div>
                <div
                  className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-orange-400 transition-all duration-1000 ease-linear"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * (5 - countdown) / 5 - Math.PI / 2)}% ${50 + 50 * Math.sin(2 * Math.PI * (5 - countdown) / 5 - Math.PI / 2)}%, 50% 50%)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white animate-pulse">
                    {countdown}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Game Dimulai Dalam</h3>
            <p className="text-white/80 mb-4">Semua pemain sudah siap! Bersiaplah untuk bermain...</p>

            {/* Cancel button */}
            {/* <button
              onClick={onCancelCountdown}
              className="bg-red-500/80 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            >
              ❌ Batalkan
            </button> */}
          </div>
        )}

        {/* Show starting game animation when waiting (after countdown) */}
        {waitingForPlayers && countdown === null && (
          <div className="text-center p-8 bg-green-500/20 rounded-lg mb-6">
            <div className="text-6xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-2">Memulai Permainan!</h3>
            <p className="text-white/80">Game sedang dimuat...</p>

            {/* Loading animation */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Game Rules */}
        {!waitingForPlayers && countdown === null && (
          <div className="mb-6 p-4 bg-white/20 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              📋 Aturan Permainan
            </h3>
            <ul className="text-white/90 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">1.</span>
                <span>Setiap pemain menulis cerita pendek tentang diri mereka</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">2.</span>
                <span>Pemain lain harus menebak siapa penulis cerita tersebut</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">3.</span>
                <span>Setiap tebakan benar mendapat 10 poin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">4.</span>
                <span>Pemain dengan poin tertinggi adalah pemenang</span>
              </li>
            </ul>
          </div>
        )}

        {/* Ready Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ✅ Status Kesiapan
            </h3>
            <div className="text-white/80 text-sm">
              {readyPlayers.length}/{players.length} siap
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${allPlayersReady
                ? countdown !== null
                  ? 'bg-gradient-to-r from-orange-400 to-red-500'
                  : 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}
              style={{ width: `${(readyPlayers.length / Math.max(players.length, 1)) * 100}%` }}
            />
          </div>

          {/* Player Ready List */}
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${player.isReady
                  ? countdown !== null
                    ? 'bg-orange-500/20 border border-orange-400/30'
                    : 'bg-green-500/20 border border-green-400/30'
                  : 'bg-white/10 border border-white/20'
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                    😊
                  </div>
                  {player.isReady && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${countdown !== null ? 'bg-orange-500' : 'bg-green-500'
                      }`}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {player.name}
                    </span>
                    {player.isHost && (
                      <span className="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
                        Host
                      </span>
                    )}
                    {player.id === currentUserId && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/70">
                    {player.points} poin
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {countdown !== null ? (
                    <div className="flex items-center gap-1 text-orange-300">
                      <span className="text-sm animate-pulse">⏰</span>
                      <span className="text-sm font-medium">Starting in {countdown}s</span>
                    </div>
                  ) : waitingForPlayers ? (
                    <div className="flex items-center gap-1 text-blue-300">
                      <span className="text-sm animate-pulse">🚀</span>
                      <span className="text-sm font-medium">Loading...</span>
                    </div>
                  ) : player.isReady ? (
                    <div className="flex items-center gap-1 text-green-300">
                      <span className="text-sm">✅</span>
                      <span className="text-sm font-medium">Siap</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-yellow-300">
                      <span className="text-sm">⏳</span>
                      <span className="text-sm font-medium">Menunggu</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Requirements */}
        {!waitingForPlayers && countdown === null && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <h4 className="text-white font-medium mb-2">Syarat Memulai Game:</h4>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${minPlayersReached ? 'text-green-300' : 'text-red-300'}`}>
                <span>{minPlayersReached ? '✅' : '❌'}</span>
                <span>Minimal {minPlayersRequired} pemain ({players.length}/{minPlayersRequired})</span>
              </div>
              <div className={`flex items-center gap-2 ${allPlayersReady ? 'text-green-300' : 'text-yellow-300'}`}>
                <span>{allPlayersReady ? '✅' : '⏳'}</span>
                <span>Semua pemain siap ({readyPlayers.length}/{players.length})</span>
              </div>
            </div>
          </div>
        )}

        {/* Waiting Message */}
        {!allPlayersReady && !waitingForPlayers && countdown === null && (
          <div className="text-center p-6 bg-white/10 rounded-lg">
            <div className="text-4xl mb-3">⏳</div>
            <h4 className="text-white font-bold mb-2">Menunggu Pemain Lain</h4>
            <p className="text-white/80 text-sm">
              {!minPlayersReached
                ? `Perlu ${minPlayersRequired - players.length} pemain lagi untuk memulai`
                : `Menunggu ${players.length - readyPlayers.length} pemain lagi untuk siap`
              }
            </p>
          </div>
        )}

        {/* Auto Start Message */}
        {allPlayersReady && !waitingForPlayers && countdown === null && (
          <div className="text-center p-6 bg-green-500/20 rounded-lg border border-green-400/30">
            <div className="text-4xl mb-3">🎉</div>
            <h4 className="text-white font-bold mb-2">Semua Pemain Siap!</h4>
            <p className="text-white/80 text-sm">
              Countdown akan dimulai otomatis...
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 p-6 border-t border-white/20">
        <div className="space-y-3">
          {/* Ready Button */}
          {!waitingForPlayers && countdown === null && (
            <>
              {!currentUser?.isReady ? (
                <button
                  onClick={onReady}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  ✅ Siap Bermain
                </button>
              ) : (
                <button
                  onClick={onReady}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  ❌ Batal Siap
                </button>
              )}

              {/* Manual Start Game Button (Only for Host) */}
              {isHost && allPlayersReady && (
                <button
                  onClick={onStartGame}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  🚀 Mulai Sekarang
                </button>
              )}
            </>
          )}

          {/* Countdown Message */}
          {countdown !== null && (
            <div className="text-center p-3 bg-orange-500/20 rounded-lg border border-orange-400/30">
              <p className="text-orange-200 text-sm font-medium">
                ⏰ Game dimulai dalam {countdown} detik...
              </p>
            </div>
          )}

          {/* Starting Game Message */}
          {waitingForPlayers && countdown === null && (
            <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-400/30">
              <p className="text-green-200 text-sm font-medium">
                🚀 Memulai permainan...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE COMPONENT ============
export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomCode = params.code as string;

  // States
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [roomStatus, setRoomStatus] = useState<'lobby' | 'in_progress' | 'finished'>('lobby');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [gameFinished, setGameFinished] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Game states
  const [submittedStory, setSubmittedStory] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [storyAuthor, setStoryAuthor] = useState<string>('');
  const [playerGuess, setPlayerGuess] = useState<string>('');
  const [guessResults, setGuessResults] = useState<any[]>([]);
  
  // Supabase states
  const [roomId, setRoomId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserLocalId, setCurrentUserLocalId] = useState<string>('');
  const [submittedStories, setSubmittedStories] = useState<Map<string, string>>(new Map());
  const [hasCurrentUserSubmitted, setHasCurrentUserSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Derived states
  const isHost = players.find(p => p.local_id === currentUserLocalId)?.isHost || false;
  const readyPlayers = players.filter(p => p.isReady);
  const allPlayersReady = players.length >= 3 && readyPlayers.length === players.length;
  const minPlayersReached = players.length >= 3;
  const submittedCount = submittedStories.size;
  const allStoriesSubmitted = submittedCount === players.length;

  // Initialize user and room
  useEffect(() => {
    const initializeRoom = async () => {
      try {
        setLoading(true);
        
        // Get or create local user ID
        let localId = localStorage.getItem("playerId");
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem("playerId", localId);
        }
        setCurrentUserLocalId(localId);

        // Get room data
        const room = await getRoomByCode(roomCode);
        setRoomId(room.id);
        setRoomStatus(room.phase === 'lobby' ? 'lobby' : room.phase === 'gameplay' ? 'in_progress' : 'finished');

        // Get player data
        const playerName = localStorage.getItem("playerName") || "Anonymous";
        const playerAvatar = localStorage.getItem("playerAvatar") || "😊";

        // Join room
        const player = await joinRoom(room.id, {
          localId,
          name: playerName,
          avatar: playerAvatar,
          isHost: false // Will be set by backend if first player
        });

        if (player) {
          setCurrentUserId(player.id);
        }

        // Load initial data
        await loadRoomData(room.id);

      } catch (err: any) {
        console.error("Error initializing room:", err);
        setError(err.message || "Gagal memuat ruangan");
      } finally {
        setLoading(false);
      }
    };

    if (roomCode) {
      initializeRoom();
    }
  }, [roomCode]);

  // Load room data
  const loadRoomData = async (roomId: string) => {
    try {
      const playersData = await getPlayersInRoom(roomId);
      setPlayers(playersData);

      // Check if there's a current story
      try {
        const currentStory = await getCurrentStory(roomId);
        if (currentStory) {
          setSubmittedStory(currentStory.content);
          setStoryAuthor(currentStory.authorId);
          setCurrentStep(2); // Move to guessing phase
        }
      } catch (err) {
        // No current story, stay in lobby/writing phase
      }

    } catch (err: any) {
      console.error("Error loading room data:", err);
      setError(err.message || "Gagal memuat data ruangan");
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!roomId) return;

    const subscription = subscribeToRoom(roomId, (payload: any) => {
      console.log("Real-time update:", payload);
      // Reload room data when changes occur
      loadRoomData(roomId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  // Time update
  const updateTime = useCallback(() => {
    setCurrentTime(getCurrentTime12Hour());
  }, []);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  // Auto start countdown when all players are ready
  useEffect(() => {
    if (allPlayersReady && minPlayersReached && currentStep === 0 && countdown === null) {
      setWaitingForPlayers(true);
      setCountdown(5);
    } else if (!allPlayersReady && countdown !== null) {
      setCountdown(null);
      setWaitingForPlayers(false);
    }
  }, [allPlayersReady, minPlayersReached, currentStep, countdown]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleStartGameFlow();
    }
  }, [countdown]);

  // Auto proceed to guessing phase when all stories submitted
  useEffect(() => {
    if (allStoriesSubmitted && currentStep === 1 && submittedCount > 0) {
      setTimeout(async () => {
        try {
          // Update room phase to guessing
          await updateRoomPhase(roomId, 'gameplay', 'guessing');
          
          // Get current story for guessing
          const currentStory = await getCurrentStory(roomId);
          if (currentStory) {
            setSubmittedStory(currentStory.content);
            setStoryAuthor(currentStory.authorId);
            setCurrentStep(2);
          }
        } catch (err: any) {
          console.error("Error transitioning to guessing phase:", err);
          setError(err.message);
        }
      }, 3000);
    }
  }, [allStoriesSubmitted, currentStep, submittedCount, roomId]);

  // Handlers
  const handleReady = async () => {
    try {
      const currentPlayer = players.find(p => p.local_id === currentUserLocalId);
      if (currentPlayer) {
        await updatePlayerReady(roomId, currentUserLocalId, !currentPlayer.isReady);
        // Real-time subscription will update the UI
      }
    } catch (err: any) {
      console.error("Error updating ready status:", err);
      setError(err.message);
    }
  };

  const handleStartGame = async () => {
    if (allPlayersReady && minPlayersReached && isHost) {
      try {
        setCountdown(null);
        setWaitingForPlayers(true);
        await handleStartGameFlow();
      } catch (err: any) {
        console.error("Error starting game:", err);
        setError(err.message);
      }
    }
  };

  const handleStartGameFlow = async () => {
    try {
      await updateRoomPhase(roomId, 'gameplay', 'story_input');
      setCurrentStep(1);
      setRoomStatus('in_progress');
      setWaitingForPlayers(false);
      setCountdown(null);
    } catch (err: any) {
      console.error("Error in start game flow:", err);
      setError(err.message);
    }
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
    setWaitingForPlayers(false);
  };

  const handleStepChange = (step: number) => {
    if (gameFinished || step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmitStory = async (story: string) => {
    if (hasCurrentUserSubmitted) {
      alert("Anda sudah submit cerita!");
      return;
    }

    try {
      console.log("Submitting story:", story);
      
      await submitStory(roomId, currentUserId, story);
      setHasCurrentUserSubmitted(true);
      
      // Update local state
      setSubmittedStories(prev => new Map(prev.set(currentUserId, story)));
      
      // Real-time subscription will update the UI
      
    } catch (err: any) {
      console.error("Error submitting story:", err);
      setError(err.message);
    }
  };

  const handleSubmitAnswer = async (guessedPlayerId: string) => {
    try {
      console.log("Submitted answer:", guessedPlayerId);

      // Find current story
      const currentStory = await getCurrentStory(roomId);
      if (!currentStory) {
        throw new Error("Tidak ada cerita untuk ditebak");
      }

      // Submit guess
      await submitGuess(currentStory.id, currentUserId, guessedPlayerId);
      
      // Get results
      const results = await getGuessResults(currentStory.id);
      setGuessResults(results);
      setPlayerGuess(guessedPlayerId);

      // Update room phase to result
      await updateRoomPhase(roomId, 'result');
      
      setCurrentStep(3);
      setGameFinished(true);

    } catch (err: any) {
      console.error("Error submitting answer:", err);
      setError(err.message);
    }
  };

  const handlePlayAgain = async () => {
    try {
      // Reset room to lobby
      await updateRoomPhase(roomId, 'lobby');
      
      // Reset all players ready status
      for (const player of players) {
        await updatePlayerReady(roomId, player.local_id, false);
      }

      // Reset local state
      setCurrentStep(0);
      setGameFinished(false);
      setRoomStatus('lobby');
      setWaitingForPlayers(false);
      setCountdown(null);
      setSubmittedStory('');
      setSelectedGenre('');
      setGuessResults([]);
      setSubmittedStories(new Map());
      setHasCurrentUserSubmitted(false);
      setStoryAuthor('');
      setPlayerGuess('');

    } catch (err: any) {
      console.error("Error resetting game:", err);
      setError(err.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomId, currentUserLocalId);
      router.push('/');
    } catch (err: any) {
      console.error("Error leaving room:", err);
      // Still redirect even if error
      router.push('/');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Memuat Ruangan...</h2>
            <p className="text-sm opacity-80">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg max-w-md">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
            <p className="text-sm opacity-80 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update PlayerList component to use handleLeaveRoom
  const PlayerListWithLeave = ({ ...props }: any) => (
    <PlayerList {...props} onLeaveRoom={handleLeaveRoom} />
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: // Lobby
        return (
          <Lobby
            players={players}
            onReady={handleReady}
            onStartGame={handleStartGame}
            onCancelCountdown={handleCancelCountdown}
            currentUserId={currentUserId}
            isHost={isHost}
            waitingForPlayers={waitingForPlayers}
            countdown={countdown}
            minPlayersRequired={3}
          />
        );
      case 1: // Write Story Phase
        return (
          <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div className="w-full flex-shrink-0">
              {!hasCurrentUserSubmitted ? (
                <StoryInput onSubmit={handleSubmitStory} />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="text-center text-green-300">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-xl font-bold text-white mb-2">Cerita Anda Sudah Dikirim!</h3>
                    <p className="text-sm">Menunggu pemain lain menyelesaikan cerita mereka...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-full flex-shrink-0">
              {/* Story Submission Status - use existing component structure */}
              {/* ... existing status component ... */}
            </div>
          </div>
        );
      case 2: // Guess Author Phase
        return (
          <div className="h-full custom-scrollbar">
            <Answer
              currentStory={submittedStory}
              players={players}
              onSubmitAnswer={handleSubmitAnswer}
            />
          </div>
        );
      case 3: // Review Results
        return (
          <div className="h-full custom-scrollbar">
            <EnhancedReview
              submittedStory={submittedStory}
              storyAuthor={storyAuthor}
              playerGuess={playerGuess}
              players={players}
              guessResults={guessResults}
              allSubmittedStories={submittedStories}
              onPlayAgain={handlePlayAgain}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl lg:text-4xl">📖</span>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Tebak Cerita</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white/80 text-sm">Room: #{roomCode}</div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                roomStatus === 'lobby' ? 'bg-blue-500/20 text-blue-300' :
                roomStatus === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {roomStatus === 'lobby' && '🏠 Lobby'}
                {roomStatus === 'in_progress' && '🎮 Bermain'}
                {roomStatus === 'finished' && '🏁 Selesai'}
              </span>
            </div>
            <div className="text-white/80 text-sm flex items-center gap-1">
              <span>🕐</span>
              <span className="font-mono">{currentTime}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 min-h-0 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Sidebar - Player List */}
            <div className="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
              <div className="h-64 lg:h-full">
                <PlayerListWithLeave
                  players={players}
                  onReady={handleReady}
                  currentUserId={currentUserLocalId}
                  gameStarted={currentStep > 0}
                />
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 order-1 lg:order-2 min-h-0">
              <div className="h-full flex flex-col">
                {/* Stepper - Only show during game */}
                {currentStep > 0 && (
                  <Stepper
                    currentStep={currentStep}
                    onStepChange={handleStepChange}
                    allowBackNavigation={gameFinished}
                  />
                )}

                {/* Game Content */}
                <div className="flex-1 min-h-0">
                  {renderCurrentStep()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
