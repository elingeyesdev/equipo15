-- CreateEnum
CREATE TYPE "ImpactArea" AS ENUM ('PRODUCTIVIDAD', 'COSTOS', 'CLIENTES', 'EQUIPO', 'CRECIMIENTO', 'SOSTENIBILIDAD', 'IMPACTO_SOCIAL');

-- CreateEnum
CREATE TYPE "ImprovementType" AS ENUM ('OPTIMIZA', 'POTENCIA', 'EXPANDE', 'TRANSFORMA');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('FACIL_IMPLEMENTAR', 'REQUIERE_COORDINACION', 'REQUIERE_DESARROLLO', 'REQUIERE_TRANSFORMACION');

-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('GOOD', 'FUTURE', 'COMPLEX', 'FAVORITE');
DELETE FROM "idea_reactions" WHERE "type"::text = 'LIKE';
ALTER TABLE "idea_reactions" ALTER COLUMN "type" TYPE "ReactionType_new" USING ("type"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "ReactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'ORGANIZATION', 'JUDGE', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING (CASE WHEN "role"::text = 'COMPANY' THEN 'ORGANIZATION' ELSE "role"::text END)::"UserRole_new";
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "_ChallengeToFaculty" DROP CONSTRAINT "_ChallengeToFaculty_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengeToFaculty" DROP CONSTRAINT "_ChallengeToFaculty_B_fkey";

-- DropForeignKey
ALTER TABLE "company_profiles" DROP CONSTRAINT "company_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "criteria" DROP CONSTRAINT "criteria_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "evaluation_scores" DROP CONSTRAINT "evaluation_scores_criterionId_fkey";

-- DropForeignKey
ALTER TABLE "idea_tags" DROP CONSTRAINT "idea_tags_ideaId_fkey";

-- DropForeignKey
ALTER TABLE "idea_tags" DROP CONSTRAINT "idea_tags_tagId_fkey";

-- DropIndex
DROP INDEX "criteria_challengeId_idx";

-- DropIndex
DROP INDEX "criteria_challengeId_isActive_idx";

-- DropIndex
DROP INDEX "criteria_challengeId_name_key";

-- DropIndex
DROP INDEX "evaluation_scores_criterionId_idx";

-- DropIndex
DROP INDEX "evaluation_scores_evaluationId_criterionId_key";

-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "evaluationCriteria";

-- AlterTable
ALTER TABLE "criteria" DROP COLUMN "challengeId",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "weight",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "evaluation_scores" DROP COLUMN "criterionId",
ADD COLUMN     "challengeCriterionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "institutionId",
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "idea_reactions" DROP COLUMN "reactionType";

-- AlterTable
ALTER TABLE "ideas" DROP COLUMN "impactArea",
ADD COLUMN     "impactArea" "ImpactArea",
DROP COLUMN "improvementType",
ADD COLUMN     "improvementType" "ImprovementType",
DROP COLUMN "effortLevel",
ADD COLUMN     "effortLevel" "EffortLevel";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "referenceId",
DROP COLUMN "referenceType",
ADD COLUMN     "challengeId" TEXT,
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "evaluationId" TEXT,
ADD COLUMN     "ideaId" TEXT;

-- AlterTable
ALTER TABLE "point_transactions" DROP COLUMN "referenceId",
DROP COLUMN "referenceType",
ADD COLUMN     "challengeId" TEXT,
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "evaluationId" TEXT,
ADD COLUMN     "ideaId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatarUrl",
DROP COLUMN "codigo_estudiantil",
DROP COLUMN "institucion_educativa",
DROP COLUMN "ocupacion_laboral";

-- DropTable
DROP TABLE "_ChallengeToFaculty";

-- DropTable
DROP TABLE "company_profiles";

-- DropTable
DROP TABLE "idea_tags";

-- DropTable
DROP TABLE "tags";

-- DropEnum
DROP TYPE "ReferenceType";

-- CreateTable
CREATE TABLE "organization_profiles" (
    "userId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "challenge_faculties" (
    "challengeId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_faculties_pkey" PRIMARY KEY ("challengeId","facultyId")
);

-- CreateTable
CREATE TABLE "challenge_criteria" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_criteria_challengeId_idx" ON "challenge_criteria"("challengeId");

-- CreateIndex
CREATE INDEX "challenge_criteria_criterionId_idx" ON "challenge_criteria"("criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_criteria_challengeId_criterionId_key" ON "challenge_criteria"("challengeId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "criteria_name_key" ON "criteria"("name");

-- CreateIndex
CREATE INDEX "evaluation_scores_challengeCriterionId_idx" ON "evaluation_scores"("challengeCriterionId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_scores_evaluationId_challengeCriterionId_key" ON "evaluation_scores"("evaluationId", "challengeCriterionId");

-- CreateIndex
CREATE INDEX "notifications_ideaId_idx" ON "notifications"("ideaId");

-- CreateIndex
CREATE INDEX "notifications_commentId_idx" ON "notifications"("commentId");

-- CreateIndex
CREATE INDEX "notifications_challengeId_idx" ON "notifications"("challengeId");

-- CreateIndex
CREATE INDEX "point_transactions_ideaId_idx" ON "point_transactions"("ideaId");

-- CreateIndex
CREATE INDEX "point_transactions_commentId_idx" ON "point_transactions"("commentId");

-- CreateIndex
CREATE INDEX "point_transactions_challengeId_idx" ON "point_transactions"("challengeId");

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_faculties" ADD CONSTRAINT "challenge_faculties_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_faculties" ADD CONSTRAINT "challenge_faculties_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_criteria" ADD CONSTRAINT "challenge_criteria_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_criteria" ADD CONSTRAINT "challenge_criteria_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_scores" ADD CONSTRAINT "evaluation_scores_challengeCriterionId_fkey" FOREIGN KEY ("challengeCriterionId") REFERENCES "challenge_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



-- DB SENIOR MASTER CONSTRAINTS

ALTER TABLE "notifications" ADD CONSTRAINT "check_exclusive_arc_notifications" CHECK (num_nonnulls("ideaId", "commentId", "challengeId", "evaluationId") <= 1);

ALTER TABLE "point_transactions" ADD CONSTRAINT "check_exclusive_arc_point_transactions" CHECK (num_nonnulls("ideaId", "commentId", "challengeId", "evaluationId") <= 1);

ALTER TABLE "challenges" ADD CONSTRAINT "check_private_challenge_token" CHECK (NOT "isPrivate" OR "accessToken" IS NOT NULL);
