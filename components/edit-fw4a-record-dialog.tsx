'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Save } from 'lucide-react';
import { getFw4aRecordById, updateFw4aRecord } from '@/app/actions/fw4a-actions';
import { toast } from 'sonner';

interface EditFw4aRecordDialogProps {
  recordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditFw4aRecordDialog({
  recordId,
  open,
  onOpenChange,
}: EditFw4aRecordDialogProps) {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    locality: '',
    barangay: '',
    district: '',
    locations: '',
    siteType: '',
    siteCode: '',
    strategy: '',
    status: '',
    reasonForOutage: '',
    remarks: '',
  });

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    getFw4aRecordById(recordId).then((record) => {
      if (record) {
        setForm({
          locality: record.locality ?? '',
          barangay: record.barangay ?? '',
          district: record.district ?? '',
          locations: record.locations ?? '',
          siteType: record.siteType ?? '',
          siteCode: record.siteCode ?? '',
          strategy: record.strategy ?? '',
          status: record.status ?? '',
          reasonForOutage: record.reasonForOutage ?? '',
          remarks: record.remarks ?? '',
        });
      }
      setLoading(false);
    });
  }, [open, recordId]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      const result = await updateFw4aRecord(recordId, {
        locality: form.locality || undefined,
        barangay: form.barangay || undefined,
        district: form.district || undefined,
        locations: form.locations || undefined,
        siteType: form.siteType || undefined,
        siteCode: form.siteCode || undefined,
        strategy: form.strategy || undefined,
        status: form.status || undefined,
        reasonForOutage: form.reasonForOutage || undefined,
        remarks: form.remarks || undefined,
      });

      if (result.success) {
        toast.success('FW4A record updated');
        onOpenChange(false);
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        {loading ? (
          <div className='py-12 text-center text-sm text-muted-foreground'>
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit FW4A Record</DialogTitle>
              <DialogDescription>
                Update the FW4A site record details below.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className='mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Field>
                  <FieldLabel>Locality</FieldLabel>
                  <Input
                    placeholder='Locality'
                    value={form.locality}
                    onChange={(e) => updateField('locality', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Barangay</FieldLabel>
                  <Input
                    placeholder='Barangay'
                    value={form.barangay}
                    onChange={(e) => updateField('barangay', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>District</FieldLabel>
                  <Input
                    placeholder='District'
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Locations</FieldLabel>
                  <Input
                    placeholder='Locations'
                    value={form.locations}
                    onChange={(e) => updateField('locations', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Site Type</FieldLabel>
                  <Input
                    placeholder='Site type'
                    value={form.siteType}
                    onChange={(e) => updateField('siteType', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Site Code</FieldLabel>
                  <Input
                    placeholder='Site code'
                    value={form.siteCode}
                    onChange={(e) => updateField('siteCode', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Strategy</FieldLabel>
                  <Input
                    placeholder='Strategy'
                    value={form.strategy}
                    onChange={(e) => updateField('strategy', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Input
                    placeholder='e.g. Active, Inactive'
                    value={form.status}
                    onChange={(e) => updateField('status', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Reason for Outage</FieldLabel>
                  <Input
                    placeholder='Reason for outage'
                    value={form.reasonForOutage}
                    onChange={(e) =>
                      updateField('reasonForOutage', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Remarks</FieldLabel>
                  <Input
                    placeholder='Remarks'
                    value={form.remarks}
                    onChange={(e) => updateField('remarks', e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
            <DialogFooter className='mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                <Save className='h-4 w-4' />{' '}
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
