import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import * as roomService from "@/services/roomService";
import type { Player, Story, GuessResult } from "@/types/room";

export const useRoom = () => {
  const params = useParams();
  const roomCode = params?.code as string;

  // State
  const [roomId, setRoomId] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [roomPhase, setRoomPhase] = useState<"lobby" | "gameplay" | "result">(
    "lobby"
  );
  const [gamePhase, setGamePhase] = useState<
    "story_input" | "guessing" | "reveal"
  >("story_input");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local player state
  const [localPlayerId, setLocalPlayerId] = useState<string>("");
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);

  // Initialize room
  const initializeRoom = useCallback(async () => {
    if (!roomCode) return;

    try {
      setLoading(true);
      setError(null);

      // Get room data
      const room = await roomService.getRoomByCode(roomCode);
      if (!room) {
        setError("Room not found");
        return;
      }

      setRoomId(room.id);
      setRoomName(room.name);
      setRoomPhase(room.phase);
      setGamePhase(room.game_phase);

      // Get players
      const roomPlayers = await roomService.getPlayersInRoom(room.id);
      setPlayers(roomPlayers);

      // Get current story if in gameplay
      if (room.phase === "gameplay") {
        const story = await roomService.getCurrentStory(room.id);
        setCurrentStory(story);
      }

      // Get guess results if in result phase
      if (room.phase === "result" && currentStory) {
        const results = await roomService.getGuessResults(currentStory.id);
        setGuessResults(results);
      }
    } catch (err) {
      console.error("Error initializing room:", err);
      setError("Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [roomCode, currentStory]);

  // Join room
  const joinRoom = useCallback(
    async (playerName: string, avatar: string = "😊") => {
      if (!roomId) return null;

      try {
        // Generate local player ID
        const localId = crypto.randomUUID();
        setLocalPlayerId(localId);

        // Check if this is the first player (host)
        const isHost = players.length === 0;

        const player = await roomService.joinRoom(roomId, {
          localId,
          name: playerName,
          avatar,
          isHost,
        });

        if (player) {
          setLocalPlayer(player);
          // Refresh players list
          const updatedPlayers = await roomService.getPlayersInRoom(roomId);
          setPlayers(updatedPlayers);
        }

        return player;
      } catch (err) {
        console.error("Error joining room:", err);
        setError("Failed to join room");
        return null;
      }
    },
    [roomId, players.length]
  );

  // Update player ready status
  const updateReadyStatus = useCallback(
    async (isReady: boolean) => {
      if (!roomId || !localPlayerId) return;

      try {
        const success = await roomService.updatePlayerReady(
          roomId,
          localPlayerId,
          isReady
        );
        if (success) {
          // Update local player state
          setLocalPlayer((prev) => (prev ? { ...prev, isReady } : null));

          // Refresh players list
          const updatedPlayers = await roomService.getPlayersInRoom(roomId);
          setPlayers(updatedPlayers);
        }
      } catch (err) {
        console.error("Error updating ready status:", err);
      }
    },
    [roomId, localPlayerId]
  );

  // Submit story
  const submitStory = useCallback(
    async (content: string) => {
      if (!roomId || !localPlayer) return null;

      try {
        const story = await roomService.submitStory(
          roomId,
          localPlayer.id,
          content
        );
        if (story) {
          setCurrentStory(story);
          // Update room phase to guessing
          await roomService.updateRoomPhase(roomId, "gameplay", "guessing");
          setRoomPhase("gameplay");
          setGamePhase("guessing");
        }
        return story;
      } catch (err) {
        console.error("Error submitting story:", err);
        return null;
      }
    },
    [roomId, localPlayer]
  );

  // Submit guess
  const submitGuess = useCallback(
    async (guessedAuthorId: string) => {
      if (!currentStory || !localPlayer) return null;

      try {
        const guess = await roomService.submitGuess(
          currentStory.id,
          localPlayer.id,
          guessedAuthorId
        );
        if (guess) {
          // Get updated results
          const results = await roomService.getGuessResults(currentStory.id);
          setGuessResults(results);

          // Update room phase to result
          await roomService.updateRoomPhase(roomId, "result", "reveal");
          setRoomPhase("result");
          setGamePhase("reveal");
        }
        return guess;
      } catch (err) {
        console.error("Error submitting guess:", err);
        return null;
      }
    },
    [currentStory, localPlayer, roomId]
  );

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!roomId || !localPlayerId) return;

    try {
      await roomService.leaveRoom(roomId, localPlayerId);
      // Reset local state
      setLocalPlayer(null);
      setLocalPlayerId("");
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  }, [roomId, localPlayerId]);

  // Real-time subscriptions
  useEffect(() => {
    if (!roomId) return;

    const subscription = roomService.subscribeToRoom(roomId, (payload) => {
      console.log("Real-time update:", payload);

      // Handle different types of updates
      if (payload.table === "rooms") {
        setRoomPhase(payload.new.phase);
        setGamePhase(payload.new.game_phase);
      } else if (payload.table === "players") {
        // Refresh players list
        roomService.getPlayersInRoom(roomId).then(setPlayers);
      } else if (payload.table === "stories") {
        // Refresh current story
        roomService.getCurrentStory(roomId).then(setCurrentStory);
      } else if (payload.table === "guesses" && currentStory) {
        // Refresh guess results
        roomService.getGuessResults(currentStory.id).then(setGuessResults);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId, currentStory]);

  // Initialize on mount
  useEffect(() => {
    initializeRoom();
  }, [initializeRoom]);

  return {
    // Room data
    roomId,
    roomName,
    roomCode,
    roomPhase,
    gamePhase,
    players,
    currentStory,
    guessResults,

    // Local player
    localPlayer,
    localPlayerId,

    // State
    loading,
    error,

    // Actions
    joinRoom,
    updateReadyStatus,
    submitStory,
    submitGuess,
    leaveRoom,

    // Computed values
    isHost: localPlayer?.isHost || false,
    readyPlayers: players.filter((p) => p.isReady),
    allPlayersReady: players.length >= 2 && players.every((p) => p.isReady),
    minPlayersReached: players.length >= 2,
  };
};
