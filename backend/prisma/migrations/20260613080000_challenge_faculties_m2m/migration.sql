-- AlterEnum
ALTER TYPE "NotifType" ADD VALUE 'ROLE_UPDATED';
ALTER TYPE "NotifType" ADD VALUE 'NEW_CHALLENGE_PUBLISHED';
ALTER TYPE "NotifType" ADD VALUE 'NEW_COMMENT';
ALTER TYPE "NotifType" ADD VALUE 'IDEA_REACTION';
ALTER TYPE "NotifType" ADD VALUE 'COMMENT_REPLY';
ALTER TYPE "NotifType" ADD VALUE 'CHALLENGE_EXPIRING';
ALTER TYPE "NotifType" ADD VALUE 'EVALUATION_STARTED';
ALTER TYPE "NotifType" ADD VALUE 'EVALUATION_SUBMITTED';
ALTER TYPE "NotifType" ADD VALUE 'JUDGE_ASSIGNED';

-- CreateTable
CREATE TABLE "_ChallengeToFaculty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChallengeToFaculty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChallengeToFaculty_B_index" ON "_ChallengeToFaculty"("B");

-- Copy existing relationships
INSERT INTO "_ChallengeToFaculty" ("A", "B")
SELECT "id", "facultyId" FROM "challenges" WHERE "facultyId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "challenges" DROP CONSTRAINT "challenges_facultyId_fkey";

-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "facultyId";

-- AddForeignKey
ALTER TABLE "_ChallengeToFaculty" ADD CONSTRAINT "_ChallengeToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToFaculty" ADD CONSTRAINT "_ChallengeToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
