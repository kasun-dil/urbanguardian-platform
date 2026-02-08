-- Create incident type enum
CREATE TYPE public.incident_type AS ENUM ('flooding', 'blocked_road', 'fallen_tree', 'hazard', 'other');

-- Create incident status enum
CREATE TYPE public.incident_status AS ENUM ('active', 'resolved', 'investigating');

-- Create incident severity enum
CREATE TYPE public.incident_severity AS ENUM ('low', 'moderate', 'high', 'critical');

-- Create incidents table
CREATE TABLE public.incidents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type incident_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'moderate',
    status incident_status NOT NULL DEFAULT 'active',
    reported_by TEXT NOT NULL DEFAULT 'Anonymous',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create incident_likes table
CREATE TABLE public.incident_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_like UNIQUE (incident_id, user_id),
    CONSTRAINT unique_guest_like UNIQUE (incident_id, guest_id),
    CONSTRAINT user_or_guest CHECK (user_id IS NOT NULL OR guest_id IS NOT NULL)
);

-- Create incident_comments table
CREATE TABLE public.incident_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_comments ENABLE ROW LEVEL SECURITY;

-- Incidents policies - everyone can read
CREATE POLICY "Anyone can view incidents"
    ON public.incidents FOR SELECT
    USING (true);

-- Anyone can insert incidents (guests too)
CREATE POLICY "Anyone can report incidents"
    ON public.incidents FOR INSERT
    WITH CHECK (true);

-- Only authenticated users can update their own incidents
CREATE POLICY "Users can update their own incidents"
    ON public.incidents FOR UPDATE
    USING (auth.uid() = user_id);

-- Only authenticated users can delete their own incidents
CREATE POLICY "Users can delete their own incidents"
    ON public.incidents FOR DELETE
    USING (auth.uid() = user_id);

-- Incident likes policies
CREATE POLICY "Anyone can view likes"
    ON public.incident_likes FOR SELECT
    USING (true);

CREATE POLICY "Anyone can add likes"
    ON public.incident_likes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can remove their likes"
    ON public.incident_likes FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Incident comments policies
CREATE POLICY "Anyone can view comments"
    ON public.incident_comments FOR SELECT
    USING (true);

CREATE POLICY "Anyone can add comments"
    ON public.incident_comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
    ON public.incident_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.incident_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION public.update_incident_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.incidents SET likes_count = likes_count + 1 WHERE id = NEW.incident_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.incidents SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.incident_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_incident_like_change
AFTER INSERT OR DELETE ON public.incident_likes
FOR EACH ROW EXECUTE FUNCTION public.update_incident_likes_count();

-- Trigger to update comments_count
CREATE OR REPLACE FUNCTION public.update_incident_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.incidents SET comments_count = comments_count + 1 WHERE id = NEW.incident_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.incidents SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.incident_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_incident_comment_change
AFTER INSERT OR DELETE ON public.incident_comments
FOR EACH ROW EXECUTE FUNCTION public.update_incident_comments_count();

-- Trigger to update updated_at
CREATE TRIGGER update_incidents_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incident_comments_updated_at
BEFORE UPDATE ON public.incident_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for incidents
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_comments;