import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { EllipsisVertical, Plus } from "lucide-react";
import { PaginationComponent } from "./pagination";
import AddInGoingLetterDialog from "./add-in-going-dialog";

export default function InGoingLetters() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Letter ID</TableHead>
              <TableHead>Letter File</TableHead>
              <TableHead>Letter Name</TableHead>
              <TableHead>Letter Type</TableHead>
              <TableHead>Bureau</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell>sda</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost">
                  <EllipsisVertical className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center w-full min-w-0">
        <div className="flex flex-row items-center gap-2">
          <AddInGoingLetterDialog />
        </div>
        {/* <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
        /> */}
      </div>
    </div>
  );
}
