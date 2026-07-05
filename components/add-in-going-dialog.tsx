"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { CalendarIcon, Plus, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { getLabels } from "@/app/actions/label-action";
import { getOptionsForLabel } from "@/lib/label-utils";
import type { Label as LabelType } from "@/lib/types";
import { LabelSelectField } from "./label-select-field";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";

export default function AddInGoingLetterDialog() {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [letterName, setLetterName] = useState("");
  const [bureauOptionId, setBureauOptionId] = useState("");
  const [receivedDate, setReceivedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      getLabels().then(setLabels);
    }
  }, [open]);

  const bureauOptions = getOptionsForLabel(labels, "bureau");
  const statusOptions = getOptionsForLabel(labels, "status");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!letterName.trim()) {
      toast.error("Letter name is required");
      return;
    }

    // TODO: wire this up to a server action (e.g. addInGoingLetter) once the
    // Letter model + file storage approach is decided, following the same
    // pattern as addSupply / addActivity elsewhere in the app.
    console.log({
      letterName,
      bureauOptionId,
      receivedDate,
      status,
      response,
      file,
    });

    toast.success("Letter added (stub — not yet saved)");
    setLetterName("");
    setBureauOptionId("");
    setReceivedDate(new Date());
    setStatus("");
    setResponse("");
    setFile(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4" /> Add In-Going Letter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add In-Going Letter</DialogTitle>
            <DialogDescription>
              Record a new incoming letter for tracking.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="letter-file">Letter File</FieldLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" /> Browse file
                </Button>
                <span className="text-xs text-muted-foreground truncate">
                  {file ? file.name : "No file selected"}
                </span>
              </div>
              <Input
                id="letter-file"
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <FieldDescription>
                Select a picture or pdf to upload.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="letter-name">Letter Name</FieldLabel>
              <Input
                id="letter-name"
                value={letterName}
                onChange={(e) => setLetterName(e.target.value)}
                placeholder="e.g. Request for Training Support"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="letter-type">Letter Type</FieldLabel>
              <LabelSelectField
                id="letter-type"
                value={bureauOptionId}
                onValueChange={setBureauOptionId}
                options={bureauOptions}
                placeholder="Select a type"
                emptyLabel="No bureaus available"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="letter-bureau">Bureau</FieldLabel>
              <LabelSelectField
                id="letter-bureau"
                value={bureauOptionId}
                onValueChange={setBureauOptionId}
                options={bureauOptions}
                placeholder="Select a bureau"
                emptyLabel="No bureaus available"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="letter-received">Received</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="letter-received"
                    className="justify-start px-2.5 font-normal"
                  >
                    <CalendarIcon />
                    {receivedDate ? (
                      format(receivedDate, "LLL dd, y")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={receivedDate}
                    onSelect={setReceivedDate}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <div className="flex flex-row items-center gap-2">
              <Checkbox /> No response needed?
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
