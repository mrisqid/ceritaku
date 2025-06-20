"use client";

import { useState } from "react";
import { type Player } from "@/types/room";

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

// ============ COMPONENTS ============

// PlayerList Component
function PlayerList({ players }: PlayerListProps) {
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
            </div>
          ))}
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
      <form onSubmit={handleSubmit} className="space-y-4">
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

// Answer Component
function Answer() {
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

  // Mock data - jawaban sebelumnya
  const previousAnswers: Answer[] = [
    { id: '1', username: 'User261', answer: 'User1926', isCorrect: false },
    { id: '2', username: 'User1926', answer: 'User6993', isCorrect: false },
    { id: '3', username: 'User6993', answer: 'User8281', isCorrect: true },
    { id: '4', username: 'User8281', answer: 'User8281', isCorrect: true },
  ];

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer) {
      console.log('Selected player:', selectedPlayer);
      const selectedPlayerName = players.find(p => p.id === selectedPlayer)?.name;
      console.log('Tebakan:', selectedPlayerName);
      setSelectedPlayer('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg h-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🤔 Siapa Yang Menulis Cerita Ini?
        </h2>
        <p className="text-purple-100 text-sm mt-1">Tebak siapa penulis cerita di bawah ini</p>
      </div>

      {/* Content */}
      <div className="p-6 h-full overflow-y-auto">
        {/* Story Display */}
        <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">📖 Cerita:</h3>
          <p className="text-lg text-gray-800 italic">
            "{currentStory}"
          </p>
        </div>

        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          {/* Player Options */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-gray-700 mb-3">
              Pilih siapa yang menulis cerita ini:
            </h4>
            {players.map((player) => (
              <label
                key={player.id}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPlayer === player.id
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
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedPlayer}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🎯 Kirim Tebakan
          </button>
        </form>

        {/* Previous Guesses Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📊 Tebakan Pemain Lain
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {previousAnswers.map((answer) => (
              <div
                key={answer.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  answer.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {answer.isCorrect ? (
                  <span className="text-green-500 text-lg">✅</span>
                ) : (
                  <span className="text-red-500 text-lg">❌</span>
                )}
                <span className={`font-medium ${
                  answer.isCorrect ? 'text-green-700' : 'text-red-600'
                }`}>
                  {answer.username}
                </span>
                <span className="text-gray-500">menebak:</span>
                <span className={answer.isCorrect ? 'text-green-600' : 'text-gray-600'}>
                  {answer.answer}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN PAGE COMPONENT ============
const mockPlayers: Player[] = [
  { id: "1", name: "devil", points: 64, isCurrentTurn: true },
  { id: "2", name: "JEN", points: 60 },
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
  const [gamePhase, setGamePhase] = useState<'writing' | 'guessing'>('writing');

  const handleSubmitStory = (story: string) => {
    console.log("Submitted story:", story);
    // TODO: Implement socket.io connection to submit story
    // After story submission, switch to guessing phase
    // setGamePhase('guessing');
  };

  const handleSubmitAnswer = (answer: string) => {
    console.log("Submitted answer:", answer);
    // TODO: Implement socket.io connection to submit answer
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
              <div className="h-full flex flex-col gap-4">
                
                {/* Game Phase Content */}
                <div className="flex-1 min-h-0">
                  {gamePhase === 'writing' ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-full max-w-4xl">
                        <StoryInput onSubmit={handleSubmitStory} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full">
                      <Answer />
                    </div>
                  )}
                </div>

                {/* Bottom Controls */}
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setGamePhase('writing')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      gamePhase === 'writing'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    ✍️ Tulis Cerita
                  </button>
                  <button
                    onClick={() => setGamePhase('guessing')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      gamePhase === 'guessing'
                        ? 'bg-white text-purple-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    🤔 Tebak Penulis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}