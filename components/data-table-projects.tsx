import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { PaginationComponent } from './pagination';
import AddDialog from './add-dialog';
import ImportDialog from './import-dialog';
import { Badge } from './ui/badge';
import {
  getActivities,
  getActivityFilterOptions,
} from '@/app/actions/activity-actions';
import { FilterableHead, SortableDateHead } from './data-table-header-controls';
import { format } from 'date-fns';
import { DataTableProjectsProps } from '@/lib/types';
import { getBadgeColor, getStatusBadgeColor } from '@/lib/badge-colors';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CardDescription } from './ui/card';
import { ActivityDetailsSheet } from './activity-details-sheet';
import {
  ActivityRowCheckbox,
  ActivitySelectAllCheckbox,
  ActivitySelectionBar,
  ActivitySelectionProvider,
} from './activity-selection';
import { DataTableToolbar } from './data-table-toolbar';

const sampleActivities = [
  {
    id: 'sample-001-0000-0000-000000000001',
    activityName: 'Cybersecurity Awareness Training for LGU Staff',
    activityVenue: 'Provincial Capitol Hall',
    dateFrom: new Date('2026-01-15'),
    dateTo: new Date('2026-01-15'),
    barangay: 'Poblacion',
    femaleCount: 45,
    maleCount: 35,
    totalCount: 80,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '1', name: 'District 1' },
    municipality: { id: '1', name: 'Dipolog City' },
    requestingAgency: { id: '1', name: 'Provincial Government' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '1', name: 'Completed' },
    targetSectors: [{ option: { id: '1', name: 'Government Employees' } }],
    responsiblePersons: [{ option: { id: '1', name: 'Juan Dela Cruz' } }],
    indicators: [{ id: '1', name: 'Number of trained individuals' }],
  },
  {
    id: 'sample-002-0000-0000-000000000002',
    activityName: 'Phishing Simulation Exercise',
    activityVenue: 'Online Platform',
    dateFrom: new Date('2026-02-10'),
    dateTo: new Date('2026-02-10'),
    barangay: null,
    femaleCount: 30,
    maleCount: 20,
    totalCount: 50,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '2', name: 'District 2' },
    municipality: { id: '2', name: 'Dapitan City' },
    requestingAgency: { id: '2', name: 'City Government' },
    modeOfImplementation: { id: '2', name: 'Virtual' },
    status: { id: '1', name: 'Completed' },
    targetSectors: [{ option: { id: '2', name: 'Students' } }],
    responsiblePersons: [{ option: { id: '2', name: 'Maria Santos' } }],
    indicators: [{ id: '2', name: 'Number of participants' }],
  },
  {
    id: 'sample-003-0000-0000-000000000003',
    activityName: 'Data Privacy Workshop',
    activityVenue: 'Municipal Hall',
    dateFrom: new Date('2026-02-20'),
    dateTo: new Date('2026-02-21'),
    barangay: 'San Jose',
    femaleCount: 25,
    maleCount: 15,
    totalCount: 40,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '2', name: 'PNPKI' },
    district: { id: '1', name: 'District 1' },
    municipality: { id: '3', name: 'Polanco' },
    requestingAgency: { id: '3', name: 'Municipal Government' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '1', name: 'Completed' },
    targetSectors: [{ option: { id: '3', name: 'Local Officials' } }],
    responsiblePersons: [{ option: { id: '3', name: 'Jose Reyes' } }],
    indicators: [{ id: '3', name: 'Number of workshops conducted' }],
  },
  {
    id: 'sample-004-0000-0000-000000000004',
    activityName: 'Network Security Assessment',
    activityVenue: 'Provincial IT Center',
    dateFrom: new Date('2026-03-05'),
    dateTo: new Date('2026-03-05'),
    barangay: 'Central',
    femaleCount: 10,
    maleCount: 20,
    totalCount: 30,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '2', name: 'District 2' },
    municipality: { id: '1', name: 'Dipolog City' },
    requestingAgency: { id: '4', name: 'Provincial IT Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '1', name: 'Completed' },
    targetSectors: [{ option: { id: '4', name: 'IT Personnel' } }],
    responsiblePersons: [{ option: { id: '4', name: 'Pedro Garcia' } }],
    indicators: [{ id: '4', name: 'Number of systems assessed' }],
  },
  {
    id: 'sample-005-0000-0000-000000000005',
    activityName: 'Incident Response Drill',
    activityVenue: 'Emergency Operations Center',
    dateFrom: new Date('2026-03-15'),
    dateTo: new Date('2026-03-15'),
    barangay: 'Magsaysay',
    femaleCount: 15,
    maleCount: 25,
    totalCount: 40,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '2', name: 'PNPKI' },
    district: { id: '1', name: 'District 1' },
    municipality: { id: '4', name: 'Sindangan' },
    requestingAgency: { id: '5', name: 'Provincial Disaster Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '2', name: 'In Progress' },
    targetSectors: [{ option: { id: '5', name: 'Emergency Responders' } }],
    responsiblePersons: [{ option: { id: '5', name: 'Ana Torres' } }],
    indicators: [{ id: '5', name: 'Number of drills conducted' }],
  },
  {
    id: 'sample-006-0000-0000-000000000006',
    activityName: 'Secure Coding Seminar',
    activityVenue: 'IT Training Room',
    dateFrom: new Date('2026-04-01'),
    dateTo: new Date('2026-04-02'),
    barangay: 'Libuton',
    femaleCount: 20,
    maleCount: 30,
    totalCount: 50,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '2', name: 'District 2' },
    municipality: { id: '5', name: 'Katipunan' },
    requestingAgency: { id: '6', name: 'Provincial Planning Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '3', name: 'Scheduled' },
    targetSectors: [{ option: { id: '6', name: 'Developers' } }],
    responsiblePersons: [{ option: { id: '6', name: 'Carlos Mendoza' } }],
    indicators: [{ id: '6', name: 'Number of seminars conducted' }],
  },
  {
    id: 'sample-007-0000-0000-000000000007',
    activityName: 'Mobile Device Security Training',
    activityVenue: 'Conference Room',
    dateFrom: new Date('2026-04-10'),
    dateTo: new Date('2026-04-10'),
    barangay: 'Talisay',
    femaleCount: 35,
    maleCount: 25,
    totalCount: 60,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '2', name: 'PNPKI' },
    district: { id: '1', name: 'District 1' },
    municipality: { id: '6', name: 'Manukan' },
    requestingAgency: { id: '7', name: 'Provincial HR Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '3', name: 'Scheduled' },
    targetSectors: [{ option: { id: '7', name: 'Government Employees' } }],
    responsiblePersons: [{ option: { id: '7', name: 'Luisa Bautista' } }],
    indicators: [{ id: '7', name: 'Number of participants' }],
  },
  {
    id: 'sample-008-0000-0000-000000000008',
    activityName: 'Cybersecurity Policy Review',
    activityVenue: 'Provincial Board Room',
    dateFrom: new Date('2026-04-20'),
    dateTo: new Date('2026-04-20'),
    barangay: 'Poblacion',
    femaleCount: 10,
    maleCount: 10,
    totalCount: 20,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '2', name: 'District 2' },
    municipality: { id: '7', name: 'José Dalman' },
    requestingAgency: { id: '8', name: 'Provincial Legal Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '3', name: 'Scheduled' },
    targetSectors: [{ option: { id: '8', name: 'Policy Makers' } }],
    responsiblePersons: [{ option: { id: '8', name: 'Ricardo Lim' } }],
    indicators: [{ id: '8', name: 'Number of policies reviewed' }],
  },
  {
    id: 'sample-009-0000-0000-000000000009',
    activityName: 'Digital Forensics Workshop',
    activityVenue: 'IT Laboratory',
    dateFrom: new Date('2026-05-05'),
    dateTo: new Date('2026-05-06'),
    barangay: 'Minaog',
    femaleCount: 12,
    maleCount: 18,
    totalCount: 30,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '2', name: 'PNPKI' },
    district: { id: '1', name: 'District 1' },
    municipality: { id: '8', name: 'Siayan' },
    requestingAgency: { id: '9', name: 'Provincial Justice Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '3', name: 'Scheduled' },
    targetSectors: [{ option: { id: '9', name: 'Investigators' } }],
    responsiblePersons: [{ option: { id: '9', name: 'Elena Cruz' } }],
    indicators: [{ id: '9', name: 'Number of workshops conducted' }],
  },
  {
    id: 'sample-010-0000-0000-000000000010',
    activityName: 'Critical Infrastructure Protection Seminar',
    activityVenue: 'Provincial Gymnasium',
    dateFrom: new Date('2026-05-15'),
    dateTo: new Date('2026-05-15'),
    barangay: 'Barra',
    femaleCount: 40,
    maleCount: 60,
    totalCount: 100,
    bureau: { id: '1', name: 'Cybersecurity' },
    project: { id: '1', name: 'CIESMD' },
    district: { id: '2', name: 'District 2' },
    municipality: { id: '9', name: 'Salug' },
    requestingAgency: { id: '10', name: 'Provincial Engineering Office' },
    modeOfImplementation: { id: '1', name: 'Face-to-Face' },
    status: { id: '3', name: 'Scheduled' },
    targetSectors: [{ option: { id: '10', name: 'Infrastructure Workers' } }],
    responsiblePersons: [{ option: { id: '10', name: 'Fernando Reyes' } }],
    indicators: [{ id: '10', name: 'Number of seminars conducted' }],
  },
];

export async function DataTableProjects({
  bureauName,
  searchParams,
}: DataTableProjectsProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const currentPageSize = Number(searchParams?.pageSize) || 10;
  const currentSearch = searchParams?.search || '';
  const [{ activities: dbActivities, totalPages: dbTotalPages, totalCount: dbTotalCount }, filterOptions] = await Promise.all([
    getActivities(
      bureauName,
      currentPage,
      searchParams?.year,
      searchParams?.semester,
      searchParams?.stat,
      {
        sort: searchParams?.sort,
        project: searchParams?.project,
        district: searchParams?.district,
        mode: searchParams?.mode,
        status: searchParams?.status,
        month: searchParams?.month,
        search: currentSearch || undefined,
        pageSize: currentPageSize,
      },
    ),
    getActivityFilterOptions(bureauName),
  ]);

  const useSampleData = dbActivities.length === 0 && bureauName === 'Cybersecurity';
  const activities = useSampleData ? sampleActivities.slice((currentPage - 1) * currentPageSize, currentPage * currentPageSize) : dbActivities;
  const totalPages = useSampleData ? Math.ceil(sampleActivities.length / currentPageSize) : dbTotalPages;
  const totalCount = useSampleData ? sampleActivities.length : dbTotalCount;

  return (
    <ActivitySelectionProvider>
      <div className='flex flex-col gap-3 w-full min-w-0'>
        <DataTableToolbar
          bureauName={bureauName}
          currentSearch={currentSearch}
          currentPageSize={currentPageSize}
          filterOptions={filterOptions}
          currentFilters={{
            project: searchParams?.project,
            district: searchParams?.district,
            mode: searchParams?.mode,
            status: searchParams?.status,
          }}
        />

        <div className='w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar'>
          <Table className='w-max min-w-full'>
            <TableHeader className='bg-muted'>
              <TableRow>
                <TableHead className='w-10'>
                  <ActivitySelectAllCheckbox
                    ids={activities.map((a) => a.id)}
                  />
                </TableHead>
                <TableHead className='w-25'>Activity ID</TableHead>
                <TableHead>
                  <SortableDateHead />
                </TableHead>
                <TableHead>Bureau</TableHead>
                <TableHead>
                  <FilterableHead
                    label='Project'
                    param='project'
                    options={filterOptions.projects}
                  />
                </TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead>Activity Name</TableHead>
                <TableHead>Activity Venue</TableHead>
                <TableHead>
                  <FilterableHead
                    label='District'
                    param='district'
                    options={filterOptions.districts}
                  />
                </TableHead>
                <TableHead>City/Municipality</TableHead>
                <TableHead>Barangay</TableHead>
                <TableHead>Requesting Agency</TableHead>
                <TableHead>
                  <FilterableHead
                    label='Mode of Implementation'
                    param='mode'
                    options={filterOptions.modes}
                  />
                </TableHead>
                <TableHead>Target Sector</TableHead>
                <TableHead>Responsible Person</TableHead>
                <TableHead>
                  <FilterableHead
                    label='Status'
                    param='status'
                    options={filterOptions.statuses}
                  />
                </TableHead>
                <TableHead>Female</TableHead>
                <TableHead>Male</TableHead>
                <TableHead className='text-right'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={19}
                    className='text-center text-muted-foreground py-8'
                  >
                    No activities yet. Click "Add Data" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <ActivityRowCheckbox activityId={activity.id} />
                    </TableCell>
                    <TableCell className='font-medium py-4'>
                      {activity.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className='w-40'>
                      {activity.dateFrom
                        ? activity.dateTo
                          ? `${format(activity.dateFrom, 'MMM d')} - ${format(activity.dateTo, 'MMM d, yyyy')}`
                          : format(activity.dateFrom, 'MMM d, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell className='w-36'>
                      {activity.bureau ? (
                        <Badge>{activity.bureau.name}</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='w-36'>
                      {activity.project ? (
                        <Badge
                          variant='outline'
                          className={getBadgeColor(activity.project.name)}
                        >
                          {activity.project.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='max-w-40'>
                      {activity.indicators.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='block truncate'>
                              {activity.indicators
                                .map((i) => i.name)
                                .join(', ')}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs grid grid-cols-1 dark:bg-neutral-800'>
                            {activity.indicators.map((i) => (
                              <CardDescription
                                key={i.id}
                                className='text-white '
                              >
                                {i.name}
                              </CardDescription>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='w-100'>
                      <ActivityDetailsSheet activity={activity} />
                    </TableCell>
                    <TableCell>{activity.activityVenue ?? '—'}</TableCell>
                    <TableCell>
                      {activity.district ? (
                        <Badge
                          variant='outline'
                          className={getBadgeColor(activity.district.name)}
                        >
                          {activity.district.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{activity.municipality?.name ?? '—'}</TableCell>
                    <TableCell>{activity.barangay ?? '—'}</TableCell>
                    <TableCell>
                      {activity.requestingAgency?.name ?? '—'}
                    </TableCell>
                    <TableCell>
                      {activity.modeOfImplementation ? (
                        <Badge
                          variant='outline'
                          className={getBadgeColor(
                            activity.modeOfImplementation.name,
                          )}
                        >
                          {activity.modeOfImplementation.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='max-w-40'>
                      <span className='block truncate'>
                        {activity.targetSectors.length > 0
                          ? activity.targetSectors
                              .map((t) => t.option.name)
                              .join(', ')
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell className='max-w-40'>
                      <span className='block truncate'>
                        {activity.responsiblePersons.length > 0
                          ? activity.responsiblePersons
                              .map((r) => r.option.name)
                              .join(', ')
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {activity.status ? (
                        <Badge
                          variant='outline'
                          className={getStatusBadgeColor(activity.status.name)}
                        >
                          {activity.status.name}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {activity.femaleCount}
                    </TableCell>
                    <TableCell className='text-right'>
                      {activity.maleCount}
                    </TableCell>
                    <TableCell className='text-right w-16'>
                      {activity.totalCount}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className='flex justify-between items-center w-full min-w-0'>
          <div className='flex flex-row items-center gap-2'>
            <AddDialog />
            <ImportDialog />
          </div>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>

        <ActivitySelectionBar />
      </div>
    </ActivitySelectionProvider>
  );
}
