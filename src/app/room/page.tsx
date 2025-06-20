"use client";

import { useState } from "react";
import { type Player } from "@/types/room";
import { useRouter } from "next/navigation";

// ============ INTERFACES ============
interface StoryInputProps {
  onSubmit: (story: string) => void;
}

interface PlayerListProps {
  players: Player[];
}

interface Answer {
  id: string;
  username: string;
  answer: string;
  isCorrect?: boolean;
}

interface GuessPlayer {
  id: string;
  name: string;
}

interface StepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

// ============ COMPONENTS ============

// Stepper Component
function Stepper({ currentStep, onStepChange }: StepperProps) {
  const steps = [
    { id: 1, title: "Tulis Cerita", icon: "✍️", description: "" },
    { id: 2, title: "Tebak Penulis", icon: "🤔", description: "" },
    { id: 3, title: "Review Hasil", icon: "📊", description: "" }
  ];

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
          const isClickable = currentStep >= step.id;

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center cursor-pointer group"
              onClick={() => isClickable && onStepChange(step.id)}
            >
              {/* Step Circle */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 relative z-10 ${isActive
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-110'
                  : isCompleted
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white/20 text-white/70 group-hover:bg-white/30'
                  }`}
              >
                {isCompleted ? '✅' : step.icon}
              </div>

              {/* Step Content */}
              <div className="mt-3 text-center">
                <h3 className={`font-bold text-sm lg:text-base transition-colors ${isActive ? 'text-white' : 'text-white/80'
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

// PlayerList Component
function PlayerList({ players }: PlayerListProps) {
  function handleKickPlayer(id: string): void {
    throw new Error("Function not implemented.");
  }

  function handleReady(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-bold text-gray-800 text-lg">
          Players ({players.length})
        </h2>
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
                {player.isCurrentTurn && (
                  <div className="absolute -top-1 -left-1 w-4 h-4 lg:w-5 lg:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✏️</span>
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
              {player.isCurrentTurn && (
                <div className="flex-shrink-0">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Turn
                  </span>
                </div>
              )}
              {player.isKicked && (
                <div className="flex-shrink-0">
                  <button onClick={() => handleKickPlayer(player.id)} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    <span className="bg-red-100 text-red-800 text-xs px-0 py-1 rounded-full">
                      ❌
                    </span>
                  </button>

                </div>
              )}
              {player.isHost && (
                <div className="flex-shrink-0">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Host
                  </span>
                </div>
              )}
              {player.isWaiting && (
                <div className="flex-shrink-0">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Waiting
                  </span>
                </div>
              )}
              {player.isReady && (
                <div className="flex-shrink-0">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Ready
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-2 flex justify-center items-center">
          <button onClick={() => handleReady()} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all border-2 border-blue-200 mt-2 w-full">
            Ready
          </button>
        </div>
      </div>
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

// Answer Component - Updated
function Answer({ onSubmitAnswer }: { onSubmitAnswer: () => void }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [currentStory] = useState('Saya pernah tidur di kelas dan tidak ada yang membangunkan saya selama 2 jam');

  // Mock data - daftar pemain
  const players: GuessPlayer[] = [
    { id: '1', name: 'User261' },
    { id: '2', name: 'User1926' },
    { id: '3', name: 'User6993' },
    { id: '4', name: 'User8281' },
    { id: '5', name: 'TestTon' },
    { id: '6', name: 'Aripp' },
  ];

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer) {
      console.log('Selected player:', selectedPlayer);
      const selectedPlayerName = players.find(p => p.id === selectedPlayer)?.name;
      console.log('Tebakan:', selectedPlayerName);

      // Move to next step after successful submission
      onSubmitAnswer();
      setSelectedPlayer('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 flex-shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🤔 Siapa Yang Menulis Cerita Ini?
        </h2>
        <p className="text-purple-100 text-sm mt-1">Tebak siapa penulis cerita di bawah ini</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Story Display */}
        <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📖 Cerita:</h3>
          <p className="text-lg text-gray-800 italic">
            "{currentStory}"
          </p>
        </div>

        {/* Player Options */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Pilih siapa yang menulis cerita ini:
          </h4>
          {players.map((player) => (
            <label
              key={player.id}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedPlayer === player.id
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <input
                type="radio"
                name="player"
                value={player.id}
                checked={selectedPlayer === player.id}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedPlayer === player.id
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

              <span className={`font-medium ${selectedPlayer === player.id ? 'text-purple-700' : 'text-gray-700'
                }`}>
                {player.name}
              </span>
            </label>
          ))}
        </div>

        {/* Extra space for content below sticky button */}
        <div className="h-2"></div>
      </div>

      {/* Sticky Submit Button */}
      <div className="flex-shrink-0 sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleAnswerSubmit}
          disabled={!selectedPlayer}
          className={`w-full font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform ${selectedPlayer
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {selectedPlayer
            ? `🎯 Kirim Tebakan: ${players.find(p => p.id === selectedPlayer)?.name}`
            : '🤔 Pilih pemain terlebih dahulu'
          }
        </button>
      </div>
    </div>
  );
}

// Updated Genre Selection Component
function GenreSelection() {
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = [
    { id: 'funny', name: 'Lucu', icon: '😂', color: 'from-yellow-400 to-orange-400',},
    { id: 'embarrassing', name: 'Memalukan', icon: '😅', color: 'from-red-400 to-pink-400', },
    { id: 'scary', name: 'Menyeramkan', icon: '👻', color: 'from-purple-400 to-indigo-400', },
    { id: 'romantic', name: 'Romantis', icon: '💕', color: 'from-pink-400 to-rose-400', },
    { id: 'adventure', name: 'Petualangan', icon: '🗺️', color: 'from-blue-400 to-cyan-400', },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/20 shadow-lg w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl">🎭</span>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Pilih Genre Cerita
          </h3>
        </div>
        <span className="text-xs sm:text-sm font-normal text-white/70 sm:ml-2">
          (Opsional)
        </span>
      </div>

      {/* Description */}
      <p className="text-white/80 text-xs sm:text-sm mb-4 leading-relaxed">
        Beri petunjuk kepada pemain lain tentang jenis cerita yang akan kamu tulis
      </p>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(selectedGenre === genre.id ? '' : genre.id)}
            className={`flex flex-col justify-center items-center group relative overflow-hidden rounded-lg p-3 sm:p-4 transition-all duration-300 transform hover:scale-105 ${selectedGenre === genre.id
                ? 'ring-2 ring-white shadow-lg scale-105'
                : 'hover:shadow-md'
              }`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{genre.icon}</div>
              <div className="font-bold text-white text-xs sm:text-sm mb-1">{genre.name}</div>
              {/* Shorter description for mobile */}
              <div className="text-white/90 text-xs leading-tight block sm:hidden">
                {genre.name === 'Lucu' && 'Yang menghibur'}
                {genre.name === 'Memalukan' && 'Momen awkward'}
                {genre.name === 'Menyeramkan' && 'Bikin merinding'}
                {genre.name === 'Romantis' && 'Kisah hati'}
                {genre.name === 'Petualangan' && 'Seru & menantang'}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedGenre === genre.id && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs sm:text-sm font-bold">✓</span>
              </div>
            )}

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          </button>
        ))}
      </div>

      {/* Selected Genre Display */}
      {selectedGenre && (
        <div className="mt-4 p-3 bg-white/20 rounded-lg">
          <div className="flex items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm sm:text-base">{genres.find(g => g.id === selectedGenre)?.icon}</span>
              <span className="font-medium text-sm sm:text-base truncate">
                Genre: {genres.find(g => g.id === selectedGenre)?.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedGenre('')}
              className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
              aria-label="Hapus pilihan genre"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Review Component
function Review({ onPlayAgain }: { onPlayAgain: () => void }) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  // Mock data - hasil tebakan pemain
  const guessResults = [
    { id: '1', player: 'User261', guess: 'User1926', correct: false, story: 'Saya pernah tidur di kelas dan tidak ada yang membangunkan saya selama 2 jam', points: 0 },
    { id: '2', player: 'User1926', guess: 'User6993', correct: false, story: 'Saya pernah tidur di kelas dan tidak ada yang membangunkan saya selama 2 jam', points: 0 },
    { id: '3', player: 'User6993', guess: 'User8281', correct: true, story: 'Saya pernah tidur di kelas dan tidak ada yang membangunkan saya selama 2 jam', points: 10 },
    { id: '4', player: 'User8281', guess: 'User8281', correct: true, story: 'Saya pernah tidur di kelas dan tidak ada yang membangunkan saya selama 2 jam', points: 10 },
  ];

  const correctGuesses = guessResults.filter(r => r.correct).length;
  const totalGuesses = guessResults.length;
  const accuracyPercentage = Math.round((correctGuesses / totalGuesses) * 100);

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
          <p className="text-emerald-100 text-sm">Selamat! Lihat siapa yang berhasil menebak dengan benar</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Accuracy Score */}
        <div className="mb-6 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white text-center shadow-lg">
          <div className="text-5xl font-bold mb-2">{accuracyPercentage}%</div>
          <div className="text-emerald-100 text-lg">Tingkat Akurasi</div>
          <div className="text-emerald-200 text-sm mt-1">
            {correctGuesses} dari {totalGuesses} tebakan benar
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

        {/* Results List with Enhanced Design */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎯 Detail Tebakan Pemain
          </h3>

          {guessResults.map((result, index) => (
            <div
              key={result.id}
              className={`relative overflow-hidden rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg ${result.correct
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50'
                : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Result Badge */}
        

              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  {/* Player Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${result.correct ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                    <span className="text-white">👤</span>
                  </div>

                  {/* Player Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-lg ${result.correct ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                        {result.player}
                      </span>
                      <span className="text-gray-500">menebak:</span>
                      <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded-lg">
                        {result.guess}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic bg-white/50 p-2 rounded">
                      "{result.story}"
                    </p>
                  </div>

                  {/* Points Display */}
                  <div className="text-center">
                  <div className={` w-8 h-8 rounded-full flex items-center justify-center ${result.correct ? 'bg-emerald-500' : 'bg-red-500'
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

                {/* Progress bar for visual appeal */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${result.correct ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    style={{
                      width: result.correct ? '100%' : '30%',
                      animationDelay: `${index * 0.2}s`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            {/* 🔄 Main Lagi */}
            Lobby
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

// ============ MAIN PAGE COMPONENT ============
const mockPlayers: Player[] = [
  { id: "1", name: "devil", points: 64, isCurrentTurn: true },
  { id: "2", name: "JEN", points: 60, isKicked: true },
  { id: "3", name: "Lunie", points: 58 },
  { id: "4", name: "ObitoUvhiha", points: 9 },
  { id: "5", name: "TestTon", points: 8 },
  { id: "6", name: "Aripp", points: 0 },
  { id: "7", name: "Nagi seishiro", points: 0 },
  { id: "8", name: "Player 8", points: 0 },
  { id: "9", name: "Player 9", points: 0 },
];

export default function RoomPage() {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleSubmitStory = (story: string) => {
    console.log("Submitted story:", story);
    // TODO: Implement socket.io connection to submit story
    // After story submission, move to next step
    setCurrentStep(2);
  };

  const handleSubmitAnswer = (answer: string) => {
    console.log("Submitted answer:", answer);
    // TODO: Implement socket.io connection to submit answer
    // After answer submission, move to review step
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="h-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
            <div className="w-full flex-shrink-0">
              <StoryInput onSubmit={handleSubmitStory} />
            </div>
            <div className="w-full flex-shrink-0">
              <GenreSelection />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="h-full custom-scrollbar">
            <Answer onSubmitAnswer={() => setCurrentStep(3)} />
          </div>
        );
      case 3:
        return (
          <div className="h-full custom-scrollbar">
            <Review onPlayAgain={() => setCurrentStep(1)} />
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
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Tebak Cerita
              </h1>
            </div>
            <div className="text-white/80 text-sm lg:text-base">
              Room: #ABC123
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 min-h-0 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-4 lg:gap-6">

            {/* Left Sidebar - Player List */}
            <div className="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
              <div className="h-64 lg:h-full">
                <PlayerList players={players} />
              </div>
            </div>

            {/* Main Game Area */}
            <div className="flex-1 order-1 lg:order-2 min-h-0">
              <div className="h-full flex flex-col">

                {/* Stepper */}
                <Stepper currentStep={currentStep} onStepChange={setCurrentStep} />

                {/* Game Phase Content */}
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