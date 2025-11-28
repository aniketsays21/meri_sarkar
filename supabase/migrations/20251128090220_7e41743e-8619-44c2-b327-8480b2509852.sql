-- Create area_reports table to cache AI-generated area data
CREATE TABLE public.area_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode TEXT NOT NULL,
  state TEXT,
  district TEXT,
  constituency TEXT,
  ward TEXT,
  
  -- Area metrics (AI-generated)
  roads_score INTEGER DEFAULT 0,
  roads_details JSONB DEFAULT '{}'::jsonb,
  water_score INTEGER DEFAULT 0,
  water_details JSONB DEFAULT '{}'::jsonb,
  safety_score INTEGER DEFAULT 0,
  safety_details JSONB DEFAULT '{}'::jsonb,
  health_score INTEGER DEFAULT 0,
  health_details JSONB DEFAULT '{}'::jsonb,
  
  -- Overall area summary
  overall_score INTEGER DEFAULT 0,
  summary TEXT,
  key_issues TEXT[],
  recent_developments TEXT[],
  
  -- Cache management
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(pincode)
);

-- Enable RLS
ALTER TABLE public.area_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can view area reports (public data)
CREATE POLICY "Anyone can view area reports" 
ON public.area_reports 
FOR SELECT 
USING (true);

-- Create index for faster pincode lookups
CREATE INDEX idx_area_reports_pincode ON public.area_reports(pincode);

-- Add trigger for updated_at
CREATE TRIGGER update_area_reports_updated_at
BEFORE UPDATE ON public.area_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();