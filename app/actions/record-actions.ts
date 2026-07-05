import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

interface RecordItem {
  id: string;
  time: Date;
  description: string;
}

export async function getSupplyRecords(page: number = 1) {
  // Pull recent supplies and releases; combine and sort by time
  const [supplies, releases] = await Promise.all([
    prisma.supply.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // reasonable cap before combining/sorting
    }),
    prisma.releasedSupply.findMany({
      orderBy: { createdAt: "desc" },
      include: { supply: true },
      take: 100,
    }),
  ]);

  const supplyRecords: RecordItem[] = supplies.map((s) => ({
    id: `supply-${s.id}`,
    time: s.createdAt,
    description: `Added supply "${s.name}" with stock quantity ${s.stockQuantity}.`,
  }));

  const releaseRecords: RecordItem[] = releases.map((r) => ({
    id: `release-${r.id}`,
    time: r.createdAt,
    description: `Released ${r.releasedQuantity} unit(s) of "${r.supply.name}" to ${r.requesteeName}.`,
  }));

  const allRecords = [...supplyRecords, ...releaseRecords].sort(
    (a, b) => b.time.getTime() - a.time.getTime(),
  );

  const totalCount = allRecords.length;
  const start = (page - 1) * PAGE_SIZE;
  const paginatedRecords = allRecords.slice(start, start + PAGE_SIZE);

  return {
    records: paginatedRecords,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    currentPage: page,
  };
}
