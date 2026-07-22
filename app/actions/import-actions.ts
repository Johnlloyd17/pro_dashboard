'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface ImportActivityRow {
  activityName?: string;
  activityVenue?: string;
  dateFrom?: string;
  dateTo?: string;
  bureau?: string;
  project?: string;
  indicators?: string;
  district?: string;
  municipality?: string;
  barangay?: string;
  requestingAgency?: string;
  modeOfImplementation?: string;
  targetSectors?: string;
  responsiblePersons?: string;
  status?: string;
  femaleCount?: number;
  maleCount?: number;
  totalCount?: number;
}

async function findOrCreateOption(labelName: string, optionName: string) {
  const trimmed = optionName.trim();
  if (!trimmed) return null;

  const label = await prisma.label.findFirst({
    where: { name: { equals: labelName, mode: 'insensitive' } },
  });

  if (!label) return null;

  const existing = await prisma.option.findFirst({
    where: {
      labelId: label.id,
      name: { equals: trimmed, mode: 'insensitive' },
    },
  });

  if (existing) return existing.id;

  const created = await prisma.option.create({
    data: { name: trimmed, labelId: label.id },
  });

  return created.id;
}

async function parseOptionIds(
  labelName: string,
  values: string | undefined,
): Promise<string[]> {
  if (!values?.trim()) return [];
  const parts = values.split(';').map((s) => s.trim()).filter(Boolean);
  const ids: string[] = [];
  for (const part of parts) {
    const id = await findOrCreateOption(labelName, part);
    if (id) ids.push(id);
  }
  return ids;
}

function parseDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return Math.max(0, Math.floor(value));
  if (typeof value === 'string') {
    const n = parseInt(value.replace(/,/g, ''), 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }
  return 0;
}

export async function importActivities(rows: ImportActivityRow[]) {
  if (!rows || rows.length === 0) {
    return { success: false, error: 'No data to import', imported: 0 };
  }

  let imported = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (!row.activityName?.trim()) {
      errors.push(`Row ${rowNum}: Activity name is required`);
      continue;
    }

    try {
      const [
        bureauOptionId,
        projectOptionId,
        districtOptionId,
        municipalityOptionId,
        requestingAgencyId,
        modeOfImplementationId,
        statusId,
        targetSectorIds,
        responsiblePersonIds,
      ] = await Promise.all([
        parseOptionIds('bureau', row.bureau),
        parseOptionIds('project', row.project),
        parseOptionIds('district', row.district),
        parseOptionIds('municipality', row.municipality),
        parseOptionIds('requesting agency', row.requestingAgency),
        parseOptionIds('mode of implementation', row.modeOfImplementation),
        parseOptionIds('status', row.status),
        parseOptionIds('target sector', row.targetSectors),
        parseOptionIds('responsible person', row.responsiblePersons),
      ]);

      const dateFrom = parseDate(row.dateFrom);
      const dateTo = parseDate(row.dateTo);
      const femaleCount = parseNumber(row.femaleCount);
      const maleCount = parseNumber(row.maleCount);
      const totalCount =
        row.totalCount !== undefined && row.totalCount !== null
          ? parseNumber(row.totalCount)
          : femaleCount + maleCount;

      const indicators = row.indicators
        ? row.indicators.split(';').map((s) => s.trim()).filter(Boolean)
        : [];

      await prisma.activity.create({
        data: {
          activityName: row.activityName.trim(),
          activityVenue: row.activityVenue?.trim() || null,
          barangay: row.barangay?.trim() || null,
          dateFrom,
          dateTo,
          femaleCount,
          maleCount,
          totalCount,
          bureauOptionId: bureauOptionId[0] || null,
          projectOptionId: projectOptionId[0] || null,
          districtOptionId: districtOptionId[0] || null,
          municipalityOptionId: municipalityOptionId[0] || null,
          requestingAgencyId: requestingAgencyId[0] || null,
          modeOfImplementationId: modeOfImplementationId[0] || null,
          statusId: statusId[0] || null,
          indicators: {
            create: indicators.map((name) => ({ name })),
          },
          targetSectors: {
            create: targetSectorIds.map((optionId) => ({ optionId })),
          },
          responsiblePersons: {
            create: responsiblePersonIds.map((optionId) => ({ optionId })),
          },
        },
      });

      imported++;
    } catch (error) {
      console.error(`Import row ${rowNum} error:`, error);
      errors.push(
        `Row ${rowNum}: ${error instanceof Error ? error.message : 'Failed to import'}`,
      );
    }
  }

  revalidatePath('/');

  if (errors.length > 0 && imported === 0) {
    return {
      success: false,
      error: `All rows failed:\n${errors.slice(0, 5).join('\n')}`,
      imported: 0,
    };
  }

  return {
    success: imported > 0,
    imported,
    errors: errors.length > 0 ? errors : undefined,
    error:
      errors.length > 0
        ? `${errors.length} row(s) failed to import`
        : undefined,
  };
}
