-- Add UPDATE policy for publication_likes to allow toggling reactions
CREATE POLICY "Users can update their own publication likes" 
ON public.publication_likes 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (user_id IS NULL));