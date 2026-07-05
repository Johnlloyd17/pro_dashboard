"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AddActivityInput {
  activityName: string;
  activityVenue?: string;
  indicator?: string;
  barangay?: string;
  dateFrom?: Date;
  dateTo?: Date;
  femaleCount: number;
  maleCount: number;
  totalCount: number;
  bureauOptionId?: string;
  projectOptionId?: string;
  districtOptionId?: string;
  municipalityOptionId?: string;
  requestingAgencyId?: string;
  modeOfImplementationId?: string;
  statusId?: string;
  selectedTargetSectors: string[];
  selectedResponsiblePerson: string[];
}

export async function addActivity(input: AddActivityInput) {
  if (!input.activityName.trim()) {
    return { success: false, error: "Activity name is required" };
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        activityName: input.activityName,
        activityVenue: input.activityVenue || null,
        indicator: input.indicator || null,
        barangay: input.barangay || null,
        dateFrom: input.dateFrom ?? null,
        dateTo: input.dateTo ?? null,
        femaleCount: input.femaleCount,
        maleCount: input.maleCount,
        totalCount: input.totalCount,
        bureauOptionId: input.bureauOptionId || null,
        projectOptionId: input.projectOptionId || null,
        districtOptionId: input.districtOptionId || null,
        municipalityOptionId: input.municipalityOptionId || null,
        requestingAgencyId: input.requestingAgencyId || null,
        modeOfImplementationId: input.modeOfImplementationId || null,
        statusId: input.statusId || null,
        targetSectors: {
          create: input.selectedTargetSectors.map((optionId) => ({ optionId })),
        },
        responsiblePersons: {
          create: input.selectedResponsiblePerson.map((optionId) => ({
            optionId,
          })),
        },
      },
    });

    revalidatePath("/");
    return { success: true, activity };
  } catch (error) {
    console.error("addActivity error:", error);
    return { success: false, error: "Failed to save activity" };
  }
}

const PAGE_SIZE = 10;

export async function getActivities(bureauName?: string, page: number = 1) {
  const where = bureauName
    ? {
        bureau: {
          name: { equals: bureauName, mode: "insensitive" as const },
        },
      }
    : undefined;

  const [activities, totalCount] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        bureau: true,
        project: true,
        district: true,
        municipality: true,
        requestingAgency: true,
        modeOfImplementation: true,
        status: true,
        targetSectors: { include: { option: true } },
        responsiblePersons: { include: { option: true } },
      },
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    activities,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export async function deleteActivity(id: string) {
  try {
    await prisma.activity.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("deleteActivity error:", error);
    return { success: false, error: "Failed to delete activity" };
  }
}

export async function getActivityStats(bureauName: string) {
  const where = {
    bureau: {
      name: { equals: bureauName, mode: "insensitive" as const },
    },
  };

  const [completedCount, upcomingCount, participantsResult] = await Promise.all(
    [
      prisma.activity.count({
        where: {
          ...where,
          status: {
            name: { equals: "Completed", mode: "insensitive" },
          },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          dateFrom: { gt: new Date() },
        },
      }),
      prisma.activity.aggregate({
        where,
        _sum: { totalCount: true },
      }),
    ],
  );

  return {
    completedCount,
    upcomingCount,
    totalParticipants: participantsResult._sum.totalCount ?? 0,
  };
}

const DISTRICT_1_MUNICIPALITIES = [
  "Burgos",
  "Dapa",
  "Del Carmen",
  "General Luna",
  "Pilar",
  "San Benito",
  "San Isidro",
  "Santa Monica",
  "Socorro",
];

const DISTRICT_2_MUNICIPALITIES = [
  "Alegria",
  "Bacuag",
  "Claver",
  "Gigaquit",
  "Mainit",
  "Malimono",
  "Placer",
  "San Francisco",
  "Surigao City",
  "Sison",
  "Tagana-an",
  "Tubod",
];

export async function getCompletedActivitiesByMunicipality(bureauName: string) {
  const completedActivities = await prisma.activity.findMany({
    where: {
      bureau: { name: { equals: bureauName, mode: "insensitive" } },
      status: { name: { equals: "Completed", mode: "insensitive" } },
    },
    include: {
      municipality: true,
      project: true,
    },
  });

  // municipality name -> project name -> count
  const dataByMunicipality = new Map<string, Map<string, number>>();

  for (const activity of completedActivities) {
    const municipalityName = activity.municipality?.name;
    const projectName = activity.project?.name;
    if (!municipalityName || !projectName) continue;

    const projectCounts =
      dataByMunicipality.get(municipalityName) ?? new Map<string, number>();
    projectCounts.set(projectName, (projectCounts.get(projectName) ?? 0) + 1);
    dataByMunicipality.set(municipalityName, projectCounts);
  }

  const buildList = (names: string[]) =>
    names.map((name) => {
      const projectCounts = dataByMunicipality.get(name);
      const projects = projectCounts
        ? Array.from(projectCounts.entries()).map(([projectName, count]) => ({
            projectName,
            count,
          }))
        : [];

      const totalCount = projects.reduce((sum, p) => sum + p.count, 0);

      return {
        municipality: name,
        count: totalCount,
        projects,
      };
    });

  return {
    district1: buildList(DISTRICT_1_MUNICIPALITIES),
    district2: buildList(DISTRICT_2_MUNICIPALITIES),
  };
}

export async function getGenderDemographics(
  bureauName: string,
): Promise<{ gender: "Female" | "Male"; count: number }[]> {
  const activities = await prisma.activity.findMany({
    where: {
      bureau: { name: { equals: bureauName, mode: "insensitive" } },
    },
    select: {
      femaleCount: true,
      maleCount: true,
    },
  });

  const totalFemale = activities.reduce((sum, a) => sum + a.femaleCount, 0);
  const totalMale = activities.reduce((sum, a) => sum + a.maleCount, 0);

  return [
    { gender: "Female", count: totalFemale },
    { gender: "Male", count: totalMale },
  ];
}

export async function getModeOfImplementationBreakdown(bureauName: string) {
  const activities = await prisma.activity.findMany({
    where: {
      bureau: { name: { equals: bureauName, mode: "insensitive" } },
    },
    include: {
      modeOfImplementation: true,
    },
  });

  const countByMode = new Map<string, number>();
  for (const activity of activities) {
    const modeName = activity.modeOfImplementation?.name;
    if (!modeName) continue;
    countByMode.set(modeName, (countByMode.get(modeName) ?? 0) + 1);
  }

  return Array.from(countByMode.entries()).map(([mode, count]) => ({
    mode,
    count,
  }));
}

function getSemesterDateRange(semester: string, year: number) {
  if (semester === "1st") {
    return {
      start: new Date(year, 0, 1), // Jan 1
      end: new Date(year, 5, 30, 23, 59, 59), // Jun 30
    };
  }
  return {
    start: new Date(year, 6, 1), // Jul 1
    end: new Date(year, 11, 31, 23, 59, 59), // Dec 31
  };
}

export async function getTargetAccomplishments(bureauName: string) {
  const targets = await prisma.target.findMany({
    where: {
      bureau: { name: { equals: bureauName, mode: "insensitive" } },
    },
    include: { bureau: true, project: true },
  });

  const currentYear = new Date().getFullYear();

  const results = await Promise.all(
    targets.map(async (target) => {
      const { start, end } = getSemesterDateRange(target.semester, currentYear);

      const accomplished = await prisma.activity.count({
        where: {
          bureau: { name: { equals: bureauName, mode: "insensitive" } },
          ...(target.projectOptionId
            ? { projectOptionId: target.projectOptionId }
            : {}),
          status: { name: { equals: "Completed", mode: "insensitive" } },
          dateFrom: { gte: start, lte: end },
        },
      });

      return {
        indicator: target.name,
        semester: target.semester,
        target: target.value,
        accomplished,
        projectName: target.project?.name ?? null,
      };
    }),
  );

  return results;
}
interface UpdateActivityInput {
  id: string;
  activityName: string;
  activityVenue?: string;
  indicator?: string;
  barangay?: string;
  dateFrom?: Date;
  dateTo?: Date;
  femaleCount: number;
  maleCount: number;
  totalCount: number;
  bureauOptionId?: string;
  projectOptionId?: string;
  districtOptionId?: string;
  municipalityOptionId?: string;
  requestingAgencyId?: string;
  modeOfImplementationId?: string;
  statusId?: string;
  selectedTargetSectors: string[];
  selectedResponsiblePerson: string[];
}

export async function updateActivity(input: UpdateActivityInput) {
  if (!input.activityName.trim()) {
    return { success: false, error: "Activity name is required" };
  }

  try {
    await prisma.$transaction([
      // Clear existing many-to-many rows so we can replace them cleanly
      prisma.activityTargetSector.deleteMany({
        where: { activityId: input.id },
      }),
      prisma.activityResponsiblePerson.deleteMany({
        where: { activityId: input.id },
      }),
      prisma.activity.update({
        where: { id: input.id },
        data: {
          activityName: input.activityName,
          activityVenue: input.activityVenue || null,
          indicator: input.indicator || null,
          barangay: input.barangay || null,
          dateFrom: input.dateFrom ?? null,
          dateTo: input.dateTo ?? null,
          femaleCount: input.femaleCount,
          maleCount: input.maleCount,
          totalCount: input.totalCount,
          bureauOptionId: input.bureauOptionId || null,
          projectOptionId: input.projectOptionId || null,
          districtOptionId: input.districtOptionId || null,
          municipalityOptionId: input.municipalityOptionId || null,
          requestingAgencyId: input.requestingAgencyId || null,
          modeOfImplementationId: input.modeOfImplementationId || null,
          statusId: input.statusId || null,
          targetSectors: {
            create: input.selectedTargetSectors.map((optionId) => ({
              optionId,
            })),
          },
          responsiblePersons: {
            create: input.selectedResponsiblePerson.map((optionId) => ({
              optionId,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("updateActivity error:", error);
    return { success: false, error: "Failed to update activity" };
  }
}

export async function getActivityById(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      bureau: true,
      project: true,
      district: true,
      municipality: true,
      requestingAgency: true,
      modeOfImplementation: true,
      status: true,
      targetSectors: { include: { option: true } },
      responsiblePersons: { include: { option: true } },
    },
  });
}

export async function getOverallTargetAchievementRate(bureauName: string) {
  const targetData = await getTargetAccomplishments(bureauName);

  if (targetData.length === 0) {
    return null;
  }

  const totalTarget = targetData.reduce((sum, t) => sum + t.target, 0);
  const totalAccomplished = targetData.reduce(
    (sum, t) => sum + t.accomplished,
    0,
  );

  if (totalTarget === 0) return null;

  return Math.round((totalAccomplished / totalTarget) * 100);
}
