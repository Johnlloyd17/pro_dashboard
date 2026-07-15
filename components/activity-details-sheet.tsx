'use client';

import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Badge } from './ui/badge';
import { getBadgeColor, getStatusBadgeColor } from '@/lib/badge-colors';
import type { getActivities } from '@/app/actions/activity-actions';

type ActivityItem = Awaited<
  ReturnType<typeof getActivities>
>['activities'][number];

interface ActivityDetailsSheetProps {
  activity: ActivityItem;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1 py-2.5 border-b last:border-b-0'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <div className='text-xs'>{children}</div>
    </div>
  );
}

export function ActivityDetailsSheet({ activity }: ActivityDetailsSheetProps) {
  const dateRange = activity.dateFrom
    ? activity.dateTo
      ? `${format(activity.dateFrom, 'MMM d, yyyy')} – ${format(activity.dateTo, 'MMM d, yyyy')}`
      : format(activity.dateFrom, 'MMM d, yyyy')
    : '—';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <span
          role='button'
          tabIndex={0}
          className='cursor-pointer text-primary font-medium hover:underline underline-offset-2'
        >
          {activity.activityName}
        </span>
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{activity.activityName}</SheetTitle>
          <SheetDescription>
            Activity ID: {activity.id.slice(0, 8)}
          </SheetDescription>
        </SheetHeader>

        <div className='flex flex-col px-4 pb-6'>
          <DetailRow label='Status'>
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
          </DetailRow>

          <DetailRow label='Date Range'>{dateRange}</DetailRow>

          <DetailRow label='Bureau'>
            {activity.bureau ? <Badge>{activity.bureau.name}</Badge> : '—'}
          </DetailRow>

          <DetailRow label='Project'>
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
          </DetailRow>

          <DetailRow label='Indicators'>
            {activity.indicators.length > 0 ? (
              <ul className='list-disc pl-4 space-y-1'>
                {activity.indicators.map((i) => (
                  <li key={i.id}>{i.name}</li>
                ))}
              </ul>
            ) : (
              '—'
            )}
          </DetailRow>

          <DetailRow label='Activity Venue'>
            {activity.activityVenue || '—'}
          </DetailRow>

          <DetailRow label='District'>
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
          </DetailRow>

          <DetailRow label='City/Municipality'>
            {activity.municipality?.name ?? '—'}
          </DetailRow>

          <DetailRow label='Barangay'>{activity.barangay || '—'}</DetailRow>

          <DetailRow label='Requesting Agency'>
            {activity.requestingAgency?.name ?? '—'}
          </DetailRow>

          <DetailRow label='Mode of Implementation'>
            {activity.modeOfImplementation ? (
              <Badge
                variant='outline'
                className={getBadgeColor(activity.modeOfImplementation.name)}
              >
                {activity.modeOfImplementation.name}
              </Badge>
            ) : (
              '—'
            )}
          </DetailRow>

          <DetailRow label='Target Sectors'>
            {activity.targetSectors.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {activity.targetSectors.map((t) => (
                  <Badge key={t.option.id} variant='secondary'>
                    {t.option.name}
                  </Badge>
                ))}
              </div>
            ) : (
              '—'
            )}
          </DetailRow>

          <DetailRow label='Responsible Persons'>
            {activity.responsiblePersons.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {activity.responsiblePersons.map((r) => (
                  <Badge key={r.option.id} variant='secondary'>
                    {r.option.name}
                  </Badge>
                ))}
              </div>
            ) : (
              '—'
            )}
          </DetailRow>

          <DetailRow label='Participants'>
            <div className='flex gap-4'>
              <span>
                Female:{' '}
                <span className='font-medium'>{activity.femaleCount}</span>
              </span>
              <span>
                Male: <span className='font-medium'>{activity.maleCount}</span>
              </span>
              <span>
                Total:{' '}
                <span className='font-medium'>{activity.totalCount}</span>
              </span>
            </div>
          </DetailRow>

          <DetailRow label='Encoded On'>
            {format(activity.createdAt, 'MMM d, yyyy h:mm a')}
          </DetailRow>
        </div>
      </SheetContent>
    </Sheet>
  );
}
