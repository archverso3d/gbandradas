-- ==============================================================================
-- Script para Corrigir Permissões de Leitura de Configurações (app_settings)
-- ==============================================================================
-- Este script permite que alunos (e qualquer visitante) possam ler as configurações
-- do sistema, como os links das técnicas adicionados pelo administrador.

-- Certifique-se de que a tabela tem RLS habilitado
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Remove políticas anteriores que possam estar restringindo a leitura
DROP POLICY IF EXISTS "Enable read access for all" ON public.app_settings;
DROP POLICY IF EXISTS "Allow public read access" ON public.app_settings;
DROP POLICY IF EXISTS "Public can read app settings" ON public.app_settings;

-- Cria a política permitindo que TODOS (anon e authenticated) possam fazer SELECT
CREATE POLICY "Enable read access for all"
ON public.app_settings
FOR SELECT
TO public
USING (true);

-- Lembrete: Se a política de UPDATE não existir, você pode criá-ola no painel do Supabase
-- com a restrição adequada (ex: apenas admins). A leitura (SELECT) agora está pública.
