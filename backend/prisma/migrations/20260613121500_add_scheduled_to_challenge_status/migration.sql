-- AlterEnum: Add SCHEDULED value to ChallengeStatus
ALTER TYPE "ChallengeStatus" ADD VALUE IF NOT EXISTS 'SCHEDULED';
