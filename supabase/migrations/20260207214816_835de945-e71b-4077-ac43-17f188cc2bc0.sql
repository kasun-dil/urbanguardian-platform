-- Create enum for publication alert types
CREATE TYPE public.publication_alert_type AS ENUM ('weather_alert', 'environmental_alert', 'health_alert', 'safety_alert', 'infrastructure_alert', 'general_announcement');

-- Create enum for publication severity
CREATE TYPE public.publication_severity AS ENUM ('low', 'moderate', 'high', 'critical');

-- Create official_publications table
CREATE TABLE public.official_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type publication_alert_type NOT NULL,
  severity publication_severity NOT NULL DEFAULT 'moderate',
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  forecast_info TEXT,
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0,
  dislikes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publication_likes table for like/dislike tracking
CREATE TABLE public.publication_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.official_publications(id) ON DELETE CASCADE,
  user_id UUID,
  guest_id TEXT,
  is_like BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(publication_id, user_id),
  UNIQUE(publication_id, guest_id)
);

-- Create publication_comments table
CREATE TABLE public.publication_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.official_publications(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.official_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;

-- Enable realtime for publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.official_publications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.publication_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.publication_comments;

-- RLS Policies for official_publications
-- Anyone can view publications
CREATE POLICY "Anyone can view publications"
ON public.official_publications
FOR SELECT
USING (true);

-- Only government role can insert publications
CREATE POLICY "Government agents can create publications"
ON public.official_publications
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'government'));

-- Government agents can update their own publications
CREATE POLICY "Government agents can update own publications"
ON public.official_publications
FOR UPDATE
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'government'));

-- Government agents can delete their own publications
CREATE POLICY "Government agents can delete own publications"
ON public.official_publications
FOR DELETE
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'government'));

-- RLS Policies for publication_likes
CREATE POLICY "Anyone can view publication likes"
ON public.publication_likes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add publication likes"
ON public.publication_likes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can remove their own publication likes"
ON public.publication_likes
FOR DELETE
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- RLS Policies for publication_comments
CREATE POLICY "Anyone can view publication comments"
ON public.publication_comments
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add publication comments"
ON public.publication_comments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own publication comments"
ON public.publication_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own publication comments"
ON public.publication_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at for publications
CREATE TRIGGER update_official_publications_updated_at
BEFORE UPDATE ON public.official_publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at for comments
CREATE TRIGGER update_publication_comments_updated_at
BEFORE UPDATE ON public.publication_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update publication likes count
CREATE OR REPLACE FUNCTION public.update_publication_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_like THEN
            UPDATE public.official_publications SET likes_count = likes_count + 1 WHERE id = NEW.publication_id;
        ELSE
            UPDATE public.official_publications SET dislikes_count = dislikes_count + 1 WHERE id = NEW.publication_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_like THEN
            UPDATE public.official_publications SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.publication_id;
        ELSE
            UPDATE public.official_publications SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.publication_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle like/dislike toggle
        IF OLD.is_like AND NOT NEW.is_like THEN
            UPDATE public.official_publications 
            SET likes_count = GREATEST(0, likes_count - 1), dislikes_count = dislikes_count + 1 
            WHERE id = NEW.publication_id;
        ELSIF NOT OLD.is_like AND NEW.is_like THEN
            UPDATE public.official_publications 
            SET dislikes_count = GREATEST(0, dislikes_count - 1), likes_count = likes_count + 1 
            WHERE id = NEW.publication_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for publication likes count
CREATE TRIGGER update_publication_likes_count_trigger
AFTER INSERT OR DELETE OR UPDATE ON public.publication_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_publication_likes_count();

-- Function to update publication comments count
CREATE OR REPLACE FUNCTION public.update_publication_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.official_publications SET comments_count = comments_count + 1 WHERE id = NEW.publication_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.official_publications SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.publication_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Trigger for publication comments count
CREATE TRIGGER update_publication_comments_count_trigger
AFTER INSERT OR DELETE ON public.publication_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_publication_comments_count();