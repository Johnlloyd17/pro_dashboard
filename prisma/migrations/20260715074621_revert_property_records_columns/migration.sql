/*
  Warnings:

  - You are about to drop the column `activityName` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `approvedActivityDesign` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `barangay` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `bureau` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `female` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `indicator` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `linkToMovs` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `male` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `modeOfImplementation` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `municipalityCity` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `nameOfResourcePerson` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `noOfCompleters` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `noOfParticipants` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `requestingAgency` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `responsiblePerson` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `targetSector` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `trainingVenue` on the `PropertyRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PropertyRecord" DROP COLUMN "activityName",
DROP COLUMN "approvedActivityDesign",
DROP COLUMN "barangay",
DROP COLUMN "bureau",
DROP COLUMN "district",
DROP COLUMN "endDate",
DROP COLUMN "female",
DROP COLUMN "indicator",
DROP COLUMN "linkToMovs",
DROP COLUMN "male",
DROP COLUMN "modeOfImplementation",
DROP COLUMN "municipalityCity",
DROP COLUMN "nameOfResourcePerson",
DROP COLUMN "noOfCompleters",
DROP COLUMN "noOfParticipants",
DROP COLUMN "requestingAgency",
DROP COLUMN "responsiblePerson",
DROP COLUMN "startDate",
DROP COLUMN "targetSector",
DROP COLUMN "trainingVenue",
ADD COLUMN     "accountableOfficer" TEXT,
ADD COLUMN     "classification" TEXT,
ADD COLUMN     "dateAcquired" TIMESTAMP(3),
ADD COLUMN     "descriptionModel" TEXT,
ADD COLUMN     "estimatedUsefulLife" TEXT,
ADD COLUMN     "icsParNumber" TEXT,
ADD COLUMN     "itemNo" TEXT,
ADD COLUMN     "propertyNumber" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "receivedFrom" TEXT,
ADD COLUMN     "receivedTransferred" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0;
