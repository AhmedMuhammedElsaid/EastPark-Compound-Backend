-- CreateEnum
CREATE TYPE "ElectionVisibilityMode" AS ENUM ('SEALED_UNTIL_DEADLINE', 'LIVE_COUNT', 'ADMIN_CONTROLLED');

-- AlterTable
ALTER TABLE "elections" ADD COLUMN "visibilityMode" "ElectionVisibilityMode" NOT NULL DEFAULT 'SEALED_UNTIL_DEADLINE';
