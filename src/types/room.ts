// ============ DATABASE TYPES ============
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string;
          phase: "lobby" | "gameplay" | "result";
          game_phase: "story_input" | "guessing" | "reveal";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          phase?: "lobby" | "gameplay" | "result";
          game_phase?: "story_input" | "guessing" | "reveal";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          phase?: "lobby" | "gameplay" | "result";
          game_phase?: "story_input" | "guessing" | "reveal";
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          local_id: string;
          name: string;
          avatar: string;
          score: number;
          is_host: boolean;
          is_ready: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          local_id: string;
          name: string;
          avatar: string;
          score?: number;
          is_host?: boolean;
          is_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          local_id?: string;
          name?: string;
          avatar?: string;
          score?: number;
          is_host?: boolean;
          is_ready?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          room_id: string;
          author_id: string;
          content: string;
          is_revealed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          author_id: string;
          content: string;
          is_revealed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          author_id?: string;
          content?: string;
          is_revealed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      guesses: {
        Row: {
          id: string;
          story_id: string;
          player_id: string;
          guessed_author_id: string;
          is_correct: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          player_id: string;
          guessed_author_id: string;
          is_correct: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          player_id?: string;
          guessed_author_id?: string;
          is_correct?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// ============ INTERFACES ============
export interface Player {
  id: string;
  local_id: string;
  name: string;
  points: number;
  avatar?: string;
  isHost: boolean;
  isReady: boolean;
  isCurrentTurn?: boolean;
  isKicked?: boolean;
  isWaiting?: boolean;
}

export interface Story {
  id: string;
  content: string;
  authorId: string;
  isRevealed: boolean;
}

export interface Guess {
  id: string;
  storyId: string;
  playerId: string;
  guessedAuthorId: string;
  isCorrect: boolean;
}

export interface GameState {
  players: Player[];
  stories: Story[];
  status: "waiting" | "playing" | "finished";
}

export interface StoryInputProps {
  onSubmit: (story: string) => void;
}

export interface PlayerListProps {
  players: Player[];
}

export interface Answer {
  id: string;
  username: string;
  answer: string;
  isCorrect?: boolean;
}

export interface GuessPlayer {
  id: string;
  name: string;
}

export interface StepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  allowBackNavigation?: boolean;
}

export interface GuessResult {
  id: string;
  player: string;
  guess: string;
  guessId: string;
  correct: boolean;
  story: string;
  points: number;
}

export type GamePhase =
  | "waiting" // Menunggu pemain bergabung
  | "writing" // Fase menulis cerita
  | "guessing" // Fase menebak penulis
  | "reviewing" // Fase melihat hasil
  | "finished"; // Game selesai

export type RoomStatus =
  | "open" // Room terbuka, bisa join
  | "full" // Room penuh
  | "in_progress" // Game sedang berlangsung
  | "closed"; // Room ditutup

export type PlayerStatus =
  | "waiting" // Menunggu game dimulai
  | "ready" // Siap bermain
  | "writing" // Sedang menulis cerita
  | "submitted" // Sudah submit cerita
  | "guessing" // Sedang menebak
  | "done" // Selesai untuk round ini
  | "disconnected"; // Terputus koneksi
