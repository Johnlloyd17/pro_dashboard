-- CreateTable
CREATE TABLE "Fw4aRecord" (
    "id" TEXT NOT NULL,
    "locality" TEXT,
    "barangay" TEXT,
    "district" TEXT,
    "locations" TEXT,
    "siteType" TEXT,
    "siteCode" TEXT,
    "strategy" TEXT,
    "status" TEXT,
    "reasonForOutage" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fw4aRecord_pkey" PRIMARY KEY ("id")
);
