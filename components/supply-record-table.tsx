import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { PaginationComponent } from "./pagination";
import { format } from "date-fns";

interface RecordItem {
  id: string;
  time: Date;
  description: string;
}

interface SupplyRecordTableProps {
  records: RecordItem[];
  currentPage: number;
  totalPages: number;
}

export default function SupplyRecordTable({
  records,
  currentPage,
  totalPages,
}: SupplyRecordTableProps) {
  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <div className="w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-25">Record ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  No records yet.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium py-4">
                    {record.id.slice(0, 12)}
                  </TableCell>
                  <TableCell>
                    {format(record.time, "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>{record.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center w-full min-w-0">
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
