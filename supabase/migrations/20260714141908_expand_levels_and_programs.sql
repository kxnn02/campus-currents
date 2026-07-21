-- Drop the too-narrow program constraint
ALTER TABLE public.profiles DROP CONSTRAINT chk_program;

-- Add a 'level' column to distinguish grade school, JHS, SHS, college, law, eteeap
ALTER TABLE public.profiles ADD COLUMN level TEXT;
ALTER TABLE public.profiles ADD CONSTRAINT chk_level CHECK (
  level IS NULL OR level IN ('grade_school', 'junior_high', 'senior_high', 'college', 'law', 'eteeap')
);

-- Re-add program constraint with broader values (NULL allowed for non-college)
ALTER TABLE public.profiles ADD CONSTRAINT chk_program CHECK (
  program IS NULL OR program IN (
    'BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM',
    'JD', 'ETEEAP',
    'STEM', 'ABM', 'HUMSS', 'GAS', 'TVL',
    'OTHER'
  )
);

-- Update suspension scope to handle all school levels
ALTER TABLE public.class_suspensions DROP CONSTRAINT class_suspensions_scope_check;
ALTER TABLE public.class_suspensions ADD CONSTRAINT class_suspensions_scope_check CHECK (
  scope IN ('all_levels', 'grade_school_only', 'k12_only', 'junior_high_only', 'senior_high_only', 'college_only', 'law_only', 'specific_programs')
);

-- Add index on level for filtering
CREATE INDEX idx_profiles_level ON public.profiles(level);;
