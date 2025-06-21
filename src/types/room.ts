// ============ INTERFACES ============
export interface Player {
  id: string;
  name: string;
  points: number;
  isHost?: boolean;
  isReady?: boolean;
  isCurrentTurn?: boolean;
  isKicked?: boolean;
  isWaiting?: boolean;
}

export interface Story {
  id: string;
  content: string;
  authorId: string;
}

export interface GameState {
  players: Player[];
  stories: Story[];
  status: 'waiting' | 'playing' | 'finished';
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

export type GamePhase = 
  | 'waiting'        // Menunggu pemain bergabung
  | 'writing'        // Fase menulis cerita
  | 'guessing'       // Fase menebak penulis
  | 'reviewing'      // Fase melihat hasil
  | 'finished'       // Game selesai


  export type RoomStatus = 
  | 'open'           // Room terbuka, bisa join
  | 'full'           // Room penuh
  | 'in_progress'    // Game sedang berlangsung
  | 'closed'         // Room ditutup


  export type PlayerStatus = 
  | 'waiting'        // Menunggu game dimulai
  | 'ready'          // Siap bermain
  | 'writing'        // Sedang menulis cerita
  | 'submitted'      // Sudah submit cerita
  | 'guessing'       // Sedang menebak
  | 'done'           // Selesai untuk round ini
  | 'disconnected'   // Terputus koneksi