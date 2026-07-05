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
import { Badge } from "./ui/badge";
import { Eye, Trash } from "lucide-react";
import { getTargets, deleteTarget } from "@/app/actions/target-actions";
import { toast } from "sonner";

interface TargetItem {
  id: string;
  name: string;
  value: number;
  semester: string;
  bureau: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  } | null;
}

interface ViewTargetsProps {
  bureauName: string;
}

export default function ViewTargets({ bureauName }: ViewTargetsProps) {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getTargets(bureauName).then(setTargets);
    }
  }, [open, bureauName]);

  const handleDelete = (id: string, name: string) => {
    startTransition(async () => {
      const result = await deleteTarget(id);
      if (result.success) {
        toast.success(`"${name}" removed`);
        setTargets((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="w-4 h-4" /> View Targets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Targets</DialogTitle>
          <DialogDescription>
            Targets currently set for {bureauName} bureau.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {targets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No targets have been added yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between border px-3 py-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium">{target.name}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">Target: {target.value}</Badge>
                      <Badge variant="outline">
                        {target.semester === "1st"
                          ? "1st Semester"
                          : "2nd Semester"}
                      </Badge>
                      {target.project && (
                        <Badge variant="outline">{target.project.name}</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleDelete(target.id, target.name)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
