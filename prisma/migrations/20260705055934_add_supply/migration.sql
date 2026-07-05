-- CreateTable
CREATE TABLE "Supply" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryOptionId" TEXT,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_categoryOptionId_fkey" FOREIGN KEY ("categoryOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;
