-- DropIndex
DROP INDEX "idx_user_display_name_trgm";

-- DropIndex
DROP INDEX "idx_user_email_trgm";

-- DropIndex
DROP INDEX "idx_user_role";

-- CreateTable
CREATE TABLE "_ChallengeJudges" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChallengeJudges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChallengeJudges_B_index" ON "_ChallengeJudges"("B");

-- AddForeignKey
ALTER TABLE "_ChallengeJudges" ADD CONSTRAINT "_ChallengeJudges_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeJudges" ADD CONSTRAINT "_ChallengeJudges_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
