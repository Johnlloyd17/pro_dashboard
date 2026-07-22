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
import { toast } from 'sonner';

export default function AddProcurementDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    prNo: '',
    activityId: '',
    activityName: '',
    linkToFile: '',
    projectFundSource: '',
    typeOfItemsProcured: '',
    amount: '',
    nameOfSupplier: '',
    joPo: '',
    linkToAttachments: '',
    personnelInCharge: '',
    dateForwardedToRo: '',
    transmittalReport: '',
    paymentStatus: '',
    remarks: '',
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    startTransition(async () => {
      toast.success('Procurement record added');
      setForm({
        prNo: '',
        activityId: '',
        activityName: '',
        linkToFile: '',
        projectFundSource: '',
        typeOfItemsProcured: '',
        amount: '',
        nameOfSupplier: '',
        joPo: '',
        linkToAttachments: '',
        personnelInCharge: '',
        dateForwardedToRo: '',
        transmittalReport: '',
        paymentStatus: '',
        remarks: '',
      });
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Plus className='h-4 w-4' /> Add Procurement Record
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Procurement Record</DialogTitle>
            <DialogDescription>
              Add a new procurement record to track.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className='mt-4'>
            <div className='grid grid-cols-2 gap-4'>
              <Field>
                <FieldLabel>PR No</FieldLabel>
                <Input
                  placeholder='PR number'
                  value={form.prNo}
                  onChange={(e) => updateField('prNo', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Activity ID</FieldLabel>
                <Input
                  placeholder='Activity ID'
                  value={form.activityId}
                  onChange={(e) => updateField('activityId', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Activity Name</FieldLabel>
                <Input
                  placeholder='Activity name'
                  value={form.activityName}
                  onChange={(e) => updateField('activityName', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Link to File</FieldLabel>
                <Input
                  placeholder='https://...'
                  value={form.linkToFile}
                  onChange={(e) => updateField('linkToFile', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Project Fund Source</FieldLabel>
                <Input
                  placeholder='Fund source'
                  value={form.projectFundSource}
                  onChange={(e) => updateField('projectFundSource', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Type of Items Procured</FieldLabel>
                <Input
                  placeholder='e.g. Office Supplies, Equipment'
                  value={form.typeOfItemsProcured}
                  onChange={(e) => updateField('typeOfItemsProcured', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Amount</FieldLabel>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Name of Supplier</FieldLabel>
                <Input
                  placeholder='Supplier name'
                  value={form.nameOfSupplier}
                  onChange={(e) => updateField('nameOfSupplier', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>JO/PO</FieldLabel>
                <Input
                  placeholder='JO or PO number'
                  value={form.joPo}
                  onChange={(e) => updateField('joPo', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Link to Attachments</FieldLabel>
                <Input
                  placeholder='https://...'
                  value={form.linkToAttachments}
                  onChange={(e) => updateField('linkToAttachments', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Personnel In-charge</FieldLabel>
                <Input
                  placeholder='Personnel name'
                  value={form.personnelInCharge}
                  onChange={(e) => updateField('personnelInCharge', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Date Forwarded to RO</FieldLabel>
                <Input
                  type='date'
                  value={form.dateForwardedToRo}
                  onChange={(e) => updateField('dateForwardedToRo', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Transmittal Report</FieldLabel>
                <Input
                  placeholder='Transmittal report reference'
                  value={form.transmittalReport}
                  onChange={(e) => updateField('transmittalReport', e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Payment Status</FieldLabel>
                <Input
                  placeholder='e.g. Pending, Paid, Processing'
                  value={form.paymentStatus}
                  onChange={(e) => updateField('paymentStatus', e.target.value)}
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
