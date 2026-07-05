"use client";

import { useEffect, useState, useTransition } from "react";
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
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { GitPullRequest } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getSupplies } from "@/app/actions/supply-actions";
import { releaseSupply } from "@/app/actions/released-supply-actions";
import { toast } from "sonner";

interface SupplySummary {
  id: string;
  name: string;
  stockQuantity: number;
}

export default function RequestSupplyDialog() {
  const [open, setOpen] = useState(false);
  const [supplies, setSupplies] = useState<SupplySummary[]>([]);
  const [supplyId, setSupplyId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [requesteeName, setRequesteeName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      getSupplies().then((result) => setSupplies(result.supplies));
    }
  }, [open]);

  const selectedSupply = supplies.find((s) => s.id === supplyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await releaseSupply({
        supplyId,
        releasedQuantity: Number(quantity) || 0,
        requesteeName,
      });

      if (result.success) {
        toast.success("Supply released");
        setSupplyId("");
        setQuantity("");
        setRequesteeName("");
        setOpen(false);
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <GitPullRequest className="w-4 h-4" /> Request for Supply
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request for Supply</DialogTitle>
            <DialogDescription>
              Release a supply item to a requestee.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="release-supply">Supply</FieldLabel>
              <Select value={supplyId} onValueChange={setSupplyId}>
                <SelectTrigger id="release-supply">
                  <SelectValue placeholder="Select a supply" />
                </SelectTrigger>
                <SelectContent>
                  {supplies.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No supplies available
                    </div>
                  ) : (
                    supplies.map((supply) => (
                      <SelectItem key={supply.id} value={supply.id}>
                        {supply.name} ({supply.stockQuantity} in stock)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="release-quantity">Quantity</FieldLabel>
              <Input
                id="release-quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                max={selectedSupply?.stockQuantity}
              />
              {selectedSupply && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSupply.stockQuantity} available
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="release-requestee">
                Name of Requestee
              </FieldLabel>
              <Input
                id="release-requestee"
                value={requesteeName}
                onChange={(e) => setRequesteeName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !supplyId}>
              {isPending ? "Releasing..." : "Release"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
