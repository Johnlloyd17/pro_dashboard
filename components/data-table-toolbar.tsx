'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Search, Download } from 'lucide-react';
import { exportActivities } from '@/app/actions/activity-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DataTableToolbarProps {
  bureauName: string;
  currentSearch: string;
  currentPageSize: number;
  filterOptions: {
    projects: string[];
    districts: string[];
    modes: string[];
    statuses: string[];
  };
  currentFilters: {
    project?: string;
    district?: string;
    mode?: string;
    status?: string;
  };
}

const PAGE_SIZES = [10, 25, 50, 100, 150, 200];

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function DataTableToolbar({
  bureauName,
  currentSearch,
  currentPageSize,
  filterOptions,
  currentFilters,
}: DataTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handlePageSizeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleExport = async () => {
    try {
      const allRecords = await exportActivities(
        bureauName,
        searchParams.get('year') ?? undefined,
        searchParams.get('semester') ?? undefined,
        {
          project: currentFilters.project,
          district: currentFilters.district,
          mode: currentFilters.mode,
          status: currentFilters.status,
          search: currentSearch || undefined,
        },
      );

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const CSV_HEADERS = [
        'Activity ID',
        'Activity Name',
        'Date From',
        'Date To',
        'Bureau',
        'Project',
        'Indicator',
        'Activity Venue',
        'District',
        'City/Municipality',
        'Barangay',
        'Requesting Agency',
        'Mode of Implementation',
        'Target Sector',
        'Responsible Person',
        'Status',
        'Female',
        'Male',
        'Total',
      ];

      const rows = allRecords.map((r) => [
        r.id.slice(0, 8),
        r.activityName ?? '',
        r.dateFrom ? format(r.dateFrom, 'MMM d, yyyy') : '',
        r.dateTo ? format(r.dateTo, 'MMM d, yyyy') : '',
        r.bureau?.name ?? '',
        r.project?.name ?? '',
        r.indicators.map((i) => i.name).join('; '),
        r.activityVenue ?? '',
        r.district?.name ?? '',
        r.municipality?.name ?? '',
        r.barangay ?? '',
        r.requestingAgency?.name ?? '',
        r.modeOfImplementation?.name ?? '',
        r.targetSectors.map((t) => t.option.name).join('; '),
        r.responsiblePersons.map((p) => p.option.name).join('; '),
        r.status?.name ?? '',
        String(r.femaleCount),
        String(r.maleCount),
        String(r.totalCount),
      ]);

      const csv = [
        CSV_HEADERS.join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bureauName.toLowerCase()}-activities-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allRecords.length} records`);
    } catch {
      toast.error('Failed to export records');
    }
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='relative flex-1 max-w-sm'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search activities...'
          className='pl-9'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
        />
      </div>
      <Button variant='outline' size='sm' onClick={handleSearch}>
        Search
      </Button>

      <Select
        value={currentFilters.project ?? 'all'}
        onValueChange={(v) => handleFilterChange('project', v)}
      >
        <SelectTrigger className='w-[160px] h-8'>
          <SelectValue placeholder='Project' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Projects</SelectItem>
          {filterOptions.projects.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.status ?? 'all'}
        onValueChange={(v) => handleFilterChange('status', v)}
      >
        <SelectTrigger className='w-[140px] h-8'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          {filterOptions.statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.district ?? 'all'}
        onValueChange={(v) => handleFilterChange('district', v)}
      >
        <SelectTrigger className='w-[140px] h-8'>
          <SelectValue placeholder='District' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Districts</SelectItem>
          {filterOptions.districts.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFilters.mode ?? 'all'}
        onValueChange={(v) => handleFilterChange('mode', v)}
      >
        <SelectTrigger className='w-[180px] h-8'>
          <SelectValue placeholder='Mode' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Modes</SelectItem>
          {filterOptions.modes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant='outline' size='sm' onClick={handleExport}>
        <Download className='h-4 w-4' /> Export
      </Button>

      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>Rows:</span>
        <Select
          value={String(currentPageSize)}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className='w-[70px] h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
