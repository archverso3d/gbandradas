-- Migration to fix Community Tab visibility
-- Previous policy restricted users to only see their own profile.
-- We verify if the policy exists before dropping to avoid errors if it was named differently, 
-- but since we know the schema, we target the standard name.

-- Drop the restrictive policy (if it exists under this name)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

-- Create the new permissive policy for viewing profiles
-- This allows any authenticated user to select any row from user_profiles
CREATE POLICY "Users can view all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (true);

-- Ensure RLS is enabled (it should be, but good measure)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
