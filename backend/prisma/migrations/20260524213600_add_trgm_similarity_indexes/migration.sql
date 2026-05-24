-- E2.3: Indexación por similitud para búsqueda de usuarios
-- Habilita la extensión pg_trgm para búsquedas de trigramas (similitud)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice GIN en email para búsqueda rápida por similitud (ILIKE '%term%')
CREATE INDEX IF NOT EXISTS "idx_user_email_trgm" ON "User" USING GIN ("email" gin_trgm_ops);

-- Índice GIN en displayName para búsqueda rápida por similitud (ILIKE '%term%')
CREATE INDEX IF NOT EXISTS "idx_user_display_name_trgm" ON "User" USING GIN ("displayName" gin_trgm_ops);

-- Índice B-tree en role para filtrado rápido por rol
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User" ("role");
