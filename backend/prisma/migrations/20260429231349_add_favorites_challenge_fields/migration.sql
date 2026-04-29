/*
  Warnings:

  - You are about to drop the column `career` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isFacultyVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `User` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SOFT_BLOCK', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "evaluationCriteria" JSONB,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "podiumSize" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "career",
DROP COLUMN "isFacultyVerified",
DROP COLUMN "specialty",
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "penaltyExpiresAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "studentCode" TEXT;

-- CreateTable
CREATE TABLE "IdeaLike" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserAccessedPrivateChallenges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserAccessedPrivateChallenges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "IdeaLike_ideaId_idx" ON "IdeaLike"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaLike_userId_idx" ON "IdeaLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaLike_ideaId_userId_key" ON "IdeaLike"("ideaId", "userId");

-- CreateIndex
CREATE INDEX "_UserAccessedPrivateChallenges_B_index" ON "_UserAccessedPrivateChallenges"("B");

-- CreateIndex
CREATE INDEX "Evaluation_ideaId_idx" ON "Evaluation"("ideaId");

-- CreateIndex
CREATE INDEX "Evaluation_judgeId_idx" ON "Evaluation"("judgeId");

-- CreateIndex
CREATE INDEX "Idea_challengeId_idx" ON "Idea"("challengeId");

-- CreateIndex
CREATE INDEX "Idea_authorId_idx" ON "Idea"("authorId");

-- CreateIndex
CREATE INDEX "Idea_status_idx" ON "Idea"("status");

-- CreateIndex
CREATE INDEX "Idea_challengeId_status_createdAt_idx" ON "Idea"("challengeId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Idea_challengeId_likesCount_idx" ON "Idea"("challengeId", "likesCount");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaLike" ADD CONSTRAINT "IdeaLike_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaLike" ADD CONSTRAINT "IdeaLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAccessedPrivateChallenges" ADD CONSTRAINT "_UserAccessedPrivateChallenges_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAccessedPrivateChallenges" ADD CONSTRAINT "_UserAccessedPrivateChallenges_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
