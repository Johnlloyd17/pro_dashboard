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
import { Button } from './ui/button';
import { Import } from 'lucide-react';
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

export async function DataTableProjects({
  bureauName,
  searchParams,
}: DataTableProjectsProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const [{ activities, totalPages }, filterOptions] = await Promise.all([
    getActivities(
      bureauName,
      currentPage,
      searchParams?.year,
      searchParams?.semester,
      {
        sort: searchParams?.sort,
        project: searchParams?.project,
        district: searchParams?.district,
        mode: searchParams?.mode,
        status: searchParams?.status,
        month: searchParams?.month,
      },
    ),
    getActivityFilterOptions(bureauName),
  ]);

  return (
    <ActivitySelectionProvider>
      <div className='flex flex-col gap-3 w-full min-w-0'>
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
            <Button variant='outline'>
              <Import className='h-4 w-4' /> Import Data
            </Button>
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
