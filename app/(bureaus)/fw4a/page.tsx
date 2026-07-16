import { getFw4aRecords, getFw4aRecordStats, getFw4aRecordFilterOptions } from '@/app/actions/fw4a-actions';
import { OverviewStatCards } from '@/components/overview-stat-cards';
import Fw4aRecordsTable from '@/components/fw4a-records-table';
import {
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Suspense } from 'react';

export default async function Fw4aPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    stat?: string;
    pageSize?: string;
    locality?: string;
    district?: string;
    siteType?: string;
    status?: string;
    strategy?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? '';
  const pageSize = Number(params.pageSize) || 10;

  const filters = {
    locality: params.locality,
    district: params.district,
    siteType: params.siteType,
    status: params.status,
    strategy: params.strategy,
  };

  const [stats, { records, totalPages, currentPage }, filterOptions] = await Promise.all([
    getFw4aRecordStats(),
    getFw4aRecords(page, search || undefined, params.stat, pageSize, filters),
    getFw4aRecordFilterOptions(),
  ]);

  const metricCards = [
    {
      id: 'lgu-penetration',
      title: 'LGU Penetration Rate',
      value: `${stats.lguPenetration}%`,
      description: 'Total No. Barangays with Access Point / Total Barangay Count x 100%',
    },
    {
      id: 'barangay-penetration',
      title: 'Barangay Penetration Rate',
      value: `${stats.barangayPenetration}%`,
      description: 'Total No. of Barangays with Access Point / Total No. of Barangays in SDN',
    },
    {
      id: 'active-accesspoints',
      title: 'Active Access Points',
      value: stats.activeSites,
      description: 'Currently operational FW4A access points.',
    },
    {
      id: 'inactive-accesspoints',
      title: 'Inactive Access Points',
      value: stats.inactiveSites,
      description: 'Access points currently offline or under maintenance.',
    },
  ];

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-row justify-between items-end'>
        <div>
          <CardTitle className='text-xl'>FW4A Records</CardTitle>
          <CardDescription>
            Manage and track all FW4A site records, connectivity, and access points.
          </CardDescription>
        </div>
      </div>
      <Suspense>
        <OverviewStatCards topRow={metricCards} bottomRow={[]} />
      </Suspense>
      <Fw4aRecordsTable
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
