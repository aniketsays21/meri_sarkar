-- Create leader_category_votes table for voting on leaders by issue category
CREATE TABLE public.leader_category_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.leaders(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('safety', 'roads', 'water')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, leader_id, category)
);

-- Enable Row Level Security
ALTER TABLE public.leader_category_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view vote counts" 
ON public.leader_category_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote" 
ON public.leader_category_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote" 
ON public.leader_category_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" 
ON public.leader_category_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for live vote updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.leader_category_votes;