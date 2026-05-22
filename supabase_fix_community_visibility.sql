-- 1. Table: user_profiles
-- This ensures all authenticated students can view the community list
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" ON public.user_profiles 
  FOR SELECT TO authenticated USING (true);

-- 2. Table: saved_techniques
-- This allows the community mural to show the number of techniques saved by each student
ALTER TABLE public.saved_techniques ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view all saved techniques" ON public.saved_techniques;
CREATE POLICY "Authenticated users can view all saved techniques" ON public.saved_techniques 
  FOR SELECT TO authenticated USING (true);

-- 3. Table: student_attendance
-- This script ensures all authenticated users can see the attendance stats for the community
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view all attendance" ON public.student_attendance;
CREATE POLICY "Authenticated users can view all attendance" ON public.student_attendance 
  FOR SELECT TO authenticated USING (true);
