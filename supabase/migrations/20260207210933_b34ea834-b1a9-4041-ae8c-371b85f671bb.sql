-- Update RLS policy to only allow authenticated users to insert incidents
DROP POLICY IF EXISTS "Anyone can report incidents" ON public.incidents;

CREATE POLICY "Authenticated users can report incidents"
ON public.incidents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);