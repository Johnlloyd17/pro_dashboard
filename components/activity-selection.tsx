'use client';

import { createContext, useContext, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Edit, Trash, X } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
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
} from './ui/alert-dialog';
import { deleteActivities } from '@/app/actions/activity-actions';
import { EditActivityDialog } from './edit-activity-dialog';

interface ActivitySelectionContextValue {
  selectedIds: string[];
  toggle: (id: string) => void;
  setAll: (ids: string[]) => void;
  clear: () => void;
}

const ActivitySelectionContext =
  createContext<ActivitySelectionContextValue | null>(null);

function useActivitySelection() {
  const context = useContext(ActivitySelectionContext);
  if (!context) {
    throw new Error(
      'Activity selection components must be used inside ActivitySelectionProvider',
    );
  }
  return context;
}

export function ActivitySelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );

  return (
    <ActivitySelectionContext.Provider
      value={{
        selectedIds,
        toggle,
        setAll: setSelectedIds,
        clear: () => setSelectedIds([]),
      }}
    >
      {children}
    </ActivitySelectionContext.Provider>
  );
}

export function ActivityRowCheckbox({ activityId }: { activityId: string }) {
  const { selectedIds, toggle } = useActivitySelection();
  return (
    <Checkbox
      checked={selectedIds.includes(activityId)}
      onCheckedChange={() => toggle(activityId)}
      aria-label='Select row'
    />
  );
}

export function ActivitySelectAllCheckbox({ ids }: { ids: string[] }) {
  const { selectedIds, setAll, clear } = useActivitySelection();
  const allSelected =
    ids.length > 0 && ids.every((id) => selectedIds.includes(id));
  return (
    <Checkbox
      checked={
        allSelected ? true : selectedIds.length > 0 ? 'indeterminate' : false
      }
      onCheckedChange={() => (allSelected ? clear() : setAll(ids))}
      aria-label='Select all rows'
    />
  );
}

export function ActivitySelectionBar() {
  const { selectedIds, clear } = useActivitySelection();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteActivities(selectedIds);
      if (result.success) {
        toast.success(
          selectedIds.length === 1
            ? 'Activity deleted'
            : `${selectedIds.length} activities deleted`,
        );
        clear();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });
  };

  return (
    <>
      <div className='fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 border bg-background px-4 py-2 shadow-lg'>
        <span className='text-sm font-medium whitespace-nowrap'>
          {selectedIds.length} selected
        </span>

        <Button
          variant='outline'
          size='sm'
          disabled={isPending || selectedIds.length !== 1}
          onClick={() => setEditOpen(true)}
        >
          <Edit className='h-4 w-4' /> Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' disabled={isPending}>
              <Trash className='h-4 w-4' />
              {selectedIds.length === 1
                ? 'Delete'
                : `Delete (${selectedIds.length})`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {selectedIds.length}{' '}
                {selectedIds.length === 1 ? 'activity' : 'activities'}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The selected activity records
                will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-destructive text-white hover:bg-destructive/90'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={clear}
          disabled={isPending}
          aria-label='Clear selection'
        >
          <X className='h-4 w-4' />
        </Button>
      </div>

      {selectedIds.length === 1 && (
        <EditActivityDialog
          activityId={selectedIds[0]}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </>
  );
}
