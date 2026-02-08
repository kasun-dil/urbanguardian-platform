CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*) FROM public.profiles;
$$;