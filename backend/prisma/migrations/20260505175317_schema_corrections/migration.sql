/*
  Warnings:

  - You are about to drop the column `votesCount` on the `Idea` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMPANY', 'JUDGE', 'USER');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Challenge" ALTER COLUMN "facultyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "editCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Idea" RENAME COLUMN "votesCount" TO "finalScore";
ALTER TABLE "Idea" ALTER COLUMN "finalScore" SET DATA TYPE DOUBLE PRECISION USING "finalScore"::double precision;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commentDeleteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "commentEditCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "likeRemovalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Data migration for Role
UPDATE "User"
SET "role" = CASE 
    WHEN "Role"."name" = 'ADMIN' THEN 'ADMIN'::"UserRole"
    WHEN "Role"."name" = 'COMPANY' THEN 'COMPANY'::"UserRole"
    WHEN "Role"."name" = 'JUDGE' THEN 'JUDGE'::"UserRole"
    ELSE 'USER'::"UserRole"
END
FROM "Role"
WHERE "User"."roleId" = "Role"."id";

ALTER TABLE "User" DROP COLUMN "roleId",
ALTER COLUMN "facultyId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Role";

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institutionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_institutionId_key" ON "faculties"("name", "institutionId");

-- Clear dangling facultyId values
UPDATE "User" SET "facultyId" = NULL;
UPDATE "Challenge" SET "facultyId" = NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
