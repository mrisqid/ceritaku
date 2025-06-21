import { supabase } from "@/utils/supabaseClient";
import type { Player, Story, Guess, GuessResult } from "@/types/room";

// ============ ROOM OPERATIONS ============

export const createRoom = async (
  name: string
): Promise<{ roomId: string; code: string } | null> => {
  try {
    // Generate unique 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

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
    return null;
  }
};

export const getRoomByCode = async (code: string) => {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", code)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting room:", error);
    return null;
  }
};

export const updateRoomPhase = async (
  roomId: string,
  phase: "lobby" | "gameplay" | "result",
  gamePhase?: "story_input" | "guessing" | "reveal"
) => {
  try {
    const updateData: any = { phase };
    if (gamePhase) updateData.game_phase = gamePhase;

    const { error } = await supabase
      .from("rooms")
      .update(updateData)
      .eq("id", roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating room phase:", error);
    return false;
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

    // Create new player
    const { data, error } = await supabase
      .from("players")
      .insert({
        room_id: roomId,
        local_id: playerData.localId,
        name: playerData.name,
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
    return null;
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
    return [];
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
      .update({ is_ready: isReady })
      .eq("room_id", roomId)
      .eq("local_id", localId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating player ready status:", error);
    return false;
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
      .update({ score })
      .eq("room_id", roomId)
      .eq("local_id", localId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating player score:", error);
    return false;
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
    return true;
  } catch (error) {
    console.error("Error leaving room:", error);
    return false;
  }
};

// ============ STORY OPERATIONS ============

export const submitStory = async (
  roomId: string,
  authorId: string,
  content: string
): Promise<Story | null> => {
  try {
    const { data, error } = await supabase
      .from("stories")
      .insert({
        room_id: roomId,
        author_id: authorId,
        content,
        is_revealed: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return mapStoryFromDB(data);
  } catch (error) {
    console.error("Error submitting story:", error);
    return null;
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
    return null;
  }
};

export const revealStory = async (storyId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("stories")
      .update({ is_revealed: true })
      .eq("id", storyId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error revealing story:", error);
    return false;
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
    return null;
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
        players!guesses_player_id_fkey(name),
        stories!guesses_story_id_fkey(content)
      `
      )
      .eq("story_id", storyId);

    if (error) throw error;

    return data.map((guess) => ({
      id: guess.id,
      player: guess.players?.name || "Unknown",
      guess: guess.guessed_author_id, // This will be resolved to name later
      guessId: guess.guessed_author_id,
      correct: guess.is_correct,
      story: guess.stories?.content || "",
      points: guess.is_correct ? 10 : 0,
    }));
  } catch (error) {
    console.error("Error getting guess results:", error);
    return [];
  }
};

// ============ REAL-TIME SUBSCRIPTIONS ============

export const subscribeToRoom = (
  roomId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "stories",
        filter: `room_id=eq.${roomId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "guesses",
        filter: `story_id=in.(select id from stories where room_id='${roomId}')`,
      },
      callback
    )
    .subscribe();
};

// ============ HELPER FUNCTIONS ============

const mapPlayerFromDB = (dbPlayer: any): Player => ({
  id: dbPlayer.id,
  local_id: dbPlayer.local_id,
  name: dbPlayer.name,
  points: dbPlayer.score,
  avatar: dbPlayer.avatar,
  isHost: dbPlayer.is_host,
  isReady: dbPlayer.is_ready,
});

const mapStoryFromDB = (dbStory: any): Story => ({
  id: dbStory.id,
  content: dbStory.content,
  authorId: dbStory.author_id,
  isRevealed: dbStory.is_revealed,
});

const mapGuessFromDB = (dbGuess: any): Guess => ({
  id: dbGuess.id,
  storyId: dbGuess.story_id,
  playerId: dbGuess.player_id,
  guessedAuthorId: dbGuess.guessed_author_id,
  isCorrect: dbGuess.is_correct,
});
