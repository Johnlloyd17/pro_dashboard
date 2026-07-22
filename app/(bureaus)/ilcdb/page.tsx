import {
  getActivitiesForCalendar,
  getActivityStats,
  getCompletedActivitiesByMunicipality,
  getGenderDemographics,
  getIlcdbHighlights,
  getModeOfImplementationBreakdown,
  getTargetAccomplishments,
} from "@/app/actions/activity-actions";
import { ActivityCalendar } from "@/components/activity-calendar";
import { ActivityMap } from "@/components/activity-map";
import { ChartDemographics } from "@/components/chart-demographics";
import { ChartModeOfImplementation } from "@/components/chart-mode-implementation";
import { CompletedActivitiesChart } from "@/components/completed-activities-chart";
import { DataTableProjects } from "@/components/data-table-projects";
import FilterTerm from "@/components/filter-term";
import { getCurrentTerm } from "@/lib/term";
import { TargetAnalyticsGrid } from "@/components/target-analytics-grid";
import { TargetsDialog } from "@/components/targets-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTargets from "@/components/view-targets";

export default async function ILCDBPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    year?: string;
    semester?: string;
    project?: string;
  }>;
}) {
  const params = await searchParams;
  const currentTerm = getCurrentTerm();
  const filterYear = params.year ?? String(currentTerm.year);
  const filterSemester = params.semester ?? currentTerm.semester;
  const stats = await getActivityStats("ILCDB", filterYear, filterSemester);
  const highlights = await getIlcdbHighlights(filterYear, filterSemester);

  const ilcdbData = [
    {
      id: "completed-activities",
      title: "Completed Activities",
      value: stats.completedCount,
      description: "Activities completed to date.",
    },
    {
      id: "upcoming-activities",
      title: "Upcoming Activities",
      value: stats.upcomingCount,
      description: "Activities scheduled ahead.",
    },
    {
      id: "center-users-served",
      title: "Tech4ED Center Users Served",
      value: highlights.centerUsersServed,
      description: "Users served across the digital transformation centers.",
    },
    {
      id: "skills-gap-surveys",
      title: "ICT Skills Gap Analysis Surveys",
      value: highlights.skillsGapSurveys,
      description: "Surveys conducted under EPMD.",
    },
    {
      id: "dlt-conducted",
      title: "Digital Literacy Trainings Conducted",
      value: highlights.dltConducted,
      description:
        "Digital literacy trainings and advocacy programs at Tech4ED centers.",
    },
    {
      id: "dwia-trainings",
      title: "DWIA Trainings Conducted",
      value: highlights.dwiaTrainings,
      description: "Digital workforce trainings under TMD.",
    },
    {
      id: "certification-exams",
      title: "Certification Exams Conducted",
      value: highlights.certificationExams,
      description: "Competency-based examinations under C3D2.",
    },
    {
      id: "individuals-trained",
      title: "SPARK Individuals Trained",
      value: highlights.individualsTrained,
      description: "Trained through SPARK technical trainings.",
    },
  ];

  const municipalityData = await getCompletedActivitiesByMunicipality(
    "ILCDB",
    filterYear,
    filterSemester,
    params.project,
  );
  const genderData = await getGenderDemographics(
    "ILCDB",
    filterYear,
    filterSemester,
    params.project,
  );
  const modeData = await getModeOfImplementationBreakdown(
    "ILCDB",
    filterYear,
    filterSemester,
    params.project,
  );
  const targetData = await getTargetAccomplishments(
    "ILCDB",
    filterYear,
    filterSemester,
  );
  const calendarData = await getActivitiesForCalendar("ILCDB");

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-end">
        <div>
          <CardTitle className="text-xl">ILCDB Bureau</CardTitle>
          <CardDescription>
            Monitor digital literacy, inclusion, and capability-building
            programs across the province.
          </CardDescription>
        </div>
        <div className="flex flex-row gap-2">
          <ViewTargets bureauName="ILCDB" />
          <TargetsDialog />
          <FilterTerm />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {ilcdbData.map((item) => (
          <Card key={item.id} className="col-span-1">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="analytics" className="w-full col-span-4">
        <TabsList className="flex flex-row gap-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="activities">
          <DataTableProjects
            bureauName="ILCDB"
            searchParams={{
              ...params,
              year: filterYear,
              semester: filterSemester,
            }}
          />
        </TabsContent>
        <TabsContent value="map">
          <ActivityMap
            district1={municipalityData.district1}
            district2={municipalityData.district2}
          />
        </TabsContent>
        <TabsContent value="analytics" className="flex flex-col gap-4">
          <TargetAnalyticsGrid targetData={targetData} />

          <CompletedActivitiesChart
            district1={municipalityData.district1}
            district2={municipalityData.district2}
          />
          <div className="grid grid-cols-4 gap-4">
            <ChartDemographics data={genderData} />
            <ChartModeOfImplementation data={modeData} />
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <ActivityCalendar activities={calendarData} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
