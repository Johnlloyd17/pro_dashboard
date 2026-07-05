"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addOption(
  labelId: string,
  name: string,
  relatedOptionIds: string[],
) {
  if (!name.trim()) {
    return { success: false, error: "Option name is required" };
  }

  try {
    const option = await prisma.option.create({
      data: {
        name,
        labelId,
        relationsFrom: {
          create: relatedOptionIds
            .filter((id) => id.trim() !== "")
            .map((relatedOptionId) => ({ relatedOptionId })),
        },
      },
      include: { relationsFrom: { include: { relatedOption: true } } },
    });

    revalidatePath("/");
    return { success: true, option };
  } catch (error) {
    console.error("addOption error:", error);
    return { success: false, error: "Failed to add option" };
  }
}

export async function getAllOptions(labelId: string, excludeId?: string) {
  return prisma.option.findMany({
    where: {
      labelId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getOptionsGroupedByLabel(excludeLabelId?: string) {
  return prisma.label.findMany({
    where: excludeLabelId ? { id: { not: excludeLabelId } } : undefined,
    select: {
      id: true,
      name: true,
      options: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getRelatedOptions(optionId: string) {
  if (!optionId) return [];

  const relations = await prisma.optionRelation.findMany({
    where: {
      OR: [{ optionId }, { relatedOptionId: optionId }],
    },
    include: {
      option: true,
      relatedOption: true,
    },
  });

  // Return whichever side of each relation isn't the one we searched for
  return relations.map((r) =>
    r.optionId === optionId ? r.relatedOption : r.option,
  );
}

export async function deleteOption(id: string) {
  try {
    await prisma.option.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete option" };
  }
}
