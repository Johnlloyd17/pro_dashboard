'use client';

import React, { useCallback, useRef, useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Import, Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { importActivities, type ImportActivityRow } from '@/app/actions/import-actions';
import { useRouter } from 'next/navigation';

const HEADER_MAP: Record<string, keyof ImportActivityRow> = {
  'Activity Name': 'activityName',
  'Activity Venue': 'activityVenue',
  'Date From': 'dateFrom',
  'Date To': 'dateTo',
  Bureau: 'bureau',
  Project: 'project',
  Indicator: 'indicators',
  District: 'district',
  'City/Municipality': 'municipality',
  Barangay: 'barangay',
  'Requesting Agency': 'requestingAgency',
  'Mode of Implementation': 'modeOfImplementation',
  'Target Sector': 'targetSectors',
  'Responsible Person': 'responsiblePersons',
  Status: 'status',
  Female: 'femaleCount',
  Male: 'maleCount',
  Total: 'totalCount',
};

function mapRow(raw: Record<string, unknown>): ImportActivityRow {
  const mapped: ImportActivityRow = {};
  for (const [header, field] of Object.entries(HEADER_MAP)) {
    const val = raw[header];
    if (val === undefined || val === null || val === '') continue;
    if (field === 'femaleCount' || field === 'maleCount' || field === 'totalCount') {
      (mapped as Record<string, unknown>)[field] = Number(val) || 0;
    } else {
      (mapped as Record<string, unknown>)[field] = String(val);
    }
  }
  return mapped;
}

export default function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<ImportActivityRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const resetState = useCallback(() => {
    setPreview([]);
    setFileName('');
    setParseError('');
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      resetState();
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

          if (jsonData.length === 0) {
            setParseError('The file is empty or has no data rows.');
            return;
          }

          const rows = jsonData.map(mapRow).filter((r) => r.activityName?.trim());
          if (rows.length === 0) {
            setParseError('No valid rows found. Make sure the file has an "Activity Name" column.');
            return;
          }

          setPreview(rows);
        } catch {
          setParseError('Failed to parse the file. Please use a valid Excel (.xlsx, .xls) or CSV file.');
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [resetState],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleImport = useCallback(() => {
    if (preview.length === 0) return;

    startTransition(async () => {
      const result = await importActivities(preview);

      if (result.success) {
        toast.success(
          `Successfully imported ${result.imported} activit${result.imported === 1 ? 'y' : 'ies'}`,
        );
        if (result.errors && result.errors.length > 0) {
          toast.warning(`${result.errors.length} row(s) had issues`);
        }
        resetState();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Import failed');
      }
    });
  }, [preview, resetState, router]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Import className="h-4 w-4" /> Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl bg-neutral-50 dark:bg-neutral-900 overflow-auto">
        <DialogHeader>
          <DialogTitle>Import Activities from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx, .xls) or CSV file. The first row should
            contain headers matching the export format.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          {preview.length === 0 && !parseError && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 transition-colors hover:border-muted-foreground/50 cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .xlsx, .xls, and .csv files
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          )}

          {parseError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{parseError}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto"
                onClick={resetState}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {preview.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{fileName}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {preview.length} row{preview.length !== 1 ? 's' : ''} ready to import
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>

              <div className="max-h-80 overflow-auto rounded-md border">
                <Table className="text-xs">
                  <TableHeader className="bg-muted sticky top-0">
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Activity Name</TableHead>
                      <TableHead>Date From</TableHead>
                      <TableHead>Date To</TableHead>
                      <TableHead>Bureau</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>City/Municipality</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.slice(0, 50).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-medium max-w-48 truncate">
                          {row.activityName || '—'}
                        </TableCell>
                        <TableCell>{row.dateFrom || '—'}</TableCell>
                        <TableCell>{row.dateTo || '—'}</TableCell>
                        <TableCell>{row.bureau || '—'}</TableCell>
                        <TableCell>{row.project || '—'}</TableCell>
                        <TableCell>{row.district || '—'}</TableCell>
                        <TableCell>{row.municipality || '—'}</TableCell>
                        <TableCell>{row.status || '—'}</TableCell>
                        <TableCell className="text-right">
                          {row.totalCount ?? (row.femaleCount ?? 0) + (row.maleCount ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {preview.length > 50 && (
                  <div className="text-center py-2 text-xs text-muted-foreground border-t">
                    Showing 50 of {preview.length} rows
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetState();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={preview.length === 0 || isPending}
            onClick={handleImport}
          >
            <Upload className="w-4 h-4" />
            {isPending
              ? `Importing${preview.length > 0 ? ` ${preview.length} rows...` : '...'}`
              : `Import${preview.length > 0 ? ` ${preview.length} Rows` : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
