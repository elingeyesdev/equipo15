/*
  Warnings:

  - You are about to drop the `IdeaFavorite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "IdeaFavorite" DROP CONSTRAINT "IdeaFavorite_ideaId_fkey";

-- DropForeignKey
ALTER TABLE "IdeaFavorite" DROP CONSTRAINT "IdeaFavorite_userId_fkey";

-- DropTable
DROP TABLE "IdeaFavorite";

-- CreateTable
CREATE TABLE "idea_reactions" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FAVORITE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalties" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "appliedById" TEXT,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criteria" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_scores" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idea_reactions_ideaId_idx" ON "idea_reactions"("ideaId");

-- CreateIndex
CREATE INDEX "idea_reactions_userId_idx" ON "idea_reactions"("userId");

-- CreateIndex
CREATE INDEX "idea_reactions_userId_type_idx" ON "idea_reactions"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "idea_reactions_ideaId_userId_type_key" ON "idea_reactions"("ideaId", "userId", "type");

-- CreateIndex
CREATE INDEX "penalties_userId_idx" ON "penalties"("userId");

-- CreateIndex
CREATE INDEX "penalties_userId_expiresAt_idx" ON "penalties"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "penalties_userId_revokedAt_idx" ON "penalties"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "criteria_challengeId_idx" ON "criteria"("challengeId");

-- CreateIndex
CREATE INDEX "criteria_challengeId_isActive_idx" ON "criteria"("challengeId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_challengeId_name_key" ON "criteria"("challengeId", "name");

-- CreateIndex
CREATE INDEX "evaluation_scores_evaluationId_idx" ON "evaluation_scores"("evaluationId");

-- CreateIndex
CREATE INDEX "evaluation_scores_criterionId_idx" ON "evaluation_scores"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scores_evaluationId_criterionId_key" ON "evaluation_scores"("evaluationId", "criterionId");

-- AddForeignKey
ALTER TABLE "idea_reactions" ADD CONSTRAINT "idea_reactions_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- AddForeignKey
ALTER TABLE "idea_reactions" ADD CONSTRAINT "idea_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 1. Restricción de rango para los pesos de los criterios (1 a 100)
ALTER TABLE "criteria" 
  ADD CONSTRAINT "chk_weight_range" CHECK ("weight" >= 1 AND "weight" <= 100);

-- 2. Restricción de rango para la puntuación de los jueces (1 a 10)
ALTER TABLE "evaluation_scores" 
  ADD CONSTRAINT "chk_score_range" CHECK ("score" >= 1 AND "score" <= 10);

-- 3. Índice parcial para optimizar el 'hot path' de penalizaciones activas
CREATE INDEX "idx_active_penalties" 
  ON "penalties" ("userId", "expiresAt") 
  WHERE "revokedAt" IS NULL;
