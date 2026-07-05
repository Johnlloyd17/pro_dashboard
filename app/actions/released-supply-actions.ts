"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const PAGE_SIZE = 10;

export async function releaseSupply(input: {
  supplyId: string;
  releasedQuantity: number;
  requesteeName: string;
  releasedDate?: Date;
}) {
  if (
    !input.supplyId ||
    input.releasedQuantity <= 0 ||
    !input.requesteeName.trim()
  ) {
    return { success: false, error: "All fields are required" };
  }

  try {
    const supply = await prisma.supply.findUnique({
      where: { id: input.supplyId },
    });

    if (!supply) {
      return { success: false, error: "Supply not found" };
    }

    if (supply.stockQuantity < input.releasedQuantity) {
      return { success: false, error: "Not enough stock available" };
    }

    await prisma.$transaction([
      prisma.releasedSupply.create({
        data: {
          supplyId: input.supplyId,
          releasedQuantity: input.releasedQuantity,
          requesteeName: input.requesteeName,
          releasedDate: input.releasedDate ?? new Date(),
        },
      }),
      prisma.supply.update({
        where: { id: input.supplyId },
        data: { stockQuantity: { decrement: input.releasedQuantity } },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("releaseSupply error:", error);
    return { success: false, error: "Failed to release supply" };
  }
}

export async function getReleasedSupplies(search?: string, page: number = 1) {
  const where = search
    ? {
        OR: [
          {
            supply: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          { requesteeName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [releases, totalCount] = await Promise.all([
    prisma.releasedSupply.findMany({
      where,
      include: { supply: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.releasedSupply.count({ where }),
  ]);

  return {
    releases,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}

export async function deleteReleasedSupply(id: string) {
  try {
    const release = await prisma.releasedSupply.findUnique({ where: { id } });
    if (!release) {
      return { success: false, error: "Record not found" };
    }

    // Restore the stock quantity back to Supply when a release record is deleted
    await prisma.$transaction([
      prisma.releasedSupply.delete({ where: { id } }),
      prisma.supply.update({
        where: { id: release.supplyId },
        data: { stockQuantity: { increment: release.releasedQuantity } },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("deleteReleasedSupply error:", error);
    return { success: false, error: "Failed to delete release record" };
  }
}
