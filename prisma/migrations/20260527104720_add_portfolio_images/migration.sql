-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ADD COLUMN     "portfolioUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
