-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "bureauOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_bureauOptionId_fkey" FOREIGN KEY ("bureauOptionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
