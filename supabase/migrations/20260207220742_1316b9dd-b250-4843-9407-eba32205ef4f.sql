-- Create enum for guide categories
CREATE TYPE public.guide_category AS ENUM (
  'natural_disasters',
  'general_preparedness', 
  'emergency_response',
  'health_safety',
  'infrastructure',
  'community_resilience'
);

-- Create enum for guide relevance/severity
CREATE TYPE public.guide_relevance AS ENUM ('low', 'medium', 'high');

-- Create preparedness_guides table
CREATE TABLE public.preparedness_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category public.guide_category NOT NULL,
  relevance public.guide_relevance NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.preparedness_guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view guides"
  ON public.preparedness_guides
  FOR SELECT
  USING (true);

CREATE POLICY "Government agents can create guides"
  ON public.preparedness_guides
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'government'));

CREATE POLICY "Government agents can update own guides"
  ON public.preparedness_guides
  FOR UPDATE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'government'));

CREATE POLICY "Government agents can delete own guides"
  ON public.preparedness_guides
  FOR DELETE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'government'));

-- Trigger for updated_at
CREATE TRIGGER update_preparedness_guides_updated_at
  BEFORE UPDATE ON public.preparedness_guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.preparedness_guides;