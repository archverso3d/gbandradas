-- ============================================================================
-- Migration: Technique Graph View (Obsidian-style node graph)
-- Date: 2026-05-22
-- Description:
--   1. Ensures technique_groups exists with color + position columns
--   2. Adds is_default flag and seeds 19 default categories per user
--   3. Adds junction table technique_category_links (many-to-many)
--   4. Adds graph_x/graph_y to saved_techniques for drag persistence
--   5. Creates RPCs for graph data + position updates + category linking
--   6. Creates trigger that seeds new users with lewmosconi@gmail.com's library
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Ensure technique_groups exists
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technique_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NULL DEFAULT 'Slate',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.technique_groups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_groups' AND policyname='tg_select_own') THEN
    CREATE POLICY tg_select_own ON public.technique_groups FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_groups' AND policyname='tg_insert_own') THEN
    CREATE POLICY tg_insert_own ON public.technique_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_groups' AND policyname='tg_update_own') THEN
    CREATE POLICY tg_update_own ON public.technique_groups FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_groups' AND policyname='tg_delete_own') THEN
    CREATE POLICY tg_delete_own ON public.technique_groups FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Add columns: is_default, graph_x, graph_y on technique_groups
-- ----------------------------------------------------------------------------
ALTER TABLE public.technique_groups ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false;
ALTER TABLE public.technique_groups ADD COLUMN IF NOT EXISTS graph_x double precision NULL;
ALTER TABLE public.technique_groups ADD COLUMN IF NOT EXISTS graph_y double precision NULL;

-- Add graph position to saved_techniques
ALTER TABLE public.saved_techniques ADD COLUMN IF NOT EXISTS graph_x double precision NULL;
ALTER TABLE public.saved_techniques ADD COLUMN IF NOT EXISTS graph_y double precision NULL;

-- ----------------------------------------------------------------------------
-- 3. Junction table: technique_category_links (many-to-many)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.technique_category_links (
  technique_id uuid NOT NULL REFERENCES public.saved_techniques(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.technique_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (technique_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_tcl_user ON public.technique_category_links(user_id);
CREATE INDEX IF NOT EXISTS idx_tcl_category ON public.technique_category_links(category_id);

ALTER TABLE public.technique_category_links ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_category_links' AND policyname='tcl_select_own') THEN
    CREATE POLICY tcl_select_own ON public.technique_category_links FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_category_links' AND policyname='tcl_insert_own') THEN
    CREATE POLICY tcl_insert_own ON public.technique_category_links FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='technique_category_links' AND policyname='tcl_delete_own') THEN
    CREATE POLICY tcl_delete_own ON public.technique_category_links FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Backfill: copy existing saved_techniques.category_id → junction (only when both are set and belong to same user)
INSERT INTO public.technique_category_links (technique_id, category_id, user_id)
SELECT st.id, st.category_id, st.user_id
FROM public.saved_techniques st
WHERE st.category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Seed default categories for every existing user
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  defaults text[][] := ARRAY[
    ['QUEDAS','Red'], ['RASPAGEM','Purple'], ['PASSAGEM DE GUARDA','Green'],
    ['FINALIZAÇÃO','Amber'], ['100KG','Slate'], ['AMERICANA','Pink'],
    ['ARMLOCK','Blue'], ['BERIMBOLO','Red'], ['CHOKE','Red'],
    ['CURSO','Slate'], ['DOMINIO LATERAL','Blue'], ['DRIL','Purple'],
    ['EST. PEGADA','Amber'], ['ESTRANGULAMENTO','Pink'], ['MONTADA','Green'],
    ['MOVIMENTAÇÃO','Purple'], ['NO-GI','Slate'], ['OMOPLATA','Slate'],
    ['RELOGIO','Purple'], ['TRIANGULO','Blue']
  ];
  i int;
BEGIN
  FOR i IN 1..array_length(defaults,1) LOOP
    INSERT INTO public.technique_groups (user_id, name, color, is_default)
    VALUES (p_user_id, defaults[i][1], defaults[i][2], true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Seed for existing users (idempotent — skips if same name already exists for user)
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    -- Only seed if the user has zero default categories yet
    IF NOT EXISTS (SELECT 1 FROM public.technique_groups WHERE user_id = u.id AND is_default = true) THEN
      PERFORM public.seed_default_categories(u.id);
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 5. RPCs for graph view
-- ----------------------------------------------------------------------------

-- Returns the user's full graph: categories (nodes) + techniques (nodes) + links
CREATE OR REPLACE FUNCTION public.get_user_graph_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
  result jsonb;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'categories', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'color', color,
        'is_default', is_default, 'x', graph_x, 'y', graph_y
      )) FROM public.technique_groups WHERE user_id = v_user
    ), '[]'::jsonb),
    'techniques', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'link', link,
        'platform', platform, 'x', graph_x, 'y', graph_y
      )) FROM public.saved_techniques WHERE user_id = v_user
    ), '[]'::jsonb),
    'links', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'technique_id', technique_id, 'category_id', category_id
      )) FROM public.technique_category_links WHERE user_id = v_user
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;

-- Update graph node position (works for both 'category' and 'technique')
CREATE OR REPLACE FUNCTION public.update_node_position(
  p_node_type text,
  p_node_id uuid,
  p_x double precision,
  p_y double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_node_type = 'category' THEN
    UPDATE public.technique_groups
    SET graph_x = p_x, graph_y = p_y
    WHERE id = p_node_id AND user_id = auth.uid();
  ELSIF p_node_type = 'technique' THEN
    UPDATE public.saved_techniques
    SET graph_x = p_x, graph_y = p_y
    WHERE id = p_node_id AND user_id = auth.uid();
  ELSE
    RAISE EXCEPTION 'Invalid node_type: %', p_node_type;
  END IF;
END;
$$;

-- Replace the set of categories linked to a technique
CREATE OR REPLACE FUNCTION public.set_technique_categories(
  p_technique_id uuid,
  p_category_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
  cid uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM public.saved_techniques WHERE id = p_technique_id AND user_id = v_user) THEN
    RAISE EXCEPTION 'Technique not found or not owned';
  END IF;

  DELETE FROM public.technique_category_links
  WHERE technique_id = p_technique_id AND user_id = v_user;

  IF p_category_ids IS NOT NULL THEN
    FOREACH cid IN ARRAY p_category_ids LOOP
      INSERT INTO public.technique_category_links (technique_id, category_id, user_id)
      VALUES (p_technique_id, cid, v_user)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Seed new users with lewmosconi@gmail.com's library
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_user_from_lewmosconi()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_source_id uuid;
  v_new_user uuid := NEW.id;
  cat_map jsonb := '{}'::jsonb;  -- maps source category_id → new category_id
  tech_map jsonb := '{}'::jsonb; -- maps source technique_id → new technique_id
  src record;
  new_id uuid;
BEGIN
  -- Look up source user (lewmosconi@gmail.com)
  SELECT id INTO v_source_id FROM auth.users WHERE email = 'lewmosconi@gmail.com' LIMIT 1;

  -- Always seed the default categories first
  PERFORM public.seed_default_categories(v_new_user);

  -- If lewmosconi doesn't exist or is the user being created → stop here
  IF v_source_id IS NULL OR v_source_id = v_new_user THEN
    RETURN NEW;
  END IF;

  -- Copy lewmosconi's CUSTOM categories (non-default) to the new user
  FOR src IN
    SELECT id, name, color FROM public.technique_groups
    WHERE user_id = v_source_id AND is_default = false
  LOOP
    INSERT INTO public.technique_groups (user_id, name, color, is_default)
    VALUES (v_new_user, src.name, src.color, false)
    RETURNING id INTO new_id;
    cat_map := cat_map || jsonb_build_object(src.id::text, new_id::text);
  END LOOP;

  -- Map lewmosconi's DEFAULT categories → new user's default categories (by name)
  FOR src IN
    SELECT lg.id AS src_id, ng.id AS new_id
    FROM public.technique_groups lg
    JOIN public.technique_groups ng ON ng.user_id = v_new_user AND ng.name = lg.name AND ng.is_default = true
    WHERE lg.user_id = v_source_id AND lg.is_default = true
  LOOP
    cat_map := cat_map || jsonb_build_object(src.src_id::text, src.new_id::text);
  END LOOP;

  -- Copy lewmosconi's saved techniques
  FOR src IN
    SELECT id, title, link, category, platform FROM public.saved_techniques
    WHERE user_id = v_source_id
  LOOP
    INSERT INTO public.saved_techniques (user_id, title, link, category, platform)
    VALUES (v_new_user, src.title, src.link, src.category, src.platform)
    RETURNING id INTO new_id;
    tech_map := tech_map || jsonb_build_object(src.id::text, new_id::text);
  END LOOP;

  -- Copy category links, rewriting both ids
  INSERT INTO public.technique_category_links (technique_id, category_id, user_id)
  SELECT
    (tech_map ->> tcl.technique_id::text)::uuid,
    (cat_map ->> tcl.category_id::text)::uuid,
    v_new_user
  FROM public.technique_category_links tcl
  WHERE tcl.user_id = v_source_id
    AND tech_map ? tcl.technique_id::text
    AND cat_map ? tcl.category_id::text
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block signup if seed fails
  RAISE NOTICE 'seed_user_from_lewmosconi failed for %: %', v_new_user, SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if present, then create
DROP TRIGGER IF EXISTS on_auth_user_seed_techniques ON auth.users;
CREATE TRIGGER on_auth_user_seed_techniques
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_user_from_lewmosconi();

-- ============================================================================
-- DONE
-- Run order: paste this whole file in the Supabase SQL Editor and execute.
-- It is idempotent — safe to re-run.
-- ============================================================================
