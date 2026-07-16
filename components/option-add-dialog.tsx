"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, Upload, X } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
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
  addOption,
  getOptionsGroupedByLabel,
} from "@/app/actions/option-actions";
import { toast } from "sonner";
import { LabelGroup, RelationField } from "@/lib/types";

export default function OptionAddDialog({ labelId }: { labelId: string }) {
  const [open, setOpen] = useState(false);
  const [optionName, setOptionName] = useState("");
  const [relations, setRelations] = useState<RelationField[]>([]);
  const [labelGroups, setLabelGroups] = useState<LabelGroup[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    getOptionsGroupedByLabel(labelId).then((data) => {
      if (!cancelled) setLabelGroups(data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, labelId]);

  const addRelation = () => {
    setRelations((prev) => [...prev, { id: crypto.randomUUID(), key: "" }]);
  };

  const removeRelation = (id: string) => {
    setRelations((prev) => prev.filter((relation) => relation.id !== id));
  };

  const updateRelation = (id: string, newValue: string) => {
    setRelations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, key: newValue } : r)),
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    startTransition(async () => {
      const result = await addOption(
        labelId,
        optionName,
        relations.map((r) => r.key),
      );

      if (result.success) {
        toast.success(`"${optionName}" added`);
        setOptionName("");
        setRelations([]);
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4" /> Add Option
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add Option</DialogTitle>
          <DialogDescription>
            Add a new option to your account settings.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="optionName">Option Name</FieldLabel>
            <Input
              id="optionName"
              placeholder="Enter option name"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
            />
          </Field>
        </FieldGroup>
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
        <div className="mt-4 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !optionName.trim()}
          >
            <Upload className="h-4 w-4" />{" "}
            {isPending ? "Saving..." : "Save Option"}
          </Button>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
