-- Step 1: Add super_admin to the existing enum (if not exists)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Step 2: Create a super_admins table for tracking super admin users
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on super_admins table
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view this table
CREATE POLICY "Super admins can view super_admins table"
ON public.super_admins
FOR SELECT
USING (auth.uid() = user_id);

-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.super_admins
    WHERE user_id = _user_id
  )
$$;