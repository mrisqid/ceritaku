"use client";

import { useState, useRef, useEffect } from "react";

interface EmojiReactionProps {
  storyId: string;
}

export default function EmojiReaction({ storyId }: EmojiReactionProps) {
  const [selectedReaction, setSelectedReaction] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    thumbsup: 0,
    pray: 0,
    joy: 0,
    love: 0,
    clap: 0,
    fire: 0,
    grin: 0,
    smile: 0,
    thinking: 0,
    wow: 0
  });

  const allReactions = [
    { id: 'thumbsup', emoji: '👍' },
    { id: 'pray', emoji: '🙏' },
    { id: 'joy', emoji: '😂' },
    { id: 'love', emoji: '❤️' },
    { id: 'clap', emoji: '👏' },
    { id: 'fire', emoji: '🔥' },
    { id: 'grin', emoji: '😄' },
    { id: 'smile', emoji: '😊' },
    { id: 'thinking', emoji: '🤔' },
    { id: 'wow', emoji: '😮' }
  ];

  // Get reactions that have been used (count > 0)
  const usedReactions = allReactions.filter(reaction => reactionCounts[reaction.id] > 0);

  // Set limit to 4 types of reactions maximum
  const REACTION_LIMIT = 4;
  const hasReachedLimit = usedReactions.length >= REACTION_LIMIT;

  const handleReactionClick = (reactionId: string) => {
    setReactionCounts(prev => ({
      ...prev,
      [reactionId]: prev[reactionId] > 0 ? prev[reactionId] - 1 : prev[reactionId] + 1
    }));
    setSelectedReaction(reactionId);
  };

  const handlePickerReactionClick = (reactionId: string) => {
    const reactionExists = reactionCounts[reactionId] > 0;

    if (reactionExists || !hasReachedLimit) {
      setReactionCounts(prev => ({
        ...prev,
        [reactionId]: prev[reactionId] + 1
      }));
      setSelectedReaction(reactionId);
      setShowPicker(false);
    } else {
      alert(`Maksimal ${REACTION_LIMIT} jenis emoticon yang bisa ditambahkan!`);
      setShowPicker(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap relative">
      {/* Display active reactions */}
      {usedReactions.map((reaction) => {
        const isSelected = selectedReaction === reaction.id;
        const count = reactionCounts[reaction.id];

        return (
          <button
            key={reaction.id}
            onClick={() => handleReactionClick(reaction.id)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs
              border transition-all duration-200 hover:scale-105
              ${isSelected
                ? 'bg-blue-500 border-blue-400 text-white shadow-md'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30'
              }
            `}
          >
            <span className="text-sm">{reaction.emoji}</span>
            <span className="font-medium min-w-[16px] text-center">{count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      {!hasReachedLimit && (
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
          >
            <div className="relative">
              <span className="text-xs">😊</span>
              <span className="absolute -top-1 -right-1 text-xs text-green-400">+</span>
            </div>
          </button>

          {/* Reaction picker dropdown - Simplified positioning */}
          {showPicker && (
            <div
              ref={dropdownRef}
              className="absolute bottom-full right-0 mb-2 z-50 p-3 bg-white rounded-lg shadow-xl border min-w-[200px]"
            >
              {/* Header */}
              <div className="text-xs text-gray-600 mb-2 text-center font-medium">
                Pilih emoticon ({usedReactions.length}/{REACTION_LIMIT})
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-5 gap-1">
                {allReactions.map((reaction) => {
                  const reactionExists = reactionCounts[reaction.id] > 0;
                  const isDisabled = !reactionExists && hasReachedLimit;

                  return (
                    <button
                      key={reaction.id}
                      onClick={() => !isDisabled && handlePickerReactionClick(reaction.id)}
                      disabled={isDisabled}
                      className={`
                        p-2 rounded transition-all duration-150 text-lg
                        flex items-center justify-center aspect-square
                        ${isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-gray-100'
                          : 'hover:bg-blue-50 hover:scale-110 cursor-pointer'
                        }
                        ${reactionExists ? 'bg-blue-50' : 'hover:bg-gray-100'}
                      `}
                      title={isDisabled ? 'Limit emoticon tercapai' : reaction.id}
                    >
                      {reaction.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close picker */}
      {showPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}