-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "evaluationCriteria" JSONB,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "targetAudience" JSONB;

-- AlterTable
ALTER TABLE "idea_reactions" ADD COLUMN     "reactionType" TEXT;

-- AlterTable
ALTER TABLE "ideas" ADD COLUMN     "complexCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fireScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "futureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goodCount" INTEGER NOT NULL DEFAULT 0;
