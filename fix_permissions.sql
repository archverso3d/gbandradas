-- ==============================================================================
-- Script para Corrigir Permissões de Visualização (Comunidade)
-- ==============================================================================
-- Este script permite que alunos vejam a frequência e histórico uns dos outros.

-- 1. Frequência (Student Attendance)
-- Permite que qualquer usuário logado veja os registros de frequência
DROP POLICY IF EXISTS "Authenticated users can view all attendance" ON "student_attendance";

CREATE POLICY "Authenticated users can view all attendance"
ON "student_attendance"
FOR SELECT
TO authenticated
USING (true);

-- 2. Técnicas Salvas (Saved Techniques)
-- Permite que usuários vejam as técnicas salvas uns dos outros
DROP POLICY IF EXISTS "Authenticated users can view all saved techniques" ON "saved_techniques";

CREATE POLICY "Authenticated users can view all saved techniques"
ON "saved_techniques"
FOR SELECT
TO authenticated
USING (true);

-- 3. Graduações (Student Graduations)
-- Permite ver o histórico de faixas/graus
DROP POLICY IF EXISTS "Authenticated users can view all graduations" ON "student_graduations";

CREATE POLICY "Authenticated users can view all graduations"
ON "student_graduations"
FOR SELECT
TO authenticated
USING (true);
