-- ============================================================================
-- CLEANUP: Dedupe duplicate categories + backfill orphan technique-category links
-- Date: 2026-05-22
--
-- Run AFTER supabase_migration_graph_view.sql. Idempotent.
--
-- Fixes two issues:
--   1) Same-name categories exist twice (custom + default created by migration).
--      We keep the OLDEST row per user per case-insensitive name, redirect
--      all links/category_id refs to it, then delete the rest.
--   2) Techniques have `category` text but no `category_id` / link row.
--      We match the text to an existing category by case-insensitive name
--      and create the missing link + populate category_id.
--
-- Also: patches public.seed_default_categories so future seedings never
-- create same-name duplicates.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Dedupe categories
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  dup record;
  keeper_id uuid;
BEGIN
  -- For each (user_id, lower(name)) that has 2+ rows, pick the OLDEST as keeper
  FOR dup IN
    SELECT user_id, lower(trim(name)) AS lname, MIN(created_at) AS oldest
    FROM public.technique_groups
    GROUP BY user_id, lower(trim(name))
    HAVING COUNT(*) > 1
  LOOP
    -- Get the keeper id (oldest row for this user/name)
    SELECT id INTO keeper_id
    FROM public.technique_groups
    WHERE user_id = dup.user_id
      AND lower(trim(name)) = dup.lname
      AND created_at = dup.oldest
    LIMIT 1;

    -- Redirect saved_techniques.category_id
    UPDATE public.saved_techniques
    SET category_id = keeper_id
    WHERE user_id = dup.user_id
      AND category_id IN (
        SELECT id FROM public.technique_groups
        WHERE user_id = dup.user_id
          AND lower(trim(name)) = dup.lname
          AND id <> keeper_id
      );

    -- Redirect technique_category_links (insert keeper version if missing, then delete the old)
    INSERT INTO public.technique_category_links (technique_id, category_id, user_id)
    SELECT tcl.technique_id, keeper_id, tcl.user_id
    FROM public.technique_category_links tcl
    WHERE tcl.user_id = dup.user_id
      AND tcl.category_id IN (
        SELECT id FROM public.technique_groups
        WHERE user_id = dup.user_id
          AND lower(trim(name)) = dup.lname
          AND id <> keeper_id
      )
    ON CONFLICT DO NOTHING;

    DELETE FROM public.technique_category_links
    WHERE user_id = dup.user_id
      AND category_id IN (
        SELECT id FROM public.technique_groups
        WHERE user_id = dup.user_id
          AND lower(trim(name)) = dup.lname
          AND id <> keeper_id
      );

    -- Promote the keeper to is_default = true (since defaults were what introduced collisions)
    UPDATE public.technique_groups
    SET is_default = true, name = upper(trim(name))
    WHERE id = keeper_id;

    -- Finally delete the duplicates
    DELETE FROM public.technique_groups
    WHERE user_id = dup.user_id
      AND lower(trim(name)) = dup.lname
      AND id <> keeper_id;
  END LOOP;
END $$;

-- Normalize all category names to UPPER for consistency (does not break ids/links)
UPDATE public.technique_groups
SET name = upper(trim(name))
WHERE name <> upper(trim(name));

-- ----------------------------------------------------------------------------
-- 2) Backfill orphan technique → category links
--    For each saved_techniques row where category_id IS NULL but category text
--    matches a category name (case-insensitive), populate category_id and
--    insert into the junction table.
-- ----------------------------------------------------------------------------
WITH matched AS (
  SELECT st.id AS tech_id, st.user_id, tg.id AS cat_id
  FROM public.saved_techniques st
  JOIN public.technique_groups tg
    ON tg.user_id = st.user_id
   AND lower(trim(tg.name)) = lower(trim(st.category))
  WHERE st.category IS NOT NULL
    AND st.category_id IS NULL
)
UPDATE public.saved_techniques st
SET category_id = m.cat_id
FROM matched m
WHERE st.id = m.tech_id;

-- Now insert any missing links (covers both old rows we just populated AND any with category_id already set)
INSERT INTO public.technique_category_links (technique_id, category_id, user_id)
SELECT st.id, st.category_id, st.user_id
FROM public.saved_techniques st
WHERE st.category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3) Patch seed_default_categories to be name-collision aware
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
    -- Only insert if the user does NOT already have a category with this name (case-insensitive)
    IF NOT EXISTS (
      SELECT 1 FROM public.technique_groups
      WHERE user_id = p_user_id
        AND lower(trim(name)) = lower(defaults[i][1])
    ) THEN
      INSERT INTO public.technique_groups (user_id, name, color, is_default)
      VALUES (p_user_id, defaults[i][1], defaults[i][2], true);
    ELSE
      -- Just promote the existing match to is_default = true (so the trigger logic stays consistent)
      UPDATE public.technique_groups
      SET is_default = true
      WHERE user_id = p_user_id
        AND lower(trim(name)) = lower(defaults[i][1])
        AND is_default = false;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================================
-- DONE.
-- Verify with:
--   SELECT lower(name), COUNT(*) FROM public.technique_groups
--   WHERE user_id = '28db2b01-c4f8-416d-b9c9-e2f1d320f2d0'
--   GROUP BY lower(name) HAVING COUNT(*) > 1;
-- (should return 0 rows)
-- ============================================================================
