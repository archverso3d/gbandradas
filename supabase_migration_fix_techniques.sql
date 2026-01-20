-- Migration: Fix saved_techniques table
-- Date: 2026-01-20
-- Description: Add missing category_id column and UPDATE policy

-- Step 1: Add category_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'saved_techniques' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.saved_techniques 
    ADD COLUMN category_id uuid NULL;
    
    RAISE NOTICE 'Column category_id added successfully';
  ELSE
    RAISE NOTICE 'Column category_id already exists';
  END IF;
END $$;

-- Step 2: Add foreign key constraint if technique_groups table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'technique_groups'
  ) THEN
    -- Drop constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'saved_techniques_category_id_fkey'
      AND table_name = 'saved_techniques'
    ) THEN
      ALTER TABLE public.saved_techniques 
      DROP CONSTRAINT saved_techniques_category_id_fkey;
    END IF;
    
    -- Add the constraint
    ALTER TABLE public.saved_techniques 
    ADD CONSTRAINT saved_techniques_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES public.technique_groups(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Foreign key constraint added successfully';
  ELSE
    RAISE NOTICE 'Table technique_groups does not exist, skipping foreign key constraint';
  END IF;
END $$;

-- Step 3: Add UPDATE policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'saved_techniques' 
    AND policyname = 'Users can update their own techniques'
  ) THEN
    CREATE POLICY "Users can update their own techniques" 
    ON public.saved_techniques
    FOR UPDATE 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'UPDATE policy added successfully';
  ELSE
    RAISE NOTICE 'UPDATE policy already exists';
  END IF;
END $$;
