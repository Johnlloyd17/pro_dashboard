"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { PaginationComponent } from "./pagination";
import { Button } from "./ui/button";
import { EllipsisVertical, Trash, X } from "lucide-react";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import RequestSupplyDialog from "./request-supply-dialog";
import { deleteReleasedSupply } from "@/app/actions/released-supply-actions";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReleasedSupplyItem {
  id: string;
  releasedQuantity: number;
  releasedDate: Date;
  requesteeName: string;
  supply: {
    id: string;
    name: string;
    size: string | null;
    category: { id: string; name: string } | null;
  };
}

interface ReleasedSupplyTableProps {
  releases: ReleasedSupplyItem[];
  currentSearch: string;
  currentPage: number;
  totalPages: number;
}

export default function ReleasedSupplyTable({
  releases,
  currentSearch,
  currentPage,
  totalPages,
}: ReleasedSupplyTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [isPending, startTransition] = useTransition();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (!("page" in updates)) {
      params.set("page", "1");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    updateParams({ releasedSearch: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("releasedSearch");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDelete = (id: string, supplyName: string) => {
    startTransition(async () => {
      const result = await deleteReleasedSupply(id);
      if (result.success) {
        toast.success(
          `Release record for "${supplyName}" removed, stock restored`,
        );
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <div className="flex flex-row items-center gap-2">
        <Field orientation="horizontal" className="w-80">
          <Input
            type="search"
            placeholder="Search supply or requestee..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button onClick={handleSearch}>Search</Button>
        </Field>
        {currentSearch && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="w-4 h-4" /> Clear
          </Button>
        )}
      </div>
      <div className="w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-25">Supply ID</TableHead>
              <TableHead>Supply Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Released Quantity</TableHead>
              <TableHead>Released Date</TableHead>
              <TableHead>Name of Requestee</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  {currentSearch
                    ? "No release records match your search."
                    : "No supplies have been released yet."}
                </TableCell>
              </TableRow>
            ) : (
              releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="font-medium py-4">
                    {release.supply.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{release.supply.name}</TableCell>
                  <TableCell>{release.supply.size ?? "—"}</TableCell>
                  <TableCell>{release.supply.category?.name ?? "—"}</TableCell>
                  <TableCell>{release.releasedQuantity}</TableCell>
                  <TableCell>
                    {format(release.releasedDate, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{release.requesteeName}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" disabled={isPending}>
                          <EllipsisVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              handleDelete(release.id, release.supply.name)
                            }
                          >
                            <Trash className="w-4 h-4 text-destructive" />{" "}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center w-full min-w-0">
        <div>
          <RequestSupplyDialog />
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
