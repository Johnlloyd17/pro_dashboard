"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface TargetInput {
  name: string;
  value: number;
  semester: string;
  bureauOptionId: string;
  projectOptionId?: string;
}

export async function addTargets(targets: TargetInput[]) {
  const validTargets = targets.filter(
    (t) => t.name.trim() && t.bureauOptionId && !isNaN(t.value),
  );

  if (validTargets.length === 0) {
    return { success: false, error: "At least one valid target is required" };
  }

  try {
    await prisma.target.createMany({
      data: validTargets.map((t) => ({
        name: t.name,
        value: t.value,
        semester: t.semester,
        bureauOptionId: t.bureauOptionId,
        projectOptionId: t.projectOptionId || null,
      })),
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("addTargets error:", error);
    return { success: false, error: "Failed to save targets" };
  }
}

export async function getTargets(bureauName?: string) {
  return prisma.target.findMany({
    where: bureauName
      ? {
          bureau: {
            name: { equals: bureauName, mode: "insensitive" },
          },
        }
      : undefined,
    include: { bureau: true, project: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteTarget(id: string) {
  try {
    await prisma.target.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete target" };
  }
}
