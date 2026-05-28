-- ============================================================
-- PostgreSQL / Prisma
-- Ejecutar después de que Prisma genere las tablas base.
-- Este archivo agrega todo lo que Prisma NO puede generar:
--   índices parciales, CHECK constraints, trigger de integridad,
--   unicidad correcta para faculties con institutionId nullable.
-- ============================================================

-- ── ORDEN DE EJECUCIÓN ────────────────────────────────────
-- 1. CHECK constraints
-- 2. Unicidad de faculties
-- 3. Índices parciales (sesión y acceso)
-- 4. Índices parciales (feed de ideas)
-- 5. Índices parciales (comentarios)
-- 6. Índices de consultas frecuentes
-- 7. Índices de lookup polimórfico
-- 8. Trigger de integridad criterion↔challenge
-- ─────────────────────────────────────────────────────────

-- ============================================================
-- 1. CHECK CONSTRAINTS
-- ============================================================

-- criteria.weight debe estar entre 1 y 100.
-- El service además valida SUM(weight) = 100 antes de publicar el reto.
ALTER TABLE criteria
  ADD CONSTRAINT chk_weight_range
  CHECK (weight >= 1 AND weight <= 100);

-- evaluation_scores.score debe estar entre 1 y 10.
ALTER TABLE evaluation_scores
  ADD CONSTRAINT chk_score_range
  CHECK (score >= 1 AND score <= 10);

-- ============================================================
-- 2. UNICIDAD DE FACULTIES CON institutionId NULLABLE
-- ============================================================
-- El unique compuesto (name, institutionId) con NULL es permisivo:
-- PostgreSQL trata NULL != NULL, por lo que dos filas con el mismo
-- name e institutionId = NULL son válidas bajo ese constraint.
-- Se reemplaza por dos índices únicos parciales que cubren ambos casos.

-- Caso A: facultades con institución asignada (multitenancy futuro)
CREATE UNIQUE INDEX uq_faculty_with_institution
  ON faculties (name, "institutionId")
  WHERE "institutionId" IS NOT NULL;

-- Caso B: facultades sin institución (fase actual del sistema)
CREATE UNIQUE INDEX uq_faculty_without_institution
  ON faculties (name)
  WHERE "institutionId" IS NULL;

-- ============================================================
-- 3. ÍNDICES PARCIALES — SESIÓN Y ACCESO
-- ============================================================

-- Hot path de autenticación: excluye usuarios eliminados.
-- Se ejecuta en cada request autenticado al buscar por firebaseUid.
CREATE INDEX idx_users_active_firebase
  ON users ("firebaseUid")
  WHERE status != 'DELETED';

-- Hot path de validación de penalización activa.
-- Se ejecuta en cada request autenticado para saber si el usuario
-- está en modo solo lectura.
-- Penalidad activa = expiresAt > NOW() AND revokedAt IS NULL.
CREATE INDEX idx_active_penalties
  ON penalties ("userId", "expiresAt")
  WHERE "revokedAt" IS NULL;

-- ============================================================
-- 4. ÍNDICES PARCIALES — FEED DE IDEAS
-- ============================================================

-- Cursor pagination del feed principal.
-- Reemplaza OFFSET (que degrada a escala) por cursor basado en
-- (createdAt, id). Query resultante:
--   WHERE "challengeId" = $1
--     AND status = 'PUBLISHED'
--     AND "deletedAt" IS NULL
--     AND ("createdAt", id) < ($cursorCreatedAt, $cursorId)
--   ORDER BY "createdAt" DESC, id DESC
--   LIMIT 20
CREATE INDEX idx_ideas_cursor_feed
  ON ideas ("challengeId", status, "createdAt" DESC, id DESC)
  WHERE "deletedAt" IS NULL;

-- Ordenamiento por popularidad (podio en tiempo real).
CREATE INDEX idx_ideas_active_likes
  ON ideas ("challengeId", "likesCount" DESC)
  WHERE "deletedAt" IS NULL AND status = 'PUBLISHED';

-- "Mis ideas" y perfil de usuario.
CREATE INDEX idx_ideas_author_created
  ON ideas ("authorId", "createdAt" DESC)
  WHERE "deletedAt" IS NULL;

-- ============================================================
-- 5. ÍNDICES PARCIALES — COMENTARIOS
-- ============================================================

-- Lectura de hilos: raíces primero (parentCommentId IS NULL),
-- luego respuestas agrupadas por createdAt.
-- NOTA: si ORDER BY parentCommentId NULLS FIRST causa problemas
-- con el planner en datasets grandes, evaluar dos queries separadas
-- (raíces + replies) o agregar campo rootCommentId.
CREATE INDEX idx_comments_thread
  ON comments ("ideaId", "parentCommentId", "createdAt")
  WHERE "deletedAt" IS NULL AND status = 'VISIBLE';

-- Listado general de comentarios activos por idea.
CREATE INDEX idx_comments_active
  ON comments ("ideaId", "createdAt")
  WHERE "deletedAt" IS NULL;

-- ============================================================
-- 6. ÍNDICES DE CONSULTAS FRECUENTES
-- ============================================================

-- "Mis likes / mis favoritos" ordenados por recencia.
CREATE INDEX idx_reactions_user_type_created
  ON idea_reactions ("userId", type, "createdAt" DESC);

-- Listado de sesiones de mentoría por idea.
CREATE INDEX idx_mentorship_idea_date
  ON mentorship_sessions ("ideaId", "sessionDate" DESC);

-- ============================================================
-- 7. ÍNDICES DE LOOKUP POLIMÓRFICO
-- ============================================================
-- notifications y point_transactions usan referenceId/referenceType
-- polimórfico (sin FK real). Estos índices compensan la ausencia de FK.

CREATE INDEX idx_notifications_reference
  ON notifications ("referenceType", "referenceId");

CREATE INDEX idx_point_transactions_reference
  ON point_transactions ("referenceType", "referenceId");

-- ============================================================
-- 8. TRIGGER: integridad criterion↔challenge en evaluation_scores
-- ============================================================
-- Garantiza que el criterio evaluado pertenezca al mismo challenge
-- que la idea evaluada. Modelo inmutable: solo INSERT.
--
-- COMPORTAMIENTO:
--   - SELECT INTO STRICT falla con NO_DATA_FOUND si la fila no existe.
--   - El bloque EXCEPTION detecta cuál de los dos lookups falló
--     haciendo PERFORM adicionales para dar un mensaje preciso.
--   - Si ambos existen pero el criterio no pertenece al challenge,
--     lanza RAISE EXCEPTION con todos los IDs involucrados.
--
-- NOTA DEFERRABLE:
--   Si en el futuro se hacen cargas masivas de evaluation_scores
--   en una sola transacción, se puede migrar a:
--     CREATE CONSTRAINT TRIGGER trg_validate_criterion_challenge
--       AFTER INSERT ON evaluation_scores
--       DEFERRABLE INITIALLY DEFERRED
--       FOR EACH ROW EXECUTE FUNCTION validate_criterion_belongs_to_challenge();
--   Esto difiere la validación al COMMIT en lugar de por fila,
--   reduciendo el overhead en bulk inserts.
--   Requiere cambiar BEFORE INSERT → AFTER INSERT en el trigger.
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION validate_criterion_belongs_to_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge_id           varchar;
  v_criterion_challenge_id varchar;
BEGIN
  -- ① Obtener el challengeId de la evaluación (vía evaluations → ideas).
  --    STRICT lanza NO_DATA_FOUND si evaluationId no existe,
  --    evitando que v_challenge_id quede NULL silenciosamente.
  SELECT i."challengeId" INTO STRICT v_challenge_id
  FROM evaluations e
  JOIN ideas i ON i.id = e."ideaId"
  WHERE e.id = NEW."evaluationId";

  -- ② Obtener el challengeId del criterio.
  --    STRICT lanza NO_DATA_FOUND si criterionId no existe.
  SELECT "challengeId" INTO STRICT v_criterion_challenge_id
  FROM criteria
  WHERE id = NEW."criterionId";

  -- ③ Validar que el criterio pertenezca al mismo challenge que la evaluación.
  --    IS DISTINCT FROM maneja NULLs correctamente (NULL != NULL → true).
  IF v_challenge_id IS DISTINCT FROM v_criterion_challenge_id THEN
    RAISE EXCEPTION
      'INTEGRIDAD: criterion "%" pertenece al challenge "%" '
      'pero la evaluación "%" pertenece al challenge "%". '
      'Los criterios enviados deben corresponder al reto evaluado.',
      NEW."criterionId",
      v_criterion_challenge_id,
      NEW."evaluationId",
      v_challenge_id;
  END IF;

  RETURN NEW;

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    -- Determinar cuál de los dos lookups falló para dar un mensaje preciso.

    -- ¿Existe la evaluación?
    PERFORM 1 FROM evaluations WHERE id = NEW."evaluationId";
    IF NOT FOUND THEN
      RAISE EXCEPTION
        'INTEGRIDAD: evaluationId "%" no existe en la tabla evaluations. '
        'Verificar que la evaluación fue creada antes de insertar scores.',
        NEW."evaluationId";
    END IF;

    -- ¿Existe el criterio?
    PERFORM 1 FROM criteria WHERE id = NEW."criterionId";
    IF NOT FOUND THEN
      RAISE EXCEPTION
        'INTEGRIDAD: criterionId "%" no existe en la tabla criteria. '
        'Verificar que el criterio pertenece al reto antes de insertar scores.',
        NEW."criterionId";
    END IF;

    -- Fallback: si ambos existen pero STRICT falló por otro motivo (no debería ocurrir).
    RAISE;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_criterion_challenge
  BEFORE INSERT ON evaluation_scores
  FOR EACH ROW
  EXECUTE FUNCTION validate_criterion_belongs_to_challenge();

-- ============================================================
-- FIN — migration_v4.sql
-- ============================================================
