import { getPropertyRecords, getPropertyRecordStats, getPropertyRecordFilterOptions } from '@/app/actions/property-actions';
import { OverviewStatCards } from '@/components/overview-stat-cards';
import PropertyRecordsTable from '@/components/property-records-table';
import {
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Suspense } from 'react';

export default async function PropertyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    stat?: string;
    pageSize?: string;
    project?: string;
    icsParNumber?: string;
    year?: string;
    remarks?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? '';
  const pageSize = Number(params.pageSize) || 10;

  const filters = {
    project: params.project,
    icsParNumber: params.icsParNumber,
    year: params.year,
    remarks: params.remarks,
  };

  const [stats, { records, totalPages, currentPage }, filterOptions] = await Promise.all([
    getPropertyRecordStats(),
    getPropertyRecords(page, search || undefined, params.stat, pageSize, filters),
    getPropertyRecordFilterOptions(),
  ]);

  const metricCards = [
    {
      id: 'total-records',
      title: 'Total Records',
      value: stats.totalRecords,
      description: 'All property records tracked.',
    },
    {
      id: 'total-items',
      title: 'Total Items',
      value: stats.totalItems,
      description: 'Combined quantity across all records.',
    },
    {
      id: 'total-value',
      title: 'Total Value',
      value: `₱${stats.totalValue.toLocaleString()}`,
      description: 'Total estimated cost of all properties.',
    },
  ];

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-row justify-between items-end'>
        <div>
          <CardTitle className='text-xl'>Property Records</CardTitle>
          <CardDescription>
            Manage and track all property records, equipment, and assets.
          </CardDescription>
        </div>
      </div>
      <Suspense>
        <OverviewStatCards topRow={metricCards} bottomRow={[]} />
      </Suspense>
      <PropertyRecordsTable
        records={records}
        currentPage={currentPage}
        totalPages={totalPages}
        currentSearch={search}
        currentPageSize={pageSize}
        filterOptions={filterOptions}
        currentFilters={filters}
      />
    </main>
  );
}
