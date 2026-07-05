import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PaginationComponent } from "./pagination";
import AddDialog from "./add-dialog";
import { Button } from "./ui/button";
import { EllipsisVertical, Import } from "lucide-react";
import { Badge } from "./ui/badge";
import { getActivities } from "@/app/actions/activity-actions";
import { format } from "date-fns";
import TableActions from "./table-actions";
import { DataTableProjectsProps } from "@/lib/types";

export async function DataTableProjects({
  bureauName,
  searchParams,
}: DataTableProjectsProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const { activities, totalPages } = await getActivities(
    bureauName,
    currentPage,
  );

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <div className="w-full min-w-0 overflow-x-auto border rounded-base custom-scrollbar">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="w-25">Activity ID</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Bureau</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Indicator</TableHead>
              <TableHead>Activity Name</TableHead>
              <TableHead>Activity Venue</TableHead>
              <TableHead>District</TableHead>
              <TableHead>City/Municipality</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Requesting Agency</TableHead>
              <TableHead>Mode of Implementation</TableHead>
              <TableHead>Target Sector</TableHead>
              <TableHead>Responsible Person</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Female</TableHead>
              <TableHead>Male</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={19}
                  className="text-center text-muted-foreground py-8"
                >
                  No activities yet. Click "Add Data" to create one.
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium py-4">
                    {activity.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="w-40">
                    {activity.dateFrom
                      ? activity.dateTo
                        ? `${format(activity.dateFrom, "MMM d")} - ${format(activity.dateTo, "MMM d, yyyy")}`
                        : format(activity.dateFrom, "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="w-36">
                    {activity.bureau ? (
                      <Badge className="rounded-full">
                        {activity.bureau.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="w-36">
                    {activity.project ? (
                      <Badge className="rounded-full" variant="outline">
                        {activity.project.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="w-36">
                    {activity.indicator ?? "—"}
                  </TableCell>
                  <TableCell className="w-100">
                    {activity.activityName}
                  </TableCell>
                  <TableCell>{activity.activityVenue ?? "—"}</TableCell>
                  <TableCell>
                    {activity.district ? (
                      <Badge className="rounded-full" variant="outline">
                        {activity.district.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{activity.municipality?.name ?? "—"}</TableCell>
                  <TableCell>{activity.barangay ?? "—"}</TableCell>
                  <TableCell>
                    {activity.requestingAgency?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    {activity.modeOfImplementation ? (
                      <Badge className="rounded-full">
                        {activity.modeOfImplementation.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-40">
                    <span className="block truncate">
                      {activity.targetSectors.length > 0
                        ? activity.targetSectors
                            .map((t) => t.option.name)
                            .join(", ")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-40">
                    <span className="block truncate">
                      {activity.responsiblePersons.length > 0
                        ? activity.responsiblePersons
                            .map((r) => r.option.name)
                            .join(", ")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {activity.status ? (
                      <Badge className="rounded-full">
                        {activity.status.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {activity.femaleCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {activity.maleCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {activity.totalCount}
                  </TableCell>
                  <TableCell className="text-right w-20">
                    <TableActions
                      activityId={activity.id}
                      activityName={activity.activityName}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center w-full min-w-0">
        <div className="flex flex-row items-center gap-2">
          <AddDialog />
          <Button variant="outline">
            <Import className="h-4 w-4" /> Import Data
          </Button>
        </div>
        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
