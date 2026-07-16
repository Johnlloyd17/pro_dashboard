"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical, Pencil, Trash, Link } from "lucide-react";
import { deleteLabel, updateLabel } from "@/app/actions/label-action";
import OptionAddDialog from "./option-add-dialog";
import RelationEditDialog from "./relation-edit-dialog";
import { deleteOption, updateOption } from "@/app/actions/option-actions";
import { Label } from "@/lib/types";

export function LabelCard({ label }: { label: Label }) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(label.name);
  const [editOptionOpen, setEditOptionOpen] = useState(false);
  const [editOptionId, setEditOptionId] = useState("");
  const [editOptionName, setEditOptionName] = useState("");
  const [relationEditOpen, setRelationEditOpen] = useState(false);
  const [relationEditOptionId, setRelationEditOptionId] = useState("");
  const [relationEditOptionName, setRelationEditOptionName] = useState("");
  const [relationEditCurrentRelations, setRelationEditCurrentRelations] = useState<{ id: string; name: string }[]>([]);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteLabel(label.id);
      if (result.success) {
        toast.success(`"${label.name}" deleted`);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  const handleEdit = () => {
    if (!editName.trim()) {
      toast.error("Label name is required");
      return;
    }
    startTransition(async () => {
      const result = await updateLabel(label.id, editName);
      if (result.success) {
        toast.success(`Label renamed to "${editName}"`);
        setEditOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  const handleDeleteOption = (optionId: string, optionName: string) => {
    startTransition(async () => {
      const result = await deleteOption(optionId);
      if (result.success) {
        toast.success(`"${optionName}" removed`);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  const handleEditOption = () => {
    if (!editOptionName.trim()) {
      toast.error("Option name is required");
      return;
    }
    startTransition(async () => {
      const result = await updateOption(editOptionId, editOptionName);
      if (result.success) {
        toast.success(`Option renamed to "${editOptionName}"`);
        setEditOptionOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Card className="h-auto mb-auto">
      <CardHeader className="h-4">
        <CardTitle>{label.name}</CardTitle>
        <CardAction>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 -mt-4 -mr-2"
                  disabled={isPending}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{label.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this label and all its options.
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
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Label</DialogTitle>
                <DialogDescription>
                  Change the name of this label.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                }}
                autoFocus
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={isPending}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={editOptionOpen} onOpenChange={setEditOptionOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Option</DialogTitle>
                <DialogDescription>
                  Change the name of this option.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={editOptionName}
                onChange={(e) => setEditOptionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditOption();
                }}
                autoFocus
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOptionOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditOption} disabled={isPending}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <RelationEditDialog
            optionId={relationEditOptionId}
            optionName={relationEditOptionName}
            currentRelations={relationEditCurrentRelations}
            open={relationEditOpen}
            onOpenChange={setRelationEditOpen}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="border-t pt-2">
        {label.options.length > 0 && (
          <div className="flex flex-col gap-2 mt-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {[...label.options]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-between border px-2 py-1.5 text-xs"
              >
                <div className="flex flex-col">
                  <span className="text-xs">{option.name}</span>
                  {option.relationsFrom.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {option.relationsFrom
                        .map((r) => r.relatedOption.name)
                        .join(", ")}
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4"
                      disabled={isPending}
                    >
                      <MoreVertical className="h-2 w-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setEditOptionId(option.id);
                        setEditOptionName(option.name);
                        setEditOptionOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setRelationEditOptionId(option.id);
                        setRelationEditOptionName(option.name);
                        setRelationEditCurrentRelations(
                          option.relationsFrom.map((r) => ({
                            id: r.relatedOption.id,
                            name: r.relatedOption.name,
                          }))
                        );
                        setRelationEditOpen(true);
                      }}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Edit Relations
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleDeleteOption(option.id, option.name);
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        <CardFooter className="p-0 pb-2 mt-4 flex justify-end border-0">
          <OptionAddDialog labelId={label.id} />
        </CardFooter>
      </CardContent>
    </Card>
  );
}
