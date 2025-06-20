"use client";

import { useState } from "react";

interface Answer {
  id: string;
  username: string;
  answer: string;
  isCorrect?: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  type: 'joined' | 'left' | 'message';
}

const AnswerAndChat = () => {
  const [userAnswer, setUserAnswer] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  // Mock data - replace with real data
  const answers: Answer[] = [
    { id: '1', username: 'User261', answer: 'acorn', isCorrect: false },
    { id: '2', username: 'User1926', answer: 'vase', isCorrect: false },
    { id: '3', username: 'User6993', answer: 'cola', isCorrect: false },
    { id: '4', username: 'User8281', answer: 'pepper', isCorrect: false },
    { id: '5', username: 'User6993', answer: 'hit!', isCorrect: true },
    { id: '6', username: 'User8281', answer: 'hit!', isCorrect: true },
  ];

  const chatMessages: ChatMessage[] = [
    { id: '1', username: 'User5130', message: 'joined', type: 'joined' },
    { id: '2', username: 'User5130', message: 'left', type: 'left' },
    { id: '3', username: 'User8942', message: 'joined', type: 'joined' },
  ];

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      console.log('Answer submitted:', userAnswer);
      setUserAnswer('');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      console.log('Chat message:', chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex">
      {/* Left Side - Answers */}
      <div className="flex-1 flex flex-col">
        {/* Answers Header */}
        <div className="bg-blue-600 text-white py-3 px-4 font-bold text-sm text-center">
          ANSWERS
        </div>

        {/* Answers Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-64 max-h-64">
          {answers.map((answer) => (
            <div key={answer.id} className="flex items-center gap-2">
              {answer.isCorrect ? (
                <span className="text-green-500">✓</span>
              ) : null}
              <span className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-gray-600'}`}>
                {answer.username}
              </span>
              <span className={answer.isCorrect ? 'text-green-600' : 'text-gray-500'}>
                {answer.answer}
              </span>
            </div>
          ))}
        </div>

        {/* Answer Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleAnswerSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Answer here..."
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">✏️</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              enter
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Chat */}
      <div className="flex-1 flex flex-col border-l border-gray-200">
        {/* Chat Header */}
        <div className="bg-blue-600 text-white py-3 px-4 font-bold text-sm text-center">
          CHAT
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-64 max-h-64">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex items-center gap-2">
              <span className="text-blue-500">ℹ️</span>
              <span className="text-blue-500 font-medium">{msg.username}</span>
              <span className="text-blue-500">{msg.message}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleChatSubmit}>
            <div className="relative">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="You must log in to chat"
                disabled
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
              />
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnswerAndChat;