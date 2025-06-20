export interface Player {
  id: string;
  name: string;
  hasSubmitted: boolean;
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