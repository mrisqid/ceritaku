import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
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

  // Refs for cleanup
  const subscriptionRef = useRef<unknown>(null);

  // Initialize room
  const initializeRoom = useCallback(async () => {
    if (!roomCode) return;

    try {
      setLoading(true);
      setError(null);

      // Get room data
      const room = await roomService.getRoomByCode(roomCode);
      if (!room) {
        setError("Ruangan tidak ditemukan");
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

      // Set up real-time subscription
      setupRealtimeSubscription(room.id);
    } catch (err) {
      console.error("Error initializing room:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat ruangan");
    } finally {
      setLoading(false);
    }
  }, [roomCode, currentStory]);

  // Set up real-time subscription
  const setupRealtimeSubscription = useCallback((roomId: string) => {
    // Clean up existing subscription
    if (
      subscriptionRef.current &&
      typeof subscriptionRef.current === "object" &&
      subscriptionRef.current !== null
    ) {
      const subscription = subscriptionRef.current as {
        unsubscribe: () => void;
      };
      subscription.unsubscribe();
    }

    // Create new subscription
    subscriptionRef.current = roomService.subscribeToRoom(roomId, (payload) => {
      console.log("Realtime update:", payload);

      // Handle different types of updates
      if (payload && typeof payload === "object" && "table" in payload) {
        const table = (payload as { table: string }).table;

        switch (table) {
          case "rooms":
            handleRoomUpdate();
            break;
          case "players":
            handlePlayerUpdate();
            break;
          case "stories":
            handleStoryUpdate();
            break;
          case "guesses":
            handleGuessUpdate();
            break;
        }
      }
    });
  }, []);

  // Handle room updates
  const handleRoomUpdate = useCallback(async () => {
    try {
      const room = await roomService.getRoomByCode(roomCode);
      if (room) {
        setRoomPhase(room.phase);
        setGamePhase(room.game_phase);
      }
    } catch (err) {
      console.error("Error handling room update:", err);
    }
  }, [roomCode]);

  // Handle player updates
  const handlePlayerUpdate = useCallback(async () => {
    try {
      const updatedPlayers = await roomService.getPlayersInRoom(roomId);
      setPlayers(updatedPlayers);
    } catch (err) {
      console.error("Error handling player update:", err);
    }
  }, [roomId]);

  // Handle story updates
  const handleStoryUpdate = useCallback(async () => {
    try {
      const story = await roomService.getCurrentStory(roomId);
      setCurrentStory(story);
    } catch (err) {
      console.error("Error handling story update:", err);
    }
  }, [roomId]);

  // Handle guess updates
  const handleGuessUpdate = useCallback(async () => {
    try {
      if (currentStory) {
        const results = await roomService.getGuessResults(currentStory.id);
        setGuessResults(results);
      }
    } catch (err) {
      console.error("Error handling guess update:", err);
    }
  }, [currentStory]);

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
        setError(
          err instanceof Error ? err.message : "Gagal bergabung ke ruangan"
        );
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
        await roomService.updatePlayerReady(roomId, localPlayerId, isReady);

        // Update local player state
        setLocalPlayer((prev) => (prev ? { ...prev, isReady } : null));

        // Refresh players list
        const updatedPlayers = await roomService.getPlayersInRoom(roomId);
        setPlayers(updatedPlayers);
      } catch (err) {
        console.error("Error updating ready status:", err);
        setError(
          err instanceof Error ? err.message : "Gagal mengupdate status siap"
        );
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
        setError(err instanceof Error ? err.message : "Gagal mengirim cerita");
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
        setError(err instanceof Error ? err.message : "Gagal mengirim tebakan");
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

      // Clean up subscription
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current === "object" &&
        subscriptionRef.current !== null
      ) {
        const subscription = subscriptionRef.current as {
          unsubscribe: () => void;
        };
        subscription.unsubscribe();
        subscriptionRef.current = null;
      }

      // Reset local state
      setLocalPlayer(null);
      setLocalPlayerId("");
    } catch (err) {
      console.error("Error leaving room:", err);
      setError(
        err instanceof Error ? err.message : "Gagal keluar dari ruangan"
      );
    }
  }, [roomId, localPlayerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        subscriptionRef.current &&
        typeof subscriptionRef.current === "object" &&
        subscriptionRef.current !== null
      ) {
        const subscription = subscriptionRef.current as {
          unsubscribe: () => void;
        };
        subscription.unsubscribe();
      }
    };
  }, []);

  // Initialize room on mount
  useEffect(() => {
    initializeRoom();
  }, [initializeRoom]);

  return {
    // Room state
    roomId,
    roomName,
    roomPhase,
    gamePhase,
    players,
    currentStory,
    guessResults,
    loading,
    error,

    // Local player state
    localPlayerId,
    localPlayer,

    // Actions
    joinRoom,
    updateReadyStatus,
    submitStory,
    submitGuess,
    leaveRoom,

    // Error handling
    clearError: () => setError(null),
  };
};
