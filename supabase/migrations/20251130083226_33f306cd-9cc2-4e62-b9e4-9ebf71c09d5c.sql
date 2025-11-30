-- Add week_number and year columns to leader_category_votes for weekly tracking
ALTER TABLE public.leader_category_votes 
ADD COLUMN week_number integer NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE),
ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Drop old unique constraint if exists and add new one with week/year
ALTER TABLE public.leader_category_votes 
DROP CONSTRAINT IF EXISTS leader_category_votes_user_id_leader_id_category_key;

-- Create new unique constraint: one vote per user per leader per category per week
ALTER TABLE public.leader_category_votes 
ADD CONSTRAINT leader_category_votes_user_leader_category_week_unique 
UNIQUE (user_id, leader_id, category, week_number, year);