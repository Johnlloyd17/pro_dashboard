"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, Save, X } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  getOptionsGroupedByLabel,
  updateOptionRelations,
} from "@/app/actions/option-actions";
import { toast } from "sonner";
import { LabelGroup, RelationField } from "@/lib/types";

interface RelationEditDialogProps {
  optionId: string;
  optionName: string;
  currentRelations: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RelationEditDialog({
  optionId,
  optionName,
  currentRelations,
  open,
  onOpenChange,
}: RelationEditDialogProps) {
  const [relations, setRelations] = useState<RelationField[]>([]);
  const [labelGroups, setLabelGroups] = useState<LabelGroup[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    setRelations(
      currentRelations.map((r) => ({ id: r.id, key: r.id }))
    );

    let cancelled = false;
    getOptionsGroupedByLabel().then((data) => {
      if (!cancelled) {
        setLabelGroups(
          [...data]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((group) => ({
              ...group,
              options: [...group.options].sort((a, b) =>
                a.name.localeCompare(b.name)
              ),
            }))
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, currentRelations]);

  const addRelation = () => {
    setRelations((prev) => [...prev, { id: crypto.randomUUID(), key: "" }]);
  };

  const removeRelation = (id: string) => {
    setRelations((prev) => prev.filter((relation) => relation.id !== id));
  };

  const updateRelation = (id: string, newValue: string) => {
    setRelations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, key: newValue } : r))
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    startTransition(async () => {
      const result = await updateOptionRelations(
        optionId,
        relations.map((r) => r.key)
      );

      if (result.success) {
        toast.success(`Relations updated for "${optionName}"`);
        onOpenChange(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Relations</DialogTitle>
            <DialogDescription>
              Manage relations for &quot;{optionName}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRelation}
              disabled={relations.length > 0}
            >
              <Plus className="size-4" />
              Add Relation
            </Button>
          </div>
          {relations.length > 0 && (
            <div className="flex flex-col gap-3">
              {relations.map((relation) => (
                <div key={relation.id} className="flex items-end gap-2">
                  <Field className="flex-1">
                    <Label htmlFor={`relation-${relation.id}`}>Key</Label>
                    <Select
                      value={relation.key}
                      onValueChange={(value) =>
                        updateRelation(relation.id, value)
                      }
                    >
                      <SelectTrigger id={`relation-${relation.id}`}>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelGroups.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No options available
                          </div>
                        ) : (
                          labelGroups.map((group) => (
                            <SelectGroup key={group.id}>
                              <SelectLabel>{group.name}</SelectLabel>
                              {group.options.length === 0 ? (
                                <div className="px-6 py-1 text-xs text-muted-foreground">
                                  No options
                                </div>
                              ) : (
                                group.options.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectGroup>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRelation(relation.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />{" "}
              {isPending ? "Saving..." : "Save Relations"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
