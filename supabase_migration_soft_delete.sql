-- Soft Delete Migration
-- Date: 2026-02-22
-- Description: Adds deleted_at and deleted_by to user_profiles to support a 72-hour limbo period.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) NULL;

-- Also we need to make sure the users are filtered out by default or we handle it in application logic.
-- We will handle it in application logic.
