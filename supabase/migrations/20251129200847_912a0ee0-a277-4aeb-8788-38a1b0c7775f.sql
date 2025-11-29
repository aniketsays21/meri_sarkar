-- Add new columns to area_reports for daily engagement features
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS ward_rank INTEGER;
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS total_wards INTEGER DEFAULT 81;
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS rank_change INTEGER DEFAULT 0;
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS water_trend TEXT DEFAULT 'stable';
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS roads_trend TEXT DEFAULT 'stable';
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS safety_trend TEXT DEFAULT 'stable';
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS health_trend TEXT DEFAULT 'stable';
ALTER TABLE area_reports ADD COLUMN IF NOT EXISTS daily_updates JSONB DEFAULT '[]';

-- Create new leader_activities table for daily activity tracking
CREATE TABLE IF NOT EXISTS leader_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES leaders(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  activity_date DATE DEFAULT CURRENT_DATE,
  source_url TEXT,
  is_positive BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for leader_activities
ALTER TABLE leader_activities ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing of leader activities
CREATE POLICY "Anyone can view leader activities" 
ON leader_activities 
FOR SELECT 
USING (true);