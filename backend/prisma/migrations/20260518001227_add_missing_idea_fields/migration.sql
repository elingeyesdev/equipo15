-- CreateEnum
CREATE TYPE "ImpactArea" AS ENUM ('PRODUCTIVITY', 'COSTS', 'CUSTOMERS', 'TEAM', 'GROWTH', 'SUSTAINABILITY', 'SOCIAL_IMPACT');

-- CreateEnum
CREATE TYPE "ImprovementType" AS ENUM ('OPTIMIZES', 'ENHANCES', 'EXPANDS', 'TRANSFORMS');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('EASY', 'COORDINATION', 'DEVELOPMENT', 'TRANSFORMATION');

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "effortLevel" "EffortLevel",
ADD COLUMN     "impactArea" "ImpactArea",
ADD COLUMN     "improvementType" "ImprovementType";
