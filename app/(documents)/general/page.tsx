import ProcurementTable from '@/components/procurement-table';
import {
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { OverviewStatCards } from '@/components/overview-stat-cards';
import { ProcurementRecord } from '@/lib/types';

const mockRecords: ProcurementRecord[] = [
  {
    id: '1',
    prNo: 'PR-2026-001',
    activityId: 'ACT-001',
    activityName: 'Cybersecurity Awareness Training',
    linkToFile: null,
    projectFundSource: 'GAA 2026',
    typeOfItemsProcured: 'Office Supplies',
    amount: 45000,
    nameOfSupplier: 'ABC Trading Corp.',
    joPo: 'JO-2026-045',
    linkToAttachments: null,
    personnelInCharge: 'Juan Dela Cruz',
    dateForwardedToRo: new Date('2026-03-15'),
    transmittalReport: 'TR-001',
    paymentStatus: 'Paid',
    remarks: null,
    createdAt: new Date('2026-01-10'),
  },
  {
    id: '2',
    prNo: 'PR-2026-002',
    activityId: 'ACT-002',
    activityName: 'Network Infrastructure Upgrade',
    linkToFile: null,
    projectFundSource: 'Cybersecurity Fund',
    typeOfItemsProcured: 'ICT Equipment',
    amount: 250000,
    nameOfSupplier: 'Tech Solutions Inc.',
    joPo: 'PO-2026-012',
    linkToAttachments: null,
    personnelInCharge: 'Maria Santos',
    dateForwardedToRo: new Date('2026-04-20'),
    transmittalReport: 'TR-002',
    paymentStatus: 'Processing',
    remarks: 'Awaiting delivery',
    createdAt: new Date('2026-02-05'),
  },
  {
    id: '3',
    prNo: 'PR-2026-003',
    activityId: 'ACT-003',
    activityName: 'ELGU Site Maintenance',
    linkToFile: null,
    projectFundSource: 'ELGU Budget',
    typeOfItemsProcured: 'Maintenance Supplies',
    amount: 12500,
    nameOfSupplier: 'XYZ Hardware',
    joPo: 'JO-2026-050',
    linkToAttachments: null,
    personnelInCharge: 'Jose Reyes',
    dateForwardedToRo: new Date('2026-05-10'),
    transmittalReport: 'TR-003',
    paymentStatus: 'Pending',
    remarks: 'For approval',
    createdAt: new Date('2026-03-01'),
  },
  {
    id: '4',
    prNo: 'PR-2026-004',
    activityId: 'ACT-004',
    activityName: 'FW4A Field Operations',
    linkToFile: null,
    projectFundSource: 'FW4A Fund',
    typeOfItemsProcured: 'Field Equipment',
    amount: 78000,
    nameOfSupplier: 'Outdoor Pro Supply',
    joPo: 'PO-2026-018',
    linkToAttachments: null,
    personnelInCharge: 'Ana Gonzales',
    dateForwardedToRo: new Date('2026-06-01'),
    transmittalReport: 'TR-004',
    paymentStatus: 'Paid',
    remarks: null,
    createdAt: new Date('2026-04-15'),
  },
  {
    id: '5',
    prNo: 'PR-2026-005',
    activityId: 'ACT-005',
    activityName: 'GOVNET Maintenance Contract',
    linkToFile: null,
    projectFundSource: 'GOVNET Budget',
    typeOfItemsProcured: 'Services',
    amount: 150000,
    nameOfSupplier: 'NetConnect Services',
    joPo: 'PO-2026-022',
    linkToAttachments: null,
    personnelInCharge: 'Pedro Mendoza',
    dateForwardedToRo: null,
    transmittalReport: null,
    paymentStatus: 'For Approval',
    remarks: 'Initial assessment',
    createdAt: new Date('2026-05-20'),
  },
];

const filterOptions = {
  fundSources: ['GAA 2026', 'Cybersecurity Fund', 'ELGU Budget', 'FW4A Fund', 'GOVNET Budget'],
  itemTypes: ['Office Supplies', 'ICT Equipment', 'Maintenance Supplies', 'Field Equipment', 'Services'],
  paymentStatuses: ['Paid', 'Pending', 'Processing', 'For Approval', 'Cancelled'],
};

export default async function GeneralPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pageSize?: string;
    fundSource?: string;
    itemType?: string;
    paymentStatus?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search ?? '';
  const pageSize = Number(params.pageSize) || 10;

  const filters = {
    fundSource: params.fundSource,
    itemType: params.itemType,
    paymentStatus: params.paymentStatus,
  };

  let filtered = mockRecords;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.prNo?.toLowerCase().includes(q) ||
        r.activityName?.toLowerCase().includes(q) ||
        r.nameOfSupplier?.toLowerCase().includes(q) ||
        r.activityId?.toLowerCase().includes(q) ||
        r.personnelInCharge?.toLowerCase().includes(q),
    );
  }

  if (filters.fundSource && filters.fundSource !== 'all') {
    filtered = filtered.filter((r) => r.projectFundSource === filters.fundSource);
  }
  if (filters.itemType && filters.itemType !== 'all') {
    filtered = filtered.filter((r) => r.typeOfItemsProcured === filters.itemType);
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    filtered = filtered.filter((r) => r.paymentStatus === filters.paymentStatus);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalAmount = mockRecords.reduce((sum, r) => sum + r.amount, 0);
  const pendingPayments = mockRecords.filter(
    (r) => r.paymentStatus === 'Pending' || r.paymentStatus === 'For Approval',
  ).length;
  const completedPayments = mockRecords.filter(
    (r) => r.paymentStatus === 'Paid',
  ).length;

  const metricCards = [
    {
      id: 'total-records',
      title: 'Total Records',
      value: mockRecords.length,
      description: 'All procurement records tracked.',
    },
    {
      id: 'total-amount',
      title: 'Total Amount',
      value: `₱${totalAmount.toLocaleString()}`,
      description: 'Combined procurement value.',
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: pendingPayments,
      description: 'Records awaiting payment.',
    },
    {
      id: 'completed-payments',
      title: 'Completed Payments',
      value: completedPayments,
      description: 'Fully paid records.',
    },
  ];

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-row justify-between items-end'>
        <div>
          <CardTitle className='text-xl'>Procurement - General</CardTitle>
          <CardDescription>
            Track and manage all procurement activities, purchase orders, and payment status.
          </CardDescription>
        </div>
      </div>
      <OverviewStatCards topRow={metricCards} bottomRow={[]} />
      <ProcurementTable
        records={paginated}
        currentPage={page}
        totalPages={totalPages}
        currentSearch={search}
        currentPageSize={pageSize}
        filterOptions={filterOptions}
        currentFilters={filters}
      />
    </main>
  );
}
