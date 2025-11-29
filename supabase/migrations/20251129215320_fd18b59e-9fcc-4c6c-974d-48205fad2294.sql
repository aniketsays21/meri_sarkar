-- Create daily_polls table for daily 1-tap polls
CREATE TABLE public.daily_polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('cleanliness', 'water', 'roads', 'safety')),
  question TEXT NOT NULL,
  poll_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category, poll_date)
);

-- Enable RLS
ALTER TABLE public.daily_polls ENABLE ROW LEVEL SECURITY;

-- Anyone can view active polls
CREATE POLICY "Anyone can view active polls"
ON public.daily_polls
FOR SELECT
USING (is_active = true);

-- Create poll_responses table for user responses
CREATE TABLE public.poll_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES public.daily_polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  pincode TEXT NOT NULL,
  ward TEXT,
  response BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own responses
CREATE POLICY "Users can submit poll responses"
ON public.poll_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view all responses
CREATE POLICY "Anyone can view poll responses"
ON public.poll_responses
FOR SELECT
USING (true);

-- Create ward_weekly_scores table for rankings
CREATE TABLE public.ward_weekly_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ward TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  week_number INT NOT NULL,
  year INT NOT NULL,
  cleanliness_score INT DEFAULT 50,
  water_score INT DEFAULT 50,
  roads_score INT DEFAULT 50,
  safety_score INT DEFAULT 50,
  overall_score INT DEFAULT 50,
  rank INT,
  prev_rank INT,
  rank_change INT DEFAULT 0,
  total_responses INT DEFAULT 0,
  total_alerts INT DEFAULT 0,
  total_confirmations INT DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pincode, week_number, year)
);

-- Enable RLS
ALTER TABLE public.ward_weekly_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can view ward scores
CREATE POLICY "Anyone can view ward scores"
ON public.ward_weekly_scores
FOR SELECT
USING (true);

-- Service role can insert/update scores
CREATE POLICY "Service role can manage ward scores"
ON public.ward_weekly_scores
FOR ALL
USING (true);

-- Create index for faster queries
CREATE INDEX idx_poll_responses_poll_date ON public.poll_responses(created_at);
CREATE INDEX idx_ward_scores_week ON public.ward_weekly_scores(week_number, year);
CREATE INDEX idx_ward_scores_rank ON public.ward_weekly_scores(rank);

-- Seed initial daily poll questions
INSERT INTO public.daily_polls (category, question, poll_date) VALUES
('cleanliness', 'Was garbage picked up in your area today?', CURRENT_DATE),
('water', 'Did you get water at normal time & pressure today?', CURRENT_DATE),
('roads', 'Were there any major traffic issues or potholes you faced today?', CURRENT_DATE),
('safety', 'Did you feel safe in your neighborhood today?', CURRENT_DATE);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ward_weekly_scores;