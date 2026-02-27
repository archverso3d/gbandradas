-- Tabela de histórico de peso do aluno
CREATE TABLE IF NOT EXISTS student_weight_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE student_weight_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'student_weight_history'
    AND policyname = 'Users can manage their own weight history'
  ) THEN
    CREATE POLICY "Users can manage their own weight history"
      ON student_weight_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Novas colunas no perfil do aluno (dados físicos)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'masculino';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fitness_goal TEXT DEFAULT 'manter';
