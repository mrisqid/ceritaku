export interface Player {
  id: string;
  name: string;
  points?: number;
  isCurrentTurn?: boolean;
  hasSubmitted?: boolean;
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