"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addLabel(name: string) {
  if (!name.trim()) {
    throw new Error("Label name is required");
  }

  const label = await prisma.label.create({
    data: { name },
  });

  revalidatePath("/");
  return label;
}

export async function getLabels() {
  return prisma.label.findMany({
    orderBy: { name: "asc" },
    include: {
      options: {
        include: {
          relationsFrom: { include: { relatedOption: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  });
}
export async function updateLabel(id: string, name: string) {
  if (!name.trim()) {
    return { success: false, error: "Label name is required" };
  }

  try {
    await prisma.label.update({ where: { id }, data: { name } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update label" };
  }
}

export async function deleteLabel(id: string) {
  try {
    await prisma.label.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete label" };
  }
}
