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
import AddProcurementDialog from './add-procurement-dialog';
import { Search, Pencil, Trash, Import, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ProcurementRecord } from '@/lib/types';
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

interface ProcurementTableProps {
  records: ProcurementRecord[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentPageSize: number;
  filterOptions: {
    fundSources: string[];
    itemTypes: string[];
    paymentStatuses: string[];
  };
  currentFilters: {
    fundSource?: string;
    itemType?: string;
    paymentStatus?: string;
  };
}

const CSV_HEADERS = [
  'PR No',
  'Activity ID',
  'Activity Name',
  'Link to File',
  'Project Fund Source',
  'Type of Items Procured',
  'Amount',
  'Name of Supplier',
  'JO/PO',
  'Link to Attachments',
  'Personnel In-charge',
  'Date Forwarded to RO',
  'Transmittal Report',
  'Payment Status',
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

function getStatusColor(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'for approval':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function ProcurementTable({
  records,
  currentPage,
  totalPages,
  currentSearch,
  currentPageSize,
  filterOptions,
  currentFilters,
}: ProcurementTableProps) {
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

  const handleDelete = (id: string, prNo: string | null) => {
    startTransition(async () => {
      const idx = records.findIndex((r) => r.id === id);
      if (idx !== -1) {
        records.splice(idx, 1);
        toast.success(`Procurement record "${prNo ?? 'N/A'}" deleted`);
      }
    });
  };

  const handleBatchDelete = () => {
    startTransition(async () => {
      const count = selectedIds.length;
      records.splice(
        0,
        records.length,
        ...records.filter((r) => !selectedIds.includes(r.id)),
      );
      toast.success(`Deleted ${count} records`);
      setSelectedIds([]);
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

  const handleExport = () => {
    try {
      if (records.length === 0) {
        toast.error('No records to export');
        return;
      }

      const rows = records.map((r) => [
        r.prNo ?? '',
        r.activityId ?? '',
        r.activityName ?? '',
        r.linkToFile ?? '',
        r.projectFundSource ?? '',
        r.typeOfItemsProcured ?? '',
        String(r.amount),
        r.nameOfSupplier ?? '',
        r.joPo ?? '',
        r.linkToAttachments ?? '',
        r.personnelInCharge ?? '',
        r.dateForwardedToRo ? format(r.dateForwardedToRo, 'yyyy-MM-dd') : '',
        r.transmittalReport ?? '',
        r.paymentStatus ?? '',
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
      link.download = `procurement-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${records.length} records`);
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

      const dataRows = rows.slice(1);
      toast.success(`Imported ${dataRows.length} records`);
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
            placeholder='Search procurement records...'
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
          value={currentFilters.fundSource ?? 'all'}
          onValueChange={(v) => handleFilterChange('fundSource', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Fund Source' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Fund Sources</SelectItem>
            {filterOptions.fundSources.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.itemType ?? 'all'}
          onValueChange={(v) => handleFilterChange('itemType', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Item Type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Item Types</SelectItem>
            {filterOptions.itemTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={currentFilters.paymentStatus ?? 'all'}
          onValueChange={(v) => handleFilterChange('paymentStatus', v)}
        >
          <SelectTrigger className='w-[180px] h-8'>
            <SelectValue placeholder='Payment Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Payment Status</SelectItem>
            {filterOptions.paymentStatuses.map((s) => (
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
              <TableHead>PR No</TableHead>
              <TableHead>Activity ID</TableHead>
              <TableHead>Activity Name</TableHead>
              <TableHead>Link to File</TableHead>
              <TableHead>Project Fund Source</TableHead>
              <TableHead>Type of Items Procured</TableHead>
              <TableHead className='text-right'>Amount</TableHead>
              <TableHead>Name of Supplier</TableHead>
              <TableHead>JO/PO</TableHead>
              <TableHead>Link to Attachments</TableHead>
              <TableHead>Personnel In-charge</TableHead>
              <TableHead>Date Forwarded to RO</TableHead>
              <TableHead>Transmittal Report</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className='text-right'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={18}
                  className='text-center text-muted-foreground py-8'
                >
                  No procurement records found.
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
                  <TableCell>{record.prNo ?? '—'}</TableCell>
                  <TableCell>{record.activityId ?? '—'}</TableCell>
                  <TableCell className='max-w-40'>
                    <span className='block truncate'>
                      {record.activityName ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {record.linkToFile ? (
                      <a
                        href={record.linkToFile}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline truncate block max-w-32'
                      >
                        View File
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {record.projectFundSource ? (
                      <Badge variant='outline'>{record.projectFundSource}</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='max-w-32'>
                    <span className='block truncate'>
                      {record.typeOfItemsProcured ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className='text-right'>
                    ₱{record.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className='max-w-40'>
                    <span className='block truncate'>
                      {record.nameOfSupplier ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>{record.joPo ?? '—'}</TableCell>
                  <TableCell>
                    {record.linkToAttachments ? (
                      <a
                        href={record.linkToAttachments}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline truncate block max-w-32'
                      >
                        View Attachments
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{record.personnelInCharge ?? '—'}</TableCell>
                  <TableCell>
                    {record.dateForwardedToRo
                      ? format(record.dateForwardedToRo, 'MMM d, yyyy')
                      : '—'}
                  </TableCell>
                  <TableCell className='max-w-32'>
                    <span className='block truncate'>
                      {record.transmittalReport ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={getStatusColor(record.paymentStatus)}
                    >
                      {record.paymentStatus ?? '—'}
                    </Badge>
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
                              Delete procurement record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete this procurement record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(record.id, record.prNo)
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
          <AddProcurementDialog />
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
                    the selected procurement records.
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
