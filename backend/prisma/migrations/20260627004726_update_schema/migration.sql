-- AlterEnum
ALTER TYPE "NotifType" ADD VALUE 'JUDGE_REMOVED';

-- AlterTable
ALTER TABLE "criteria" ADD COLUMN     "description" TEXT;
