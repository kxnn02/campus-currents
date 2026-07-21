UPDATE public.profiles
SET level = CASE
  WHEN program IN ('STEM', 'ABM', 'HUMSS', 'GAS', 'TVL') THEN 'senior_high'
  WHEN program IN ('BSIT', 'BSBA', 'BSA', 'BSED', 'BEED', 'AB_PSYCH', 'AB_COMM') THEN 'college'
  WHEN program = 'JD' THEN 'law'
  WHEN program = 'ETEEAP' THEN 'eteeap'
  ELSE level
END
WHERE level IS NULL
  AND program IS NOT NULL;;
