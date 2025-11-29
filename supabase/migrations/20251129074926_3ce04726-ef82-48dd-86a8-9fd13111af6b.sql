-- Add INSERT policy for area_reports to allow service role to insert new reports
-- The edge function uses service role key, so this policy allows inserts

CREATE POLICY "Service role can insert area reports" 
ON public.area_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can update area reports" 
ON public.area_reports 
FOR UPDATE 
USING (true);