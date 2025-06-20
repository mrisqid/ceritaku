"use client";

import { useState } from "react";

interface StoryInputProps {
  onSubmit: (story: string) => void;
}

export default function StoryInput({ onSubmit }: StoryInputProps) {
  const [story, setStory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story.trim()) {
      onSubmit(story);
      setStory("");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        ✍️ Tulis Cerita Kamu
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Tulis cerita atau fun fact menarik tentang dirimu..."
          className="w-full bg-white/20 rounded-lg px-4 py-3 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[120px] resize-none"
        />
        <button
          type="submit"
          disabled={!story.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📝 Kirim Cerita
        </button>
      </form>
    </div>
  );
} 