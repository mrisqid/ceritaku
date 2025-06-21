# Supabase Integration Setup Guide

## Overview
This project uses Supabase for real-time database functionality. The integration has been updated with improved error handling, validation, and real-time subscriptions.

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Environment Variables
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the SQL commands from `supabase.sql` in your Supabase SQL editor:

```sql
-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phase VARCHAR(20) DEFAULT 'lobby',
  game_phase VARCHAR(20) DEFAULT 'story_input',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  local_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  author_id UUID REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guesses table
CREATE TABLE guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  guessed_author_id UUID REFERENCES players(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_stories_room_id ON stories(room_id);
CREATE INDEX idx_guesses_story_id ON guesses(story_id);
```

### 4. Enable Row Level Security (RLS)
Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- In production, you should implement proper authentication
CREATE POLICY "Allow public access to rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow public access to players" ON players FOR ALL USING (true);
CREATE POLICY "Allow public access to stories" ON stories FOR ALL USING (true);
CREATE POLICY "Allow public access to guesses" ON guesses FOR ALL USING (true);
```

### 5. Enable Realtime
In your Supabase dashboard:
1. Go to Database → Replication
2. Enable realtime for all tables (rooms, players, stories, guesses)

## Features

### Improved Error Handling
- Custom error messages in Indonesian
- Proper error propagation
- Better user feedback

### Validation
- Room code format validation
- Input sanitization
- Duplicate prevention

### Real-time Updates
- Live player updates
- Story submission notifications
- Guess result updates
- Room phase changes

### Database Operations
- **Rooms**: Create, join, update phase, delete
- **Players**: Join, update status, leave, score tracking
- **Stories**: Submit, reveal, retrieve
- **Guesses**: Submit, calculate results

## Usage Examples

### Creating a Room
```typescript
import * as roomService from "@/services/roomService";

const result = await roomService.createRoom("My Room");
if (result) {
  console.log(`Room created with code: ${result.code}`);
}
```

### Joining a Room
```typescript
const player = await roomService.joinRoom(roomId, {
  localId: "user-uuid",
  name: "Player Name",
  avatar: "😊",
  isHost: false
});
```

### Real-time Subscriptions
```typescript
const subscription = roomService.subscribeToRoom(roomId, (payload) => {
  console.log("Real-time update:", payload);
});
```

## Troubleshooting

### Common Issues

1. **Environment variables not found**
   - Ensure `.env.local` exists in project root
   - Restart development server after adding variables

2. **Database connection errors**
   - Verify Supabase URL and key are correct
   - Check if tables exist in your database

3. **Real-time not working**
   - Ensure realtime is enabled in Supabase dashboard
   - Check RLS policies allow access

4. **Type errors**
   - Run `npm run build` to check for type issues
   - Ensure all imports are correct

### Getting Help
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review the error messages in browser console
- Verify database schema matches the SQL file