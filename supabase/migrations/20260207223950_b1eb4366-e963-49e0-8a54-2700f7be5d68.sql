-- Create enum for donation center status
CREATE TYPE public.donation_center_status AS ENUM ('active', 'inactive');

-- Create donation_centers table
CREATE TABLE public.donation_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone_numbers TEXT[] NOT NULL DEFAULT '{}',
  status donation_center_status NOT NULL DEFAULT 'active',
  is_government_verified BOOLEAN NOT NULL DEFAULT false,
  is_admin_verified BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  dislikes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_categories table
CREATE TABLE public.donation_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_products table
CREATE TABLE public.donation_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.donation_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_center_comments table
CREATE TABLE public.donation_center_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
  user_id UUID,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_center_likes table
CREATE TABLE public.donation_center_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  center_id UUID NOT NULL REFERENCES public.donation_centers(id) ON DELETE CASCADE,
  user_id UUID,
  guest_id TEXT,
  is_like BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(center_id, user_id),
  UNIQUE(center_id, guest_id)
);

-- Enable RLS on all tables
ALTER TABLE public.donation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_center_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_center_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for donation_centers
CREATE POLICY "Anyone can view donation centers" ON public.donation_centers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create centers" ON public.donation_centers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Owners can update their centers" ON public.donation_centers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their centers" ON public.donation_centers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for donation_categories
CREATE POLICY "Anyone can view categories" ON public.donation_categories
  FOR SELECT USING (true);

CREATE POLICY "Center owners can create categories" ON public.donation_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

CREATE POLICY "Center owners can update categories" ON public.donation_categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

CREATE POLICY "Center owners can delete categories" ON public.donation_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

-- RLS policies for donation_products
CREATE POLICY "Anyone can view products" ON public.donation_products
  FOR SELECT USING (true);

CREATE POLICY "Center owners can create products" ON public.donation_products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

CREATE POLICY "Center owners can update products" ON public.donation_products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

CREATE POLICY "Center owners can delete products" ON public.donation_products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.donation_centers WHERE id = center_id AND user_id = auth.uid())
  );

-- RLS policies for donation_center_comments
CREATE POLICY "Anyone can view comments" ON public.donation_center_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can add comments" ON public.donation_center_comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON public.donation_center_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.donation_center_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for donation_center_likes
CREATE POLICY "Anyone can view likes" ON public.donation_center_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can add likes" ON public.donation_center_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can remove their likes" ON public.donation_center_likes
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Triggers for updated_at
CREATE TRIGGER update_donation_centers_updated_at
  BEFORE UPDATE ON public.donation_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_products_updated_at
  BEFORE UPDATE ON public.donation_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_center_comments_updated_at
  BEFORE UPDATE ON public.donation_center_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger functions for counts
CREATE OR REPLACE FUNCTION public.update_donation_center_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_like THEN
            UPDATE public.donation_centers SET likes_count = likes_count + 1 WHERE id = NEW.center_id;
        ELSE
            UPDATE public.donation_centers SET dislikes_count = dislikes_count + 1 WHERE id = NEW.center_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_like THEN
            UPDATE public.donation_centers SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.center_id;
        ELSE
            UPDATE public.donation_centers SET dislikes_count = GREATEST(0, dislikes_count - 1) WHERE id = OLD.center_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_like AND NOT NEW.is_like THEN
            UPDATE public.donation_centers 
            SET likes_count = GREATEST(0, likes_count - 1), dislikes_count = dislikes_count + 1 
            WHERE id = NEW.center_id;
        ELSIF NOT OLD.is_like AND NEW.is_like THEN
            UPDATE public.donation_centers 
            SET dislikes_count = GREATEST(0, dislikes_count - 1), likes_count = likes_count + 1 
            WHERE id = NEW.center_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_donation_center_likes_count_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.donation_center_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_donation_center_likes_count();

CREATE OR REPLACE FUNCTION public.update_donation_center_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.donation_centers SET comments_count = comments_count + 1 WHERE id = NEW.center_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.donation_centers SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.center_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_donation_center_comments_count_trigger
  AFTER INSERT OR DELETE ON public.donation_center_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_donation_center_comments_count();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_centers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_center_comments;