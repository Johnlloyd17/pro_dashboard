/*
  Warnings:

  - You are about to drop the column `key` on the `OptionRelation` table. All the data in the column will be lost.
  - Added the required column `relatedOptionId` to the `OptionRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OptionRelation" DROP COLUMN "key",
ADD COLUMN     "relatedOptionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OptionRelation" ADD CONSTRAINT "OptionRelation_relatedOptionId_fkey" FOREIGN KEY ("relatedOptionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
