'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { PaginationComponent } from './pagination';
import AddFw4aRecordDialog from './add-fw4a-record-dialog';
import { Search, Pencil, Trash, Import, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Fw4aRecord } from '@/lib/types';
import {
  deleteFw4aRecord,
  deleteFw4aRecords,
  exportFw4aRecords,
  importFw4aRecords,
} from '@/app/actions/fw4a-actions';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Fw4aRecordsTableProps {
  records: Fw4aRecord[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentPageSize: number;
  filterOptions: {
    localities: string[];
    districts: string[];
    siteTypes: string[];
    statuses: string[];
    strategies: string[];
  };
  currentFilters: {
    locality?: string;
    district?: string;
    siteType?: string;
    status?: string;
    strategy?: string;
  };
}

const CSV_HEADERS = [
  'Locality',
  'Barangay',
  'District',
  'Locations',
  'Site Type',
  'Site Code',
  'Strategy',
  'Status',
  'Reason for Outage',
  'Remarks',
];

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field.trim());
        field = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        current.push(field.trim());
        if (current.some((f) => f !== '')) rows.push(current);
        current = [];
        field = '';
        if (char === '\r') i++;
      } else {
        field += char;
      }
    }
  }

  current.push(field.trim());
  if (current.some((f) => f !== '')) rows.push(current);

  return rows;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function Fw4aRecordsTable({
  records,
  currentPage,
  totalPages,
  currentSearch,
  currentPageSize,
  filterOptions,
  currentFilters,
}: Fw4aRecordsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDelete = (id: string, siteCode: string | null) => {
    startTransition(async () => {
      const result = await deleteFw4aRecord(id);
      if (result.success) {
        toast.success(`FW4A record "${siteCode ?? 'N/A'}" deleted`);
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  const handleBatchDelete = () => {
    startTransition(async () => {
      const result = await deleteFw4aRecords(selectedIds);
      if (result.success) {
        toast.success(`Deleted ${result.count} records`);
        setSelectedIds([]);
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleExport = async () => {
    try {
      const allRecords = await exportFw4aRecords(
        currentSearch || undefined,
      );

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const rows = allRecords.map((r) => [
        r.locality ?? '',
        r.barangay ?? '',
        r.district ?? '',
        r.locations ?? '',
        r.siteType ?? '',
        r.siteCode ?? '',
        r.strategy ?? '',
        r.status ?? '',
        r.reasonForOutage ?? '',
        r.remarks ?? '',
      ]);

      const csv = [
        CSV_HEADERS.join(','),
        ...rows.map((row) => row.map(escapeCSV).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fw4a-records-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allRecords.length} records`);
    } catch {
      toast.error('Failed to export records');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        return;
      }

      const headerRow = rows[0];
      const expectedHeaderIndex = CSV_HEADERS.map((h) =>
        headerRow.findIndex((cell) => cell.toLowerCase().includes(h.toLowerCase())),
      );

      const dataRows = rows.slice(1);
      const recordsToImport = dataRows.map((row) => ({
        locality: row[expectedHeaderIndex[0]] || undefined,
        barangay: row[expectedHeaderIndex[1]] || undefined,
        district: row[expectedHeaderIndex[2]] || undefined,
        locations: row[expectedHeaderIndex[3]] || undefined,
        siteType: row[expectedHeaderIndex[4]] || undefined,
        siteCode: row[expectedHeaderIndex[5]] || undefined,
        strategy: row[expectedHeaderIndex[6]] || undefined,
        status: row[expectedHeaderIndex[7]] || undefined,
        reasonForOutage: row[expectedHeaderIndex[8]] || undefined,
        remarks: row[expectedHeaderIndex[9]] || undefined,
      }));

      const result = await importFw4aRecords(recordsToImport);

      if (result.success) {
        toast.success(`Imported ${result.count} records`);
      } else {
        toast.error(result.error ?? 'Failed to import records');
      }
    } catch {
      toast.error('Failed to parse CSV file');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const allSelected = records.length > 0 && selectedIds.length === records.length;

  return (
    <div className='flex flex-col gap-3 w-full min-w-0'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv'
        className='hidden'
        onChange={handleImport}
      />
      <div className='flex items-center gap-2'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search FW4A records...'
            className='pl-9'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button variant='outline' onClick={handleSearch}>
          Search
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <Select
          value={currentFilters.locality ?? 'all'}
          onValueChange={(v) => handleFilterChange('locality', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select Locality' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Localities</SelectItem>
            {filterOptions.localities.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.district ?? 'all'}
          onValueChange={(v) => handleFilterChange('district', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select District' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Districts</SelectItem>
            {filterOptions.districts.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.siteType ?? 'all'}
          onValueChange={(v) => handleFilterChange('siteType', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select Site Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Site Types</SelectItem>
            {filterOptions.siteTypes.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.status ?? 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className='w-[160px] h-8'>
            <SelectValue placeholder='Select Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            {filterOptions.statuses.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.strategy ?? 'all'}
          onValueChange={(v) => handleFilterChange('strategy', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select Strategy' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Strategies</SelectItem>
            {filterOptions.strategies.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar'>
        <Table className='w-max min-w-full'>
          <TableHeader className='bg-gray-100'>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className='w-10'>No.</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Site Type</TableHead>
              <TableHead>Site Code</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason for Outage</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className='text-right'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
                  className='text-center text-muted-foreground py-8'
                >
                  No FW4A records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record, index) => (
                <TableRow
                  key={record.id}
                  className={selectedIds.includes(record.id) ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => toggleSelect(record.id)}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>
                    {(currentPage - 1) * currentPageSize + index + 1}
                  </TableCell>
                  <TableCell>{record.locality ?? '—'}</TableCell>
                  <TableCell>{record.barangay ?? '—'}</TableCell>
                  <TableCell>{record.district ?? '—'}</TableCell>
                  <TableCell className='max-w-40'>
                    <span className='block truncate'>
                      {record.locations ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {record.siteType ? (
                      <Badge variant='outline'>{record.siteType}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{record.siteCode ?? '—'}</TableCell>
                  <TableCell>{record.strategy ?? '—'}</TableCell>
                  <TableCell>
                    {record.status ? (
                      <Badge
                        variant={
                          record.status.toLowerCase() === 'active'
                            ? 'default'
                            : record.status.toLowerCase() === 'inactive'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {record.status}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='max-w-40'>
                    <span className='block truncate'>
                      {record.reasonForOutage ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className='max-w-32'>
                    <span className='block truncate'>
                      {record.remarks ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className='text-right w-20'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 text-destructive hover:text-destructive'
                          >
                            <Trash className='h-3.5 w-3.5' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete FW4A record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete this FW4A record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(record.id, record.siteCode)
                              }
                              className='bg-destructive text-white hover:bg-destructive/90'
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-between items-center w-full min-w-0'>
        <div className='flex flex-row items-center gap-2'>
          <AddFw4aRecordDialog />
          <Button
            variant='outline'
            onClick={() => fileInputRef.current?.click()}
          >
            <Import className='h-4 w-4' /> Import
          </Button>
          <Button variant='outline' onClick={handleExport}>
            <Download className='h-4 w-4' /> Export
          </Button>
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive'>
                  <Trash className='h-4 w-4' /> Delete ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedIds.length} record(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the selected FW4A records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBatchDelete}
                    className='bg-destructive text-white hover:bg-destructive/90'
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
              {[10, 20, 50, 100, 200].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
