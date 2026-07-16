'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const VALID_PAGE_SIZES = [10, 20, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 10;

interface AddPropertyRecordInput {
  project?: string;
  itemNo?: string;
  classification?: string;
  quantity?: number;
  unit?: string;
  descriptionModel?: string;
  receivedFrom?: string;
  propertyNumber?: string;
  icsParNumber?: string;
  serialNumber?: string;
  dateAcquired?: Date;
  accountableOfficer?: string;
  unitCost?: number;
  estimatedUsefulLife?: string;
  receivedTransferred?: string;
  remarks?: string;
}

export async function addPropertyRecord(input: AddPropertyRecordInput) {
  try {
    const record = await prisma.propertyRecord.create({
      data: {
        project: input.project || null,
        itemNo: input.itemNo || null,
        classification: input.classification || null,
        quantity: input.quantity ?? 0,
        unit: input.unit || null,
        descriptionModel: input.descriptionModel || null,
        receivedFrom: input.receivedFrom || null,
        propertyNumber: input.propertyNumber || null,
        icsParNumber: input.icsParNumber || null,
        serialNumber: input.serialNumber || null,
        dateAcquired: input.dateAcquired ?? null,
        accountableOfficer: input.accountableOfficer || null,
        unitCost: input.unitCost ?? 0,
        estimatedUsefulLife: input.estimatedUsefulLife || null,
        receivedTransferred: input.receivedTransferred || null,
        remarks: input.remarks || null,
      },
    });

    revalidatePath('/property-records');
    return { success: true, record };
  } catch (error) {
    console.error('addPropertyRecord error:', error);
    return { success: false, error: 'Failed to save property record' };
  }
}

export async function getPropertyRecords(
  page: number = 1,
  search?: string,
  stat?: string,
  pageSize?: number,
  filters?: {
    project?: string;
    icsParNumber?: string;
    year?: string;
    remarks?: string;
  },
) {
  const PAGE_SIZE = VALID_PAGE_SIZES.includes(pageSize ?? NaN)
    ? pageSize!
    : DEFAULT_PAGE_SIZE;
  const statFilter = getPropertyStatFilter(stat);

  const searchFilter = search
    ? {
        OR: [
          { project: { contains: search, mode: 'insensitive' as const } },
          { itemNo: { contains: search, mode: 'insensitive' as const } },
          { classification: { contains: search, mode: 'insensitive' as const } },
          { descriptionModel: { contains: search, mode: 'insensitive' as const } },
          { propertyNumber: { contains: search, mode: 'insensitive' as const } },
          { icsParNumber: { contains: search, mode: 'insensitive' as const } },
          { serialNumber: { contains: search, mode: 'insensitive' as const } },
          { accountableOfficer: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const yearFilter =
    filters?.year
      ? {
          dateAcquired: {
            gte: new Date(`${filters.year}-01-01T00:00:00.000Z`),
            lt: new Date(`${Number(filters.year) + 1}-01-01T00:00:00.000Z`),
          },
        }
      : {};

  const dropdownFilter = {
    ...(filters?.project ? { project: { equals: filters.project, mode: 'insensitive' as const } } : {}),
    ...(filters?.icsParNumber ? { icsParNumber: { equals: filters.icsParNumber, mode: 'insensitive' as const } } : {}),
    ...(filters?.remarks ? { remarks: { equals: filters.remarks, mode: 'insensitive' as const } } : {}),
  };

  const where = {
    ...searchFilter,
    ...statFilter,
    ...yearFilter,
    ...dropdownFilter,
  };

  const [records, totalCount] = await Promise.all([
    prisma.propertyRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.propertyRecord.count({ where }),
  ]);

  return {
    records,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export async function updatePropertyRecord(
  id: string,
  input: AddPropertyRecordInput,
) {
  try {
    await prisma.propertyRecord.update({
      where: { id },
      data: {
        project: input.project || null,
        itemNo: input.itemNo || null,
        classification: input.classification || null,
        quantity: input.quantity ?? 0,
        unit: input.unit || null,
        descriptionModel: input.descriptionModel || null,
        receivedFrom: input.receivedFrom || null,
        propertyNumber: input.propertyNumber || null,
        icsParNumber: input.icsParNumber || null,
        serialNumber: input.serialNumber || null,
        dateAcquired: input.dateAcquired ?? null,
        accountableOfficer: input.accountableOfficer || null,
        unitCost: input.unitCost ?? 0,
        estimatedUsefulLife: input.estimatedUsefulLife || null,
        receivedTransferred: input.receivedTransferred || null,
        remarks: input.remarks || null,
      },
    });

    revalidatePath('/property-records');
    return { success: true };
  } catch (error) {
    console.error('updatePropertyRecord error:', error);
    return { success: false, error: 'Failed to update property record' };
  }
}

export async function deletePropertyRecord(id: string) {
  try {
    await prisma.propertyRecord.delete({ where: { id } });
    revalidatePath('/property-records');
    return { success: true };
  } catch (error) {
    console.error('deletePropertyRecord error:', error);
    return { success: false, error: 'Failed to delete property record' };
  }
}

export async function deletePropertyRecords(ids: string[]) {
  try {
    await prisma.propertyRecord.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath('/property-records');
    return { success: true, count: ids.length };
  } catch (error) {
    console.error('deletePropertyRecords error:', error);
    return { success: false, error: 'Failed to delete property records' };
  }
}

export async function getPropertyRecordStats() {
  const [totalRecords, totalItems, totalValue] = await Promise.all([
    prisma.propertyRecord.count(),
    prisma.propertyRecord.aggregate({
      _sum: { quantity: true },
    }),
    prisma.propertyRecord.aggregate({
      _sum: { unitCost: true },
    }),
  ]);

  return {
    totalRecords,
    totalItems: totalItems._sum.quantity ?? 0,
    totalValue: totalValue._sum.unitCost ?? 0,
  };
}

function getPropertyStatFilter(stat?: string) {
  switch (stat) {
    case 'total-items':
      return { quantity: { gt: 0 } };
    case 'total-value':
      return { unitCost: { gt: 0 } };
    default:
      return {};
  }
}

export async function getPropertyRecordFilterOptions() {
  const [projects, icsParNumbers, remarks, years] = await Promise.all([
    prisma.propertyRecord.findMany({
      where: { project: { not: null } },
      distinct: ['project'],
      select: { project: true },
      orderBy: { project: 'asc' },
    }),
    prisma.propertyRecord.findMany({
      where: { icsParNumber: { not: null } },
      distinct: ['icsParNumber'],
      select: { icsParNumber: true },
      orderBy: { icsParNumber: 'asc' },
    }),
    prisma.propertyRecord.findMany({
      where: { remarks: { not: null } },
      distinct: ['remarks'],
      select: { remarks: true },
      orderBy: { remarks: 'asc' },
    }),
    prisma.$queryRaw<{ year: string }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM "dateAcquired")::text AS year
      FROM "PropertyRecord"
      WHERE "dateAcquired" IS NOT NULL
      ORDER BY year DESC
    `,
  ]);

  return {
    projects: projects.map((p) => p.project).filter(Boolean) as string[],
    icsParNumbers: icsParNumbers.map((i) => i.icsParNumber).filter(Boolean) as string[],
    remarks: remarks.map((r) => r.remarks).filter(Boolean) as string[],
    years: years.map((y) => y.year).filter(Boolean),
  };
}

export async function importPropertyRecords(
  records: AddPropertyRecordInput[],
) {
  try {
    const result = await prisma.propertyRecord.createMany({
      data: records.map((r) => ({
        project: r.project || null,
        itemNo: r.itemNo || null,
        classification: r.classification || null,
        quantity: r.quantity ?? 0,
        unit: r.unit || null,
        descriptionModel: r.descriptionModel || null,
        receivedFrom: r.receivedFrom || null,
        propertyNumber: r.propertyNumber || null,
        icsParNumber: r.icsParNumber || null,
        serialNumber: r.serialNumber || null,
        dateAcquired: r.dateAcquired ?? null,
        accountableOfficer: r.accountableOfficer || null,
        unitCost: r.unitCost ?? 0,
        estimatedUsefulLife: r.estimatedUsefulLife || null,
        receivedTransferred: r.receivedTransferred || null,
        remarks: r.remarks || null,
      })),
    });

    revalidatePath('/property-records');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('importPropertyRecords error:', error);
    return { success: false, error: 'Failed to import property records' };
  }
}

export async function exportPropertyRecords(
  search?: string,
  stat?: string,
) {
  const statFilter = getPropertyStatFilter(stat);

  const searchFilter = search
    ? {
        OR: [
          { project: { contains: search, mode: 'insensitive' as const } },
          { itemNo: { contains: search, mode: 'insensitive' as const } },
          { classification: { contains: search, mode: 'insensitive' as const } },
          { descriptionModel: { contains: search, mode: 'insensitive' as const } },
          { propertyNumber: { contains: search, mode: 'insensitive' as const } },
          { icsParNumber: { contains: search, mode: 'insensitive' as const } },
          { serialNumber: { contains: search, mode: 'insensitive' as const } },
          { accountableOfficer: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const where = {
    ...searchFilter,
    ...statFilter,
  };

  return prisma.propertyRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}
