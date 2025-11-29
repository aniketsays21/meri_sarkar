-- Create area_alerts table
CREATE TABLE public.area_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pincode TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('water', 'garbage', 'unsafe', 'neta_missing', 'roads')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_name TEXT,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Create alert_upvotes table
CREATE TABLE public.alert_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.area_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(alert_id, user_id)
);

-- Enable RLS on area_alerts
ALTER TABLE public.area_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active alerts
CREATE POLICY "Anyone can view active alerts" ON public.area_alerts
  FOR SELECT USING (status = 'active');

-- Authenticated users can create alerts
CREATE POLICY "Users can create alerts" ON public.area_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts
CREATE POLICY "Users can update own alerts" ON public.area_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on alert_upvotes
ALTER TABLE public.alert_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can view upvotes
CREATE POLICY "Anyone can view upvotes" ON public.alert_upvotes
  FOR SELECT USING (true);

-- Authenticated users can upvote
CREATE POLICY "Users can upvote" ON public.alert_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their upvotes
CREATE POLICY "Users can remove upvotes" ON public.alert_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for area_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.area_alerts;