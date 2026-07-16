-- CreateTable
CREATE TABLE "PropertyRecord" (
    "id" TEXT NOT NULL,
    "project" TEXT,
    "itemNo" TEXT,
    "classification" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT,
    "descriptionModel" TEXT,
    "receivedFrom" TEXT,
    "propertyNumber" TEXT,
    "icsParNumber" TEXT,
    "serialNumber" TEXT,
    "dateAcquired" TIMESTAMP(3),
    "accountableOfficer" TEXT,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedUsefulLife" TEXT,
    "receivedTransferred" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyRecord_pkey" PRIMARY KEY ("id")
);
