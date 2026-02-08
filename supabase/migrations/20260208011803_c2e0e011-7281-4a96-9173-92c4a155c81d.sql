-- Create or replace function to update publication like counts
CREATE OR REPLACE FUNCTION public.update_publication_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_like = true THEN
      UPDATE public.official_publications 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.publication_id;
    ELSE
      UPDATE public.official_publications 
      SET dislikes_count = dislikes_count + 1 
      WHERE id = NEW.publication_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_like = true THEN
      UPDATE public.official_publications 
      SET likes_count = GREATEST(0, likes_count - 1) 
      WHERE id = OLD.publication_id;
    ELSE
      UPDATE public.official_publications 
      SET dislikes_count = GREATEST(0, dislikes_count - 1) 
      WHERE id = OLD.publication_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle toggling between like and dislike
    IF OLD.is_like = true AND NEW.is_like = false THEN
      UPDATE public.official_publications 
      SET likes_count = GREATEST(0, likes_count - 1), 
          dislikes_count = dislikes_count + 1 
      WHERE id = NEW.publication_id;
    ELSIF OLD.is_like = false AND NEW.is_like = true THEN
      UPDATE public.official_publications 
      SET likes_count = likes_count + 1, 
          dislikes_count = GREATEST(0, dislikes_count - 1) 
      WHERE id = NEW.publication_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for publication likes
DROP TRIGGER IF EXISTS trigger_update_publication_likes_count ON public.publication_likes;
CREATE TRIGGER trigger_update_publication_likes_count
AFTER INSERT OR UPDATE OR DELETE ON public.publication_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_publication_likes_count();