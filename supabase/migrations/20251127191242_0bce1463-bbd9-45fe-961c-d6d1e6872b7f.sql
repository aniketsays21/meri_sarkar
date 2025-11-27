-- Create constituencies table
CREATE TABLE public.constituencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('assembly', 'parliamentary', 'state', 'governor')),
  state TEXT NOT NULL,
  reserved_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pincode_constituency mapping table
CREATE TABLE public.pincode_constituency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pincode TEXT NOT NULL,
  assembly_constituency TEXT,
  parliamentary_constituency TEXT,
  state TEXT NOT NULL,
  district TEXT,
  ward TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to leaders table
ALTER TABLE public.leaders 
ADD COLUMN constituency_id UUID REFERENCES public.constituencies(id),
ADD COLUMN hierarchy_level INTEGER NOT NULL DEFAULT 3;

-- Create indexes for better performance
CREATE INDEX idx_pincode_lookup ON public.pincode_constituency(pincode);
CREATE INDEX idx_leaders_constituency ON public.leaders(constituency_id);
CREATE INDEX idx_constituencies_name ON public.constituencies(name);

-- Enable RLS on new tables
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pincode_constituency ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for constituencies (public read)
CREATE POLICY "Anyone can view constituencies" 
ON public.constituencies 
FOR SELECT 
USING (true);

-- Create RLS policies for pincode_constituency (public read)
CREATE POLICY "Anyone can view pincode mappings" 
ON public.pincode_constituency 
FOR SELECT 
USING (true);

-- Add trigger for constituencies updated_at
ALTER TABLE public.constituencies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

CREATE TRIGGER update_constituencies_updated_at
BEFORE UPDATE ON public.constituencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comment on hierarchy levels
COMMENT ON COLUMN public.leaders.hierarchy_level IS '1=Governor, 2=Chief Minister, 3=MP, 4=MLA, 5=Ward Councillor';