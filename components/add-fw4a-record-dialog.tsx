'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Field, FieldGroup, FieldLabel } from './ui/field';
import { Plus, Upload } from 'lucide-react';
import { addFw4aRecord } from '@/app/actions/fw4a-actions';
import { toast } from 'sonner';

export default function AddFw4aRecordDialog() {
  const [open, setOpen] = useState(false);
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

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    startTransition(async () => {
      const result = await addFw4aRecord({
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
        toast.success('FW4A record added');
        setForm({
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
        setOpen(false);
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='h-4 w-4' /> Add FW4A Record
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add FW4A Record</DialogTitle>
            <DialogDescription>
              Add a new FW4A site record to the inventory.
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
                  onChange={(e) => updateField('reasonForOutage', e.target.value)}
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              <Upload className='h-4 w-4' />{' '}
              {isPending ? 'Saving...' : 'Save Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
