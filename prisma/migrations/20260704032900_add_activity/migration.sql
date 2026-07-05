-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "activityVenue" TEXT,
    "indicator" TEXT,
    "barangay" TEXT,
    "dateFrom" TIMESTAMP(3),
    "dateTo" TIMESTAMP(3),
    "femaleCount" INTEGER NOT NULL DEFAULT 0,
    "maleCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bureauOptionId" TEXT,
    "projectOptionId" TEXT,
    "districtOptionId" TEXT,
    "municipalityOptionId" TEXT,
    "requestingAgencyId" TEXT,
    "modeOfImplementationId" TEXT,
    "statusId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityTargetSector" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "ActivityTargetSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityResponsiblePerson" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "ActivityResponsiblePerson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_bureauOptionId_fkey" FOREIGN KEY ("bureauOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectOptionId_fkey" FOREIGN KEY ("projectOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_districtOptionId_fkey" FOREIGN KEY ("districtOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_municipalityOptionId_fkey" FOREIGN KEY ("municipalityOptionId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_requestingAgencyId_fkey" FOREIGN KEY ("requestingAgencyId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_modeOfImplementationId_fkey" FOREIGN KEY ("modeOfImplementationId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTargetSector" ADD CONSTRAINT "ActivityTargetSector_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityTargetSector" ADD CONSTRAINT "ActivityTargetSector_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityResponsiblePerson" ADD CONSTRAINT "ActivityResponsiblePerson_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityResponsiblePerson" ADD CONSTRAINT "ActivityResponsiblePerson_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
