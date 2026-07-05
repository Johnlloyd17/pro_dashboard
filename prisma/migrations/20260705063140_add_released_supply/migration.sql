-- CreateTable
CREATE TABLE "ReleasedSupply" (
    "id" TEXT NOT NULL,
    "supplyId" TEXT NOT NULL,
    "releasedQuantity" INTEGER NOT NULL,
    "releasedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requesteeName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleasedSupply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReleasedSupply" ADD CONSTRAINT "ReleasedSupply_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
