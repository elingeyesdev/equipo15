-- CreateTable
CREATE TABLE "IdeaFavorite" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaFavorite_ideaId_idx" ON "IdeaFavorite"("ideaId");

-- CreateIndex
CREATE INDEX "IdeaFavorite_userId_idx" ON "IdeaFavorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IdeaFavorite_ideaId_userId_key" ON "IdeaFavorite"("ideaId", "userId");

-- AddForeignKey
ALTER TABLE "IdeaFavorite" ADD CONSTRAINT "IdeaFavorite_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdeaFavorite" ADD CONSTRAINT "IdeaFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
