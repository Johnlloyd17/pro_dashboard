'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const VALID_PAGE_SIZES = [10, 20, 50, 100, 200];
const DEFAULT_PAGE_SIZE = 10;

interface AddFw4aRecordInput {
  locality?: string;
  barangay?: string;
  district?: string;
  locations?: string;
  siteType?: string;
  siteCode?: string;
  strategy?: string;
  status?: string;
  reasonForOutage?: string;
  remarks?: string;
}

export async function addFw4aRecord(input: AddFw4aRecordInput) {
  try {
    const record = await prisma.fw4aRecord.create({
      data: {
        locality: input.locality || null,
        barangay: input.barangay || null,
        district: input.district || null,
        locations: input.locations || null,
        siteType: input.siteType || null,
        siteCode: input.siteCode || null,
        strategy: input.strategy || null,
        status: input.status || null,
        reasonForOutage: input.reasonForOutage || null,
        remarks: input.remarks || null,
      },
    });

    revalidatePath('/fw4a');
    return { success: true, record };
  } catch (error) {
    console.error('addFw4aRecord error:', error);
    return { success: false, error: 'Failed to save FW4A record' };
  }
}

export async function getFw4aRecords(
  page: number = 1,
  search?: string,
  stat?: string,
  pageSize?: number,
  filters?: {
    locality?: string;
    district?: string;
    siteType?: string;
    status?: string;
    strategy?: string;
  },
) {
  const PAGE_SIZE = VALID_PAGE_SIZES.includes(pageSize ?? NaN)
    ? pageSize!
    : DEFAULT_PAGE_SIZE;

  const searchFilter = search
    ? {
        OR: [
          { locality: { contains: search, mode: 'insensitive' as const } },
          { barangay: { contains: search, mode: 'insensitive' as const } },
          { district: { contains: search, mode: 'insensitive' as const } },
          { locations: { contains: search, mode: 'insensitive' as const } },
          { siteCode: { contains: search, mode: 'insensitive' as const } },
          { siteType: { contains: search, mode: 'insensitive' as const } },
          { strategy: { contains: search, mode: 'insensitive' as const } },
          { status: { contains: search, mode: 'insensitive' as const } },
          { reasonForOutage: { contains: search, mode: 'insensitive' as const } },
          { remarks: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const dropdownFilter = {
    ...(filters?.locality ? { locality: { equals: filters.locality, mode: 'insensitive' as const } } : {}),
    ...(filters?.district ? { district: { equals: filters.district, mode: 'insensitive' as const } } : {}),
    ...(filters?.siteType ? { siteType: { equals: filters.siteType, mode: 'insensitive' as const } } : {}),
    ...(filters?.status ? { status: { equals: filters.status, mode: 'insensitive' as const } } : {}),
    ...(filters?.strategy ? { strategy: { equals: filters.strategy, mode: 'insensitive' as const } } : {}),
  };

  const where = {
    ...searchFilter,
    ...dropdownFilter,
  };

  const [records, totalCount] = await Promise.all([
    prisma.fw4aRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.fw4aRecord.count({ where }),
  ]);

  return {
    records,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export async function updateFw4aRecord(
  id: string,
  input: AddFw4aRecordInput,
) {
  try {
    await prisma.fw4aRecord.update({
      where: { id },
      data: {
        locality: input.locality || null,
        barangay: input.barangay || null,
        district: input.district || null,
        locations: input.locations || null,
        siteType: input.siteType || null,
        siteCode: input.siteCode || null,
        strategy: input.strategy || null,
        status: input.status || null,
        reasonForOutage: input.reasonForOutage || null,
        remarks: input.remarks || null,
      },
    });

    revalidatePath('/fw4a');
    return { success: true };
  } catch (error) {
    console.error('updateFw4aRecord error:', error);
    return { success: false, error: 'Failed to update FW4A record' };
  }
}

export async function deleteFw4aRecord(id: string) {
  try {
    await prisma.fw4aRecord.delete({ where: { id } });
    revalidatePath('/fw4a');
    return { success: true };
  } catch (error) {
    console.error('deleteFw4aRecord error:', error);
    return { success: false, error: 'Failed to delete FW4A record' };
  }
}

export async function deleteFw4aRecords(ids: string[]) {
  try {
    await prisma.fw4aRecord.deleteMany({
      where: { id: { in: ids } },
    });
    revalidatePath('/fw4a');
    return { success: true, count: ids.length };
  } catch (error) {
    console.error('deleteFw4aRecords error:', error);
    return { success: false, error: 'Failed to delete FW4A records' };
  }
}

const TOTAL_LGUS_IN_SDN = 27;
const TOTAL_BARANGAYS_IN_SDN = 335;

export async function getFw4aRecordStats() {
  const [
    totalRecords,
    activeSites,
    inactiveSites,
    lgusWithAccessPoint,
    barangaysWithAccessPoint,
  ] = await Promise.all([
    prisma.fw4aRecord.count(),
    prisma.fw4aRecord.count({ where: { status: { equals: 'Active', mode: 'insensitive' } } }),
    prisma.fw4aRecord.count({ where: { status: { equals: 'Inactive', mode: 'insensitive' } } }),
    prisma.fw4aRecord.findMany({
      where: { locality: { not: null } },
      distinct: ['locality'],
      select: { locality: true },
    }),
    prisma.fw4aRecord.findMany({
      where: {
        barangay: { not: null },
        status: { equals: 'Active', mode: 'insensitive' },
      },
      distinct: ['barangay'],
      select: { barangay: true },
    }),
  ]);

  return {
    totalRecords,
    activeSites,
    inactiveSites,
    lgusWithAccessPoint: lgusWithAccessPoint.length,
    totalLgus: TOTAL_LGUS_IN_SDN,
    lguPenetration: '0.00',
    barangaysWithAccessPoint: barangaysWithAccessPoint.length,
    totalBarangays: TOTAL_BARANGAYS_IN_SDN,
    barangayPenetration: TOTAL_BARANGAYS_IN_SDN > 0
      ? ((barangaysWithAccessPoint.length / TOTAL_BARANGAYS_IN_SDN) * 100).toFixed(2)
      : '0.00',
  };
}

export async function getFw4aRecordFilterOptions() {
  const [localities, districts, siteTypes, statuses, strategies] = await Promise.all([
    prisma.fw4aRecord.findMany({
      where: { locality: { not: null } },
      distinct: ['locality'],
      select: { locality: true },
      orderBy: { locality: 'asc' },
    }),
    prisma.fw4aRecord.findMany({
      where: { district: { not: null } },
      distinct: ['district'],
      select: { district: true },
      orderBy: { district: 'asc' },
    }),
    prisma.fw4aRecord.findMany({
      where: { siteType: { not: null } },
      distinct: ['siteType'],
      select: { siteType: true },
      orderBy: { siteType: 'asc' },
    }),
    prisma.fw4aRecord.findMany({
      where: { status: { not: null } },
      distinct: ['status'],
      select: { status: true },
      orderBy: { status: 'asc' },
    }),
    prisma.fw4aRecord.findMany({
      where: { strategy: { not: null } },
      distinct: ['strategy'],
      select: { strategy: true },
      orderBy: { strategy: 'asc' },
    }),
  ]);

  return {
    localities: localities.map((l) => l.locality).filter(Boolean) as string[],
    districts: districts.map((d) => d.district).filter(Boolean) as string[],
    siteTypes: siteTypes.map((s) => s.siteType).filter(Boolean) as string[],
    statuses: statuses.map((s) => s.status).filter(Boolean) as string[],
    strategies: strategies.map((s) => s.strategy).filter(Boolean) as string[],
  };
}

export async function importFw4aRecords(
  records: AddFw4aRecordInput[],
) {
  try {
    const result = await prisma.fw4aRecord.createMany({
      data: records.map((r) => ({
        locality: r.locality || null,
        barangay: r.barangay || null,
        district: r.district || null,
        locations: r.locations || null,
        siteType: r.siteType || null,
        siteCode: r.siteCode || null,
        strategy: r.strategy || null,
        status: r.status || null,
        reasonForOutage: r.reasonForOutage || null,
        remarks: r.remarks || null,
      })),
    });

    revalidatePath('/fw4a');
    return { success: true, count: result.count };
  } catch (error) {
    console.error('importFw4aRecords error:', error);
    return { success: false, error: 'Failed to import FW4A records' };
  }
}

export async function exportFw4aRecords(
  search?: string,
) {
  const searchFilter = search
    ? {
        OR: [
          { locality: { contains: search, mode: 'insensitive' as const } },
          { barangay: { contains: search, mode: 'insensitive' as const } },
          { district: { contains: search, mode: 'insensitive' as const } },
          { locations: { contains: search, mode: 'insensitive' as const } },
          { siteCode: { contains: search, mode: 'insensitive' as const } },
          { siteType: { contains: search, mode: 'insensitive' as const } },
          { strategy: { contains: search, mode: 'insensitive' as const } },
          { status: { contains: search, mode: 'insensitive' as const } },
          { reasonForOutage: { contains: search, mode: 'insensitive' as const } },
          { remarks: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  return prisma.fw4aRecord.findMany({
    where: searchFilter,
    orderBy: { createdAt: 'desc' },
  });
}
