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
import {
  getPropertyRecordById,
  updatePropertyRecord,
} from '@/app/actions/property-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EditPropertyRecordDialogProps {
  recordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditPropertyRecordDialog({
  recordId,
  open,
  onOpenChange,
}: EditPropertyRecordDialogProps) {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    project: '',
    itemNo: '',
    classification: '',
    quantity: '',
    unit: '',
    descriptionModel: '',
    receivedFrom: '',
    propertyNumber: '',
    icsParNumber: '',
    serialNumber: '',
    dateAcquired: '',
    accountableOfficer: '',
    unitCost: '',
    estimatedUsefulLife: '',
    receivedTransferred: '',
    remarks: '',
  });

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    getPropertyRecordById(recordId).then((record) => {
      if (record) {
        setForm({
          project: record.project ?? '',
          itemNo: record.itemNo ?? '',
          classification: record.classification ?? '',
          quantity: record.quantity ? String(record.quantity) : '',
          unit: record.unit ?? '',
          descriptionModel: record.descriptionModel ?? '',
          receivedFrom: record.receivedFrom ?? '',
          propertyNumber: record.propertyNumber ?? '',
          icsParNumber: record.icsParNumber ?? '',
          serialNumber: record.serialNumber ?? '',
          dateAcquired: record.dateAcquired
            ? format(record.dateAcquired, 'yyyy-MM-dd')
            : '',
          accountableOfficer: record.accountableOfficer ?? '',
          unitCost: record.unitCost ? String(record.unitCost) : '',
          estimatedUsefulLife: record.estimatedUsefulLife ?? '',
          receivedTransferred: record.receivedTransferred ?? '',
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
      const result = await updatePropertyRecord(recordId, {
        project: form.project || undefined,
        itemNo: form.itemNo || undefined,
        classification: form.classification || undefined,
        quantity: form.quantity ? Number(form.quantity) : undefined,
        unit: form.unit || undefined,
        descriptionModel: form.descriptionModel || undefined,
        receivedFrom: form.receivedFrom || undefined,
        propertyNumber: form.propertyNumber || undefined,
        icsParNumber: form.icsParNumber || undefined,
        serialNumber: form.serialNumber || undefined,
        dateAcquired: form.dateAcquired
          ? new Date(form.dateAcquired)
          : undefined,
        accountableOfficer: form.accountableOfficer || undefined,
        unitCost: form.unitCost ? Number(form.unitCost) : undefined,
        estimatedUsefulLife: form.estimatedUsefulLife || undefined,
        receivedTransferred: form.receivedTransferred || undefined,
        remarks: form.remarks || undefined,
      });

      if (result.success) {
        toast.success('Property record updated');
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
              <DialogTitle>Edit Property Record</DialogTitle>
              <DialogDescription>
                Update the property record details below.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className='mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Field>
                  <FieldLabel>Project</FieldLabel>
                  <Input
                    placeholder='Project name'
                    value={form.project}
                    onChange={(e) => updateField('project', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Item No.</FieldLabel>
                  <Input
                    placeholder='Item number'
                    value={form.itemNo}
                    onChange={(e) => updateField('itemNo', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Classification</FieldLabel>
                  <Input
                    placeholder='Classification'
                    value={form.classification}
                    onChange={(e) =>
                      updateField('classification', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Quantity</FieldLabel>
                  <Input
                    type='number'
                    placeholder='0'
                    value={form.quantity}
                    onChange={(e) => updateField('quantity', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Unit</FieldLabel>
                  <Input
                    placeholder='Unit'
                    value={form.unit}
                    onChange={(e) => updateField('unit', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Description/Model</FieldLabel>
                  <Input
                    placeholder='Description or model'
                    value={form.descriptionModel}
                    onChange={(e) =>
                      updateField('descriptionModel', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Received From</FieldLabel>
                  <Input
                    placeholder='Received from'
                    value={form.receivedFrom}
                    onChange={(e) =>
                      updateField('receivedFrom', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Property Number</FieldLabel>
                  <Input
                    placeholder='Property number'
                    value={form.propertyNumber}
                    onChange={(e) =>
                      updateField('propertyNumber', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>ICS/PAR Number</FieldLabel>
                  <Input
                    placeholder='ICS/PAR number'
                    value={form.icsParNumber}
                    onChange={(e) =>
                      updateField('icsParNumber', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Serial Number</FieldLabel>
                  <Input
                    placeholder='Serial number'
                    value={form.serialNumber}
                    onChange={(e) =>
                      updateField('serialNumber', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Date Acquired</FieldLabel>
                  <Input
                    type='date'
                    value={form.dateAcquired}
                    onChange={(e) =>
                      updateField('dateAcquired', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Accountable Officer</FieldLabel>
                  <Input
                    placeholder='Accountable officer'
                    value={form.accountableOfficer}
                    onChange={(e) =>
                      updateField('accountableOfficer', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Unit Cost</FieldLabel>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                    value={form.unitCost}
                    onChange={(e) => updateField('unitCost', e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Estimated Useful Life</FieldLabel>
                  <Input
                    placeholder='e.g. 5 years'
                    value={form.estimatedUsefulLife}
                    onChange={(e) =>
                      updateField('estimatedUsefulLife', e.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Received/Transferred</FieldLabel>
                  <Input
                    placeholder='Received or transferred'
                    value={form.receivedTransferred}
                    onChange={(e) =>
                      updateField('receivedTransferred', e.target.value)
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
