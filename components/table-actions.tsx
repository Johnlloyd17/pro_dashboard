"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Edit, EllipsisVertical, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
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
} from "./ui/alert-dialog";
import { deleteActivity } from "@/app/actions/activity-actions";
import { EditActivityDialog } from "./edit-activity-dialog";

interface TableActionsProps {
  activityId: string;
  activityName: string;
}

export default function TableActions({
  activityId,
  activityName,
}: TableActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteActivity(activityId);
      if (result.success) {
        toast.success(`"${activityName}" deleted`);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isPending}>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Edit className="w-4 h-4" /> Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="w-4 h-4 text-destructive" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{activityName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              activity record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditActivityDialog
        activityId={activityId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
