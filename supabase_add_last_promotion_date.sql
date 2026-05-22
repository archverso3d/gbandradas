-- ============================================================================
-- MIGRATION: Add last_promotion_date to user_profiles
-- Date: 2026-05-22
--
-- HOW TO USE:
--   1. Open Supabase Dashboard -> SQL Editor
--   2. Paste & Run this script.
--
-- Purpose:
--   Stores the date of the student's most recent graduation/degree promotion.
--   The app uses this together with attendance frequency to estimate the
--   next_graduation_date automatically.
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_promotion_date date NULL;

COMMENT ON COLUMN public.user_profiles.last_promotion_date IS
  'Date of last belt/degree promotion. Drives next_graduation_date estimation based on attendance.';
