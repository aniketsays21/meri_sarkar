-- Add additional fields to leaders table for comprehensive profile
ALTER TABLE public.leaders
ADD COLUMN IF NOT EXISTS office_email text,
ADD COLUMN IF NOT EXISTS office_phone text,
ADD COLUMN IF NOT EXISTS office_address text,
ADD COLUMN IF NOT EXISTS professional_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS election_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ongoing_projects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS completed_projects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS total_funds_allocated bigint,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.leaders.professional_history IS 'Array of {designation, government, start_year, end_year}';
COMMENT ON COLUMN public.leaders.election_history IS 'Array of {year, constituency, votes_received, total_votes, result}';
COMMENT ON COLUMN public.leaders.ongoing_projects IS 'Array of {title, description, progress, start_date}';
COMMENT ON COLUMN public.leaders.completed_projects IS 'Array of {title, description, completion_date}';
COMMENT ON COLUMN public.leaders.social_media IS 'Object with {twitter, facebook, instagram, website}';

-- Update existing Mumbai leaders with comprehensive data
UPDATE public.leaders
SET 
  office_email = CASE
    WHEN name = 'Devendra Fadnavis' THEN 'cm@maharashtra.gov.in'
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN 'arvind.sawant@sansad.nic.in'
    WHEN name = 'Atul Bhatkhalkar' THEN 'atul.bhatkhalkar@vidhansabha.gov.in'
  END,
  office_phone = CASE
    WHEN name = 'Devendra Fadnavis' THEN '+91-22-2202-0111'
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '+91-22-2376-1234'
    WHEN name = 'Atul Bhatkhalkar' THEN '+91-22-2235-5678'
  END,
  office_address = CASE
    WHEN name = 'Devendra Fadnavis' THEN 'Mantralaya, Mumbai, Maharashtra 400032'
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN 'Parliament House, New Delhi 110001'
    WHEN name = 'Atul Bhatkhalkar' THEN 'Vidhan Bhavan, Mumbai, Maharashtra 400032'
  END,
  professional_history = CASE
    WHEN name = 'Devendra Fadnavis' THEN '[
      {"designation": "Chief Minister", "government": "Maharashtra", "start_year": 2024, "end_year": null},
      {"designation": "Deputy Chief Minister", "government": "Maharashtra", "start_year": 2022, "end_year": 2024},
      {"designation": "Chief Minister", "government": "Maharashtra", "start_year": 2014, "end_year": 2019}
    ]'::jsonb
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '[
      {"designation": "Member of Parliament", "government": "Lok Sabha", "start_year": 2019, "end_year": null},
      {"designation": "Member of Parliament", "government": "Lok Sabha", "start_year": 2014, "end_year": 2019}
    ]'::jsonb
    WHEN name = 'Atul Bhatkhalkar' THEN '[
      {"designation": "MLA", "government": "Maharashtra Legislative Assembly", "start_year": 2019, "end_year": null}
    ]'::jsonb
  END,
  election_history = CASE
    WHEN name = 'Devendra Fadnavis' THEN '[
      {"year": 2019, "constituency": "Nagpur South West", "votes_received": 145000, "total_votes": 250000, "result": "Won"}
    ]'::jsonb
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '[
      {"year": 2019, "constituency": "Mumbai South", "votes_received": 520000, "total_votes": 850000, "result": "Won"}
    ]'::jsonb
    WHEN name = 'Atul Bhatkhalkar' THEN '[
      {"year": 2019, "constituency": "Colaba", "votes_received": 72000, "total_votes": 150000, "result": "Won"}
    ]'::jsonb
  END,
  ongoing_projects = CASE
    WHEN name = 'Devendra Fadnavis' THEN '[
      {"title": "Mumbai Metro Expansion Phase 3", "description": "Expanding metro connectivity across Mumbai", "progress": 65, "start_date": "2022-01-15"},
      {"title": "Rural Healthcare Initiative", "description": "Improving healthcare infrastructure in rural Maharashtra", "progress": 45, "start_date": "2023-03-20"}
    ]'::jsonb
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '[
      {"title": "Coastal Road Development", "description": "Building coastal road for better connectivity", "progress": 75, "start_date": "2021-06-10"}
    ]'::jsonb
    WHEN name = 'Atul Bhatkhalkar' THEN '[
      {"title": "Colaba Waterfront Beautification", "description": "Upgrading public spaces along the waterfront", "progress": 55, "start_date": "2023-01-05"}
    ]'::jsonb
  END,
  completed_projects = CASE
    WHEN name = 'Devendra Fadnavis' THEN '[
      {"title": "Smart City Mission - Nagpur", "description": "Transformed Nagpur into a smart city", "completion_date": "2020-12-31"},
      {"title": "Solar Power Grid", "description": "Established state-wide solar power infrastructure", "completion_date": "2021-08-15"}
    ]'::jsonb
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '[
      {"title": "Port Modernization", "description": "Upgraded Mumbai Port facilities", "completion_date": "2022-03-30"}
    ]'::jsonb
    WHEN name = 'Atul Bhatkhalkar' THEN '[
      {"title": "School Infrastructure Upgrade", "description": "Renovated 15 public schools in Colaba", "completion_date": "2022-11-20"}
    ]'::jsonb
  END,
  total_funds_allocated = CASE
    WHEN name = 'Devendra Fadnavis' THEN 5000000000
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN 500000000
    WHEN name = 'Atul Bhatkhalkar' THEN 100000000
  END,
  social_media = CASE
    WHEN name = 'Devendra Fadnavis' THEN '{"twitter": "@Dev_Fadnavis", "facebook": "DevendraFadnavis", "website": "devfadnavis.in"}'::jsonb
    WHEN name = 'Ramesh Korgaonkar (Arvind Sawant)' THEN '{"twitter": "@ArvindSawant", "facebook": "ArvindsawantShivSena"}'::jsonb
    WHEN name = 'Atul Bhatkhalkar' THEN '{"twitter": "@AtulBhatkhalkar", "facebook": "AtulBhatkhalkar"}'::jsonb
  END
WHERE name IN ('Devendra Fadnavis', 'Ramesh Korgaonkar (Arvind Sawant)', 'Atul Bhatkhalkar');