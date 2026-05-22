ALTER TABLE "allowed_domains"
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "allowed_domains"
SET "isActive" = true
WHERE "isActive" IS NULL;
