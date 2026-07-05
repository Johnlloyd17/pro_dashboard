-- AlterTable
ALTER TABLE "Target" ADD COLUMN     "projectOptionId" TEXT;

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_projectOptionId_fkey" FOREIGN KEY ("projectOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
