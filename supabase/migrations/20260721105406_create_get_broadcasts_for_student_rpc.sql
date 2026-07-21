CREATE OR REPLACE FUNCTION public.get_broadcasts_for_student(
  p_program TEXT,
  p_level TEXT,
  p_year_level INT,
  p_page_size INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS SETOF public.broadcasts
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT b.*
  FROM public.broadcasts b
  WHERE b.is_deleted = false
    AND (
      -- broadcast targets all students
      (b.target_audience->>'all')::boolean = true
      -- OR student's level is in the levels array
      OR (
        b.target_audience ? 'levels'
        AND b.target_audience->'levels' ? p_level
      )
      -- OR student's program is in the programs array
      OR (
        b.target_audience ? 'programs'
        AND b.target_audience->'programs' ? p_program
      )
      -- OR student's year_level matches
      OR (
        b.target_audience ? 'year_levels'
        AND b.target_audience->'year_levels' @> to_jsonb(p_year_level)
      )
    )
  ORDER BY b.sent_at DESC NULLS LAST, b.created_at DESC
  LIMIT p_page_size
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_broadcasts_for_student IS 'Returns paginated broadcasts matching a student audience profile with server-side filtering';;
