import {
  supabase,
  handleSupabaseError,
  validateRoomCode,
  generateUniqueRoomCode,
} from "@/utils/supabaseClient";
import type { Player, Story, Guess, GuessResult } from "@/types/room";

// ============ ROOM OPERATIONS ============

export const createRoom = async (
  name: string
): Promise<{ roomId: string; code: string } | null> => {
  try {
    // Generate unique room code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateUniqueRoomCode();
      attempts++;

      // Check if code already exists
      const { data: existingRoom } = await supabase
        .from("rooms")
        .select("code")
        .eq("code", code)
        .single();

      if (!existingRoom) break;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("Gagal membuat kode ruangan unik");
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        name,
        phase: "lobby",
        game_phase: "story_input",
      })
      .select("id, code")
      .single();

    if (error) throw error;
    return { roomId: data.id, code: data.code };
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error(handleSupabaseError(error, "createRoom"));
  }
};

export const getRoomByCode = async (code: string) => {
  try {
    if (!validateRoomCode(code)) {
      throw new Error("Format kode ruangan tidak valid");
    }

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting room:", error);
    throw new Error(handleSupabaseError(error, "getRoomByCode"));
  }
};

export const updateRoomPhase = async (
  roomId: string,
  phase: "lobby" | "gameplay" | "result",
  gamePhase?: "story_input" | "guessing" | "reveal"
) => {
  try {
    const updateData: {
      phase: "lobby" | "gameplay" | "result";
      updated_at: string;
      game_phase?: "story_input" | "guessing" | "reveal";
    } = {
      phase,
      updated_at: new Date().toISOString(),
    };
    if (gamePhase) updateData.game_phase = gamePhase;

    const { error } = await supabase
      .from("rooms")
      .update(updateData)
      .eq("id", roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating room phase:", error);
    throw new Error(handleSupabaseError(error, "updateRoomPhase"));
  }
};

export const deleteRoom = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("rooms").delete().eq("id", roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw new Error(handleSupabaseError(error, "deleteRoom"));
  }
};

// ============ PLAYER OPERATIONS ============

export const joinRoom = async (
  roomId: string,
  playerData: {
    localId: string;
    name: string;
    avatar: string;
    isHost?: boolean;
  }
): Promise<Player | null> => {
  try {
    // Validate input
    if (!playerData.name.trim()) {
      throw new Error("Nama pemain tidak boleh kosong");
    }

    // Check if room exists and is in lobby phase
    const { data: room } = await supabase
      .from("rooms")
      .select("phase")
      .eq("id", roomId)
      .single();

    if (!room) {
      throw new Error("Ruangan tidak ditemukan");
    }

    if (room.phase !== "lobby") {
      throw new Error("Ruangan sudah dalam permainan");
    }

    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .eq("local_id", playerData.localId)
      .single();

    if (existingPlayer) {
      return mapPlayerFromDB(existingPlayer);
    }

    // Check room capacity
    const { count: playerCount } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    if (playerCount && playerCount >= 5) {
      throw new Error("Ruangan sudah penuh");
    }

    // Create new player
    const { data, error } = await supabase
      .from("players")
      .insert({
        room_id: roomId,
        local_id: playerData.localId,
        name: playerData.name.trim(),
        avatar: playerData.avatar,
        is_host: playerData.isHost || false,
        is_ready: false,
        score: 0,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapPlayerFromDB(data);
  } catch (error) {
    console.error("Error joining room:", error);
    throw new Error(handleSupabaseError(error, "joinRoom"));
  }
};

export const getPlayersInRoom = async (roomId: string): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data.map(mapPlayerFromDB);
  } catch (error) {
    console.error("Error getting players:", error);
    throw new Error(handleSupabaseError(error, "getPlayersInRoom"));
  }
};

export const updatePlayerReady = async (
  roomId: string,
  localId: string,
  isReady: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("players")
      .update({
        is_ready: isReady,
        updated_at: new Date().toISOString(),
      })
      .eq("room_id", roomId)
      .eq("local_id", localId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating player ready status:", error);
    throw new Error(handleSupabaseError(error, "updatePlayerReady"));
  }
};

export const updatePlayerScore = async (
  roomId: string,
  localId: string,
  score: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("players")
      .update({
        score,
        updated_at: new Date().toISOString(),
      })
      .eq("room_id", roomId)
      .eq("local_id", localId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating player score:", error);
    throw new Error(handleSupabaseError(error, "updatePlayerScore"));
  }
};

export const leaveRoom = async (
  roomId: string,
  localId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("room_id", roomId)
      .eq("local_id", localId);

    if (error) throw error;

    // Check if room is empty and delete it
    const { count: remainingPlayers } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    if (remainingPlayers === 0) {
      await deleteRoom(roomId);
    }

    return true;
  } catch (error) {
    console.error("Error leaving room:", error);
    throw new Error(handleSupabaseError(error, "leaveRoom"));
  }
};

// ============ STORY OPERATIONS ============

export const submitStory = async (
  roomId: string,
  authorId: string,
  content: string
): Promise<Story | null> => {
  try {
    if (!content.trim()) {
      throw new Error("Cerita tidak boleh kosong");
    }

    // Check if story already exists for this author in this room
    const { data: existingStory } = await supabase
      .from("stories")
      .select("id")
      .eq("room_id", roomId)
      .eq("author_id", authorId)
      .single();

    if (existingStory) {
      // Update existing story
      const { data, error } = await supabase
        .from("stories")
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStory.id)
        .select("*")
        .single();

      if (error) throw error;
      return mapStoryFromDB(data);
    }

    // Create new story
    const { data, error } = await supabase
      .from("stories")
      .insert({
        room_id: roomId,
        author_id: authorId,
        content: content.trim(),
        is_revealed: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapStoryFromDB(data);
  } catch (error) {
    console.error("Error submitting story:", error);
    throw new Error(handleSupabaseError(error, "submitStory"));
  }
};

export const getCurrentStory = async (
  roomId: string
): Promise<Story | null> => {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_revealed", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return mapStoryFromDB(data);
  } catch (error) {
    console.error("Error getting current story:", error);
    throw new Error(handleSupabaseError(error, "getCurrentStory"));
  }
};

export const revealStory = async (storyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("stories")
      .update({
        is_revealed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error revealing story:", error);
    throw new Error(handleSupabaseError(error, "revealStory"));
  }
};

// ============ GUESS OPERATIONS ============

export const submitGuess = async (
  storyId: string,
  playerId: string,
  guessedAuthorId: string
): Promise<Guess | null> => {
  try {
    // Get the story to check if guess is correct
    const { data: story } = await supabase
      .from("stories")
      .select("author_id")
      .eq("id", storyId)
      .single();

    if (!story) throw new Error("Story not found");

    const isCorrect = story.author_id === guessedAuthorId;

    const { data, error } = await supabase
      .from("guesses")
      .insert({
        story_id: storyId,
        player_id: playerId,
        guessed_author_id: guessedAuthorId,
        is_correct: isCorrect,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapGuessFromDB(data);
  } catch (error) {
    console.error("Error submitting guess:", error);
    throw new Error(handleSupabaseError(error, "submitGuess"));
  }
};

export const getGuessResults = async (
  storyId: string
): Promise<GuessResult[]> => {
  try {
    const { data, error } = await supabase
      .from("guesses")
      .select(
        `
        *,
        player:players!guesses_player_id_fkey(name, avatar),
        guessed_author:players!guesses_guessed_author_id_fkey(name, avatar),
        story:stories!guesses_story_id_fkey(content)
      `
      )
      .eq("story_id", storyId);

    if (error) throw error;

    return data.map((guess) => ({
      id: guess.id,
      player: guess.player?.name || "Unknown",
      guess: guess.guessed_author?.name || "Unknown",
      guessId: guess.guessed_author_id,
      correct: guess.is_correct,
      story: guess.story?.content || "",
      points: guess.is_correct ? 10 : 0,
    }));
  } catch (error) {
    console.error("Error getting guess results:", error);
    throw new Error(handleSupabaseError(error, "getGuessResults"));
  }
};

// ============ REALTIME SUBSCRIPTIONS ============

export const subscribeToRoom = (
  roomId: string,
  callback: (payload: unknown) => void
) => {
  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "stories",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "guesses",
        filter: `story_id=in.(select id from stories where room_id='${roomId}')`,
      },
      callback
    )
    .subscribe();

  return subscription;
};

// ============ HELPER FUNCTIONS ============

const mapPlayerFromDB = (dbPlayer: {
  id: string;
  local_id: string;
  name: string;
  avatar: string;
  score: number;
  is_host: boolean;
  is_ready: boolean;
  created_at: string;
  updated_at: string;
}): Player => ({
  id: dbPlayer.id,
  local_id: dbPlayer.local_id,
  name: dbPlayer.name,
  points: dbPlayer.score,
  avatar: dbPlayer.avatar,
  isHost: dbPlayer.is_host,
  isReady: dbPlayer.is_ready,
  isCurrentTurn: false,
  isKicked: false,
  isWaiting: false,
});

const mapStoryFromDB = (dbStory: {
  id: string;
  room_id: string;
  author_id: string;
  content: string;
  is_revealed: boolean;
  created_at: string;
  updated_at: string;
}): Story => ({
  id: dbStory.id,
  content: dbStory.content,
  authorId: dbStory.author_id,
  isRevealed: dbStory.is_revealed,
});

const mapGuessFromDB = (dbGuess: {
  id: string;
  story_id: string;
  player_id: string;
  guessed_author_id: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}): Guess => ({
  id: dbGuess.id,
  storyId: dbGuess.story_id,
  playerId: dbGuess.player_id,
  guessedAuthorId: dbGuess.guessed_author_id,
  isCorrect: dbGuess.is_correct,
});
