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
import AddPropertyRecordDialog from './add-property-record-dialog';
import { Search, Pencil, Trash, Import, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { PropertyRecord } from '@/lib/types';
import {
  deletePropertyRecord,
  deletePropertyRecords,
  exportPropertyRecords,
  importPropertyRecords,
} from '@/app/actions/property-actions';
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

interface PropertyRecordsTableProps {
  records: PropertyRecord[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentPageSize: number;
  filterOptions: {
    projects: string[];
    icsParNumbers: string[];
    remarks: string[];
    years: string[];
  };
  currentFilters: {
    project?: string;
    icsParNumber?: string;
    year?: string;
    remarks?: string;
  };
}

const CSV_HEADERS = [
  'Project',
  'Item No.',
  'Classification',
  'Quantity',
  'Unit',
  'Description/Model',
  'Received From',
  'Property Number',
  'ICS/PAR Number',
  'Serial Number',
  'Date Acquired',
  'Accountable Officer',
  'Unit Cost',
  'Estimated Useful Life',
  'Received/Transferred',
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

export default function PropertyRecordsTable({
  records,
  currentPage,
  totalPages,
  currentSearch,
  currentPageSize,
  filterOptions,
  currentFilters,
}: PropertyRecordsTableProps) {
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

  const handleDelete = (id: string, itemNo: string | null) => {
    startTransition(async () => {
      const result = await deletePropertyRecord(id);
      if (result.success) {
        toast.success(`Property record "${itemNo ?? 'N/A'}" deleted`);
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  const handleBatchDelete = () => {
    startTransition(async () => {
      const result = await deletePropertyRecords(selectedIds);
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
      const allRecords = await exportPropertyRecords(
        currentSearch || undefined,
        (searchParams.get('stat') as string) || undefined,
      );

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const rows = allRecords.map((r) => [
        r.project ?? '',
        r.itemNo ?? '',
        r.classification ?? '',
        String(r.quantity),
        r.unit ?? '',
        r.descriptionModel ?? '',
        r.receivedFrom ?? '',
        r.propertyNumber ?? '',
        r.icsParNumber ?? '',
        r.serialNumber ?? '',
        r.dateAcquired ? format(r.dateAcquired, 'yyyy-MM-dd') : '',
        r.accountableOfficer ?? '',
        String(r.unitCost),
        r.estimatedUsefulLife ?? '',
        r.receivedTransferred ?? '',
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
      link.download = `property-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
        project: row[expectedHeaderIndex[0]] || undefined,
        itemNo: row[expectedHeaderIndex[1]] || undefined,
        classification: row[expectedHeaderIndex[2]] || undefined,
        quantity: row[expectedHeaderIndex[3]] ? Number(row[expectedHeaderIndex[3]].replace(/[₱,]/g, '')) : undefined,
        unit: row[expectedHeaderIndex[4]] || undefined,
        descriptionModel: row[expectedHeaderIndex[5]] || undefined,
        receivedFrom: row[expectedHeaderIndex[6]] || undefined,
        propertyNumber: row[expectedHeaderIndex[7]] || undefined,
        icsParNumber: row[expectedHeaderIndex[8]] || undefined,
        serialNumber: row[expectedHeaderIndex[9]] || undefined,
        dateAcquired: row[expectedHeaderIndex[10]]
          ? new Date(row[expectedHeaderIndex[10]])
          : undefined,
        accountableOfficer: row[expectedHeaderIndex[11]] || undefined,
        unitCost: row[expectedHeaderIndex[12]] ? Number(row[expectedHeaderIndex[12]].replace(/[₱,]/g, '')) : undefined,
        estimatedUsefulLife: row[expectedHeaderIndex[13]] || undefined,
        receivedTransferred: row[expectedHeaderIndex[14]] || undefined,
        remarks: row[expectedHeaderIndex[15]] || undefined,
      }));

      const result = await importPropertyRecords(recordsToImport);

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
            placeholder='Search records...'
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
          value={currentFilters.project ?? 'all'}
          onValueChange={(v) => handleFilterChange('project', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select Project' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Projects</SelectItem>
            {filterOptions.projects.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.icsParNumber ?? 'all'}
          onValueChange={(v) => handleFilterChange('icsParNumber', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select ICS/PAR' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All ICS/PAR</SelectItem>
            {filterOptions.icsParNumbers.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.year ?? 'all'}
          onValueChange={(v) => handleFilterChange('year', v)}
        >
          <SelectTrigger className='w-[140px] h-8'>
            <SelectValue placeholder='Select Year' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Years</SelectItem>
            {filterOptions.years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.remarks ?? 'all'}
          onValueChange={(v) => handleFilterChange('remarks', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Select Remarks' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Remarks</SelectItem>
            {filterOptions.remarks.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
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
              <TableHead>Project</TableHead>
              <TableHead>Item No.</TableHead>
              <TableHead>Classification</TableHead>
              <TableHead className='w-20'>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Description/Model</TableHead>
              <TableHead>Received From</TableHead>
              <TableHead>Property Number</TableHead>
              <TableHead>ICS/PAR Number</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Date Acquired</TableHead>
              <TableHead>Accountable Officer</TableHead>
              <TableHead className='text-right'>Unit Cost</TableHead>
              <TableHead>Est. Useful Life</TableHead>
              <TableHead>Received/Transferred</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className='text-right'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={19}
                  className='text-center text-muted-foreground py-8'
                >
                  No property records found.
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
                  <TableCell>{record.project ?? '—'}</TableCell>
                  <TableCell>{record.itemNo ?? '—'}</TableCell>
                  <TableCell>
                    {record.classification ? (
                      <Badge variant='outline'>{record.classification}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-right'>{record.quantity}</TableCell>
                  <TableCell>{record.unit ?? '—'}</TableCell>
                  <TableCell className='max-w-40'>
                    <span className='block truncate'>
                      {record.descriptionModel ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>{record.receivedFrom ?? '—'}</TableCell>
                  <TableCell>{record.propertyNumber ?? '—'}</TableCell>
                  <TableCell>{record.icsParNumber ?? '—'}</TableCell>
                  <TableCell>{record.serialNumber ?? '—'}</TableCell>
                  <TableCell>
                    {record.dateAcquired
                      ? format(record.dateAcquired, 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell>{record.accountableOfficer ?? '—'}</TableCell>
                  <TableCell className='text-right'>
                    ₱{record.unitCost.toLocaleString()}
                  </TableCell>
                  <TableCell>{record.estimatedUsefulLife ?? '—'}</TableCell>
                  <TableCell>{record.receivedTransferred ?? '—'}</TableCell>
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
                              Delete property record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete this property record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(record.id, record.itemNo)
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
          <AddPropertyRecordDialog />
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
                    the selected property records.
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
