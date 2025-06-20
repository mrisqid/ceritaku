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

interface StepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

// ============ COMPONENTS ============

// Stepper Component
function Stepper({ currentStep, onStepChange }: StepperProps) {
  const steps = [
    { id: 1, title: "Tulis Cerita", icon: "✍️", description: "Tulis cerita menarik" },
    { id: 2, title: "Tebak Penulis", icon: "🤔", description: "Tebak siapa penulisnya" },
    { id: 3, title: "Review Hasil", icon: "📊", description: "Lihat hasil tebakan" }
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
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 relative z-10 ${
                  isActive 
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
                <h3 className={`font-bold text-sm lg:text-base transition-colors ${
                  isActive ? 'text-white' : 'text-white/80'
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
      </div>
    </div>
  );
}

// Review Component
function Review() {
  // Mock data - hasil tebakan pemain
  const guessResults = [
    { id: '1', player: 'User261', guess: 'User1926', correct: false, story: 'Saya pernah tidur di kelas...' },
    { id: '2', player: 'User1926', guess: 'User6993', correct: false, story: 'Saya pernah tidur di kelas...' },
    { id: '3', player: 'User6993', guess: 'User8281', correct: true, story: 'Saya pernah tidur di kelas...' },
    { id: '4', player: 'User8281', guess: 'User8281', correct: true, story: 'Saya pernah tidur di kelas...' },
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-100 rounded-xl shadow-lg h-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📊 Review Hasil Tebakan
        </h2>
        <p className="text-green-100 text-sm mt-1">Lihat siapa yang berhasil menebak dengan benar</p>
      </div>

      {/* Content */}
      <div className="p-6 h-full overflow-y-auto">
        {/* Summary */}
        <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-green-500 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-2">📈 Ringkasan</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {guessResults.filter(r => r.correct).length}
              </div>
              <div className="text-sm text-gray-600">Tebakan Benar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {guessResults.filter(r => !r.correct).length}
              </div>
              <div className="text-sm text-gray-600">Tebakan Salah</div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Detail Tebakan</h3>
          {guessResults.map((result) => (
            <div
              key={result.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                result.correct
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Status Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                result.correct ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="text-white text-lg">
                  {result.correct ? '✅' : '❌'}
                </span>
              </div>

              {/* Player Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${
                    result.correct ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.player}
                  </span>
                  <span className="text-gray-500">menebak:</span>
                  <span className="font-medium text-gray-700">{result.guess}</span>
                </div>
                <p className="text-sm text-gray-600 italic">"{result.story}"</p>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  result.correct ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.correct ? '+10' : '+0'}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
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
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <StoryInput onSubmit={handleSubmitStory} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="h-full">
            <Answer />
          </div>
        );
      case 3:
        return (
          <div className="h-full">
            <Review />
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