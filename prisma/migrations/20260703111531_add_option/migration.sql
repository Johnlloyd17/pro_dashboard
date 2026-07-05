-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionRelation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "OptionRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionRelation" ADD CONSTRAINT "OptionRelation_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
