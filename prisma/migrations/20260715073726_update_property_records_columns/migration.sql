/*
  Warnings:

  - You are about to drop the column `accountableOfficer` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `classification` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `dateAcquired` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionModel` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedUsefulLife` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `icsParNumber` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `itemNo` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `propertyNumber` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `receivedFrom` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `receivedTransferred` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PropertyRecord` table. All the data in the column will be lost.
  - You are about to drop the column `unitCost` on the `PropertyRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PropertyRecord" DROP COLUMN "accountableOfficer",
DROP COLUMN "classification",
DROP COLUMN "dateAcquired",
DROP COLUMN "descriptionModel",
DROP COLUMN "estimatedUsefulLife",
DROP COLUMN "icsParNumber",
DROP COLUMN "itemNo",
DROP COLUMN "propertyNumber",
DROP COLUMN "quantity",
DROP COLUMN "receivedFrom",
DROP COLUMN "receivedTransferred",
DROP COLUMN "serialNumber",
DROP COLUMN "unit",
DROP COLUMN "unitCost",
ADD COLUMN     "activityName" TEXT,
ADD COLUMN     "approvedActivityDesign" TEXT,
ADD COLUMN     "barangay" TEXT,
ADD COLUMN     "bureau" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "female" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "indicator" TEXT,
ADD COLUMN     "linkToMovs" TEXT,
ADD COLUMN     "male" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "modeOfImplementation" TEXT,
ADD COLUMN     "municipalityCity" TEXT,
ADD COLUMN     "nameOfResourcePerson" TEXT,
ADD COLUMN     "noOfCompleters" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "noOfParticipants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requestingAgency" TEXT,
ADD COLUMN     "responsiblePerson" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "targetSector" TEXT,
ADD COLUMN     "trainingVenue" TEXT;
