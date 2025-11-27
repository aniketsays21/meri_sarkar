-- Create policies and subsidies table
CREATE TABLE public.policies_subsidies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('policy', 'subsidy', 'scheme')),
  benefit_amount BIGINT,
  benefit_description TEXT,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  how_to_apply TEXT,
  application_link TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  impact_score INTEGER DEFAULT 50,
  departments TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Enable RLS
ALTER TABLE public.policies_subsidies ENABLE ROW LEVEL SECURITY;

-- Anyone can view active policies
CREATE POLICY "Anyone can view active policies" 
ON public.policies_subsidies 
FOR SELECT 
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_policies_subsidies_updated_at
BEFORE UPDATE ON public.policies_subsidies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add sample policies and subsidies for Maharashtra
INSERT INTO public.policies_subsidies (title, description, category, type, benefit_amount, benefit_description, eligibility_criteria, how_to_apply, application_link, state, impact_score, departments) VALUES
-- Income-based subsidies
(
  'Pradhan Mantri Awas Yojana (PMAY)',
  'Housing scheme providing financial assistance for construction/purchase of houses for economically weaker sections',
  'Housing',
  'subsidy',
  250000,
  'Subsidy of up to ₹2.5 Lakh for home purchase/construction',
  '{"min_age": 18, "max_age": null, "max_income": 1800000, "marital_status": ["any"], "states": ["Maharashtra", "All India"]}'::jsonb,
  'Apply online through the official PMAY portal with income proof and identity documents',
  'https://pmaymis.gov.in/',
  'All India',
  90,
  ARRAY['Housing', 'Urban Development']
),
(
  'PM Kisan Samman Nidhi',
  'Direct income support of ₹6000 per year to small and marginal farmers',
  'Agriculture',
  'subsidy',
  6000,
  '₹2000 paid in three equal installments every year',
  '{"occupation": ["Farmer", "Agriculture"], "max_landholding": 2, "states": ["Maharashtra", "All India"]}'::jsonb,
  'Register at nearest Common Service Centre or online through PM-Kisan portal',
  'https://pmkisan.gov.in/',
  'All India',
  85,
  ARRAY['Agriculture', 'Rural Development']
),
(
  'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
  'Health insurance scheme providing coverage of ₹5 lakh per family per year',
  'Healthcare',
  'scheme',
  500000,
  'Free medical treatment up to ₹5 lakh per family annually',
  '{"max_income": 500000, "states": ["Maharashtra", "All India"]}'::jsonb,
  'Check eligibility and generate e-card at empanelled hospitals or online',
  'https://pmjay.gov.in/',
  'All India',
  95,
  ARRAY['Healthcare', 'Social Welfare']
),
-- Age-based subsidies
(
  'Senior Citizen Savings Scheme (SCSS)',
  'Government-backed savings scheme with higher interest rates for senior citizens',
  'Finance',
  'scheme',
  null,
  'Interest rate of ~8% per annum with tax benefits',
  '{"min_age": 60, "states": ["Maharashtra", "All India"]}'::jsonb,
  'Open account at any post office or authorized bank with age proof',
  'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
  'All India',
  80,
  ARRAY['Finance', 'Senior Citizens']
),
(
  'Sukanya Samriddhi Yojana',
  'Savings scheme for girl child education and marriage with attractive interest rates',
  'Education',
  'scheme',
  null,
  'High interest rate (~8%) with tax benefits under Section 80C',
  '{"kids": 1, "max_age": 10, "states": ["Maharashtra", "All India"]}'::jsonb,
  'Open account at post office or authorized banks with birth certificate',
  'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
  'All India',
  88,
  ARRAY['Finance', 'Women & Child Development']
),
-- Occupation-based
(
  'PM Mudra Yojana',
  'Loan scheme for micro and small businesses without collateral',
  'Business',
  'scheme',
  1000000,
  'Loans up to ₹10 lakh for business expansion',
  '{"occupation": ["Business", "Self-employed", "Entrepreneur"], "states": ["Maharashtra", "All India"]}'::jsonb,
  'Apply through any bank or NBFC with business plan and documents',
  'https://www.mudra.org.in/',
  'All India',
  85,
  ARRAY['Finance', 'MSME']
),
(
  'Atal Pension Yojana',
  'Pension scheme providing guaranteed pension after 60 years',
  'Pension',
  'scheme',
  null,
  'Guaranteed monthly pension of ₹1000-5000 after retirement',
  '{"min_age": 18, "max_age": 40, "occupation": ["Employee", "Worker"], "states": ["Maharashtra", "All India"]}'::jsonb,
  'Enroll through your bank with Aadhaar and bank account',
  'https://npscra.nsdl.co.in/atal-pension-yojana.php',
  'All India',
  75,
  ARRAY['Finance', 'Social Security']
),
-- Maharashtra specific
(
  'Mahatma Jyotiba Phule Jan Arogya Yojana',
  'Maharashtra state health insurance scheme providing cashless treatment',
  'Healthcare',
  'scheme',
  150000,
  'Cashless treatment up to ₹1.5 lakh per family per year',
  '{"max_income": 500000, "states": ["Maharashtra"]}'::jsonb,
  'Register at nearest Arogya Mitra or empanelled hospital',
  'https://www.jeevandayee.gov.in/',
  'Maharashtra',
  90,
  ARRAY['Healthcare']
),
(
  'Maharashtra Ramai Awas Yojana',
  'Housing scheme for economically weaker sections in Maharashtra',
  'Housing',
  'subsidy',
  100000,
  'Financial assistance of ₹1 lakh for house construction',
  '{"max_income": 800000, "states": ["Maharashtra"]}'::jsonb,
  'Apply through district office with income and residence proof',
  'https://mahapwd.com/',
  'Maharashtra',
  85,
  ARRAY['Housing', 'Urban Development']
),
-- Women-specific
(
  'Pradhan Mantri Matru Vandana Yojana',
  'Maternity benefit scheme providing cash incentive for pregnant women',
  'Healthcare',
  'scheme',
  5000,
  '₹5000 cash benefit in installments for first live birth',
  '{"gender": "female", "min_age": 18, "states": ["Maharashtra", "All India"]}'::jsonb,
  'Register at Anganwadi Centre or health facility during pregnancy',
  'https://pmmvy.wcd.gov.in/',
  'All India',
  92,
  ARRAY['Healthcare', 'Women & Child Development']
);

COMMENT ON COLUMN public.policies_subsidies.eligibility_criteria IS 'JSON object with criteria like {min_age, max_age, min_income, max_income, occupation, marital_status, kids, gender, states}';
COMMENT ON COLUMN public.policies_subsidies.impact_score IS 'Score 0-100 indicating potential impact on eligible users';