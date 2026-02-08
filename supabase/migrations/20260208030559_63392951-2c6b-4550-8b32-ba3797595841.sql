-- Create a function to allow super admins to delete any incident
CREATE POLICY "Super admins can delete any incident"
ON public.incidents
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Create a function to allow super admins to delete any donation center
CREATE POLICY "Super admins can delete any donation center"
ON public.donation_centers
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Create a function to allow super admins to delete any publication
CREATE POLICY "Super admins can delete any publication"
ON public.official_publications
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Allow super admins to delete related data (cascade cleanup)
CREATE POLICY "Super admins can delete any incident comment"
ON public.incident_comments
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any incident like"
ON public.incident_likes
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any donation center comment"
ON public.donation_center_comments
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any donation center like"
ON public.donation_center_likes
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any publication comment"
ON public.publication_comments
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any publication like"
ON public.publication_likes
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any donation product"
ON public.donation_products
FOR DELETE
USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete any donation category"
ON public.donation_categories
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Allow super admins to view all user roles
CREATE POLICY "Super admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Allow super admins to delete profiles
CREATE POLICY "Super admins can delete any profile"
ON public.profiles
FOR DELETE
USING (is_super_admin(auth.uid()));

-- Allow super admins to delete user roles
CREATE POLICY "Super admins can delete any user role"
ON public.user_roles
FOR DELETE
USING (is_super_admin(auth.uid()));