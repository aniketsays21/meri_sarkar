-- Create enum for room categories
CREATE TYPE public.room_category AS ENUM ('national', 'state', 'local', 'policy');

-- Create enum for participant roles
CREATE TYPE public.participant_role AS ENUM ('host', 'speaker', 'listener');

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  topic_category room_category NOT NULL DEFAULT 'national',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pincode TEXT,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 50,
  is_live BOOLEAN DEFAULT false,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create room_participants table
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role participant_role DEFAULT 'listener',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_id)
);

-- Create room_messages table
CREATE TABLE public.room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  parent_id UUID REFERENCES public.room_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create polls table (dynamic polls)
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  pincode TEXT,
  category TEXT DEFAULT 'national',
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Anyone can view active rooms" ON public.rooms
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create rooms" ON public.rooms
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON public.rooms
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" ON public.rooms
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for room_participants
CREATE POLICY "Anyone can view room participants" ON public.room_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON public.room_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON public.room_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON public.room_participants
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for room_messages
CREATE POLICY "Room participants can view messages" ON public.room_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON public.room_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their messages" ON public.room_messages
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for polls
CREATE POLICY "Anyone can view active polls" ON public.polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create polls" ON public.polls
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Poll creators can update their polls" ON public.polls
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view votes" ON public.poll_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can vote" ON public.poll_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat and participation
ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;

-- Add updated_at trigger for rooms
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();