import {
  getCybersecurityOverviewStats,
  getCompletedActivitiesByMunicipality,
  getGenderDemographics,
  getModeOfImplementationBreakdown,
  getTargetAccomplishments,
} from '@/app/actions/activity-actions';
import { ActivityMap } from '@/components/activity-map';
import { ChartDemographics } from '@/components/chart-demographics';
import { ChartModeOfImplementation } from '@/components/chart-mode-implementation';
import { CompletedActivitiesChart } from '@/components/completed-activities-chart';
import { DataTableProjects } from '@/components/data-table-projects';
import FilterTerm from '@/components/filter-term';
import { OverviewStatCards } from '@/components/overview-stat-cards';
import { TargetAnalyticsGrid } from '@/components/target-analytics-grid';
import { TargetsDialog } from '@/components/targets-dialog';
import {
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ViewTargets from '@/components/view-targets';
import { Suspense } from 'react';

export default async function GecsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    year?: string;
    semester?: string;
    project?: string;
    stat?: string;
  }>;
}) {
  const params = await searchParams;
  const overviewStats = await getCybersecurityOverviewStats(
    'GECS',
    params.year,
    params.semester,
  );

  const topRowCards = [
    {
      id: 'total-activities',
      title: 'Total Activities',
      value: overviewStats.totalActivities,
      description: 'All recorded activities.',
    },
    {
      id: 'total-municipalities',
      title: 'Total Municipalities',
      value: overviewStats.totalMunicipalities,
      description: 'Municipalities covered.',
    },
    {
      id: 'total-barangays',
      title: 'Total Barangay',
      value: overviewStats.totalBarangays,
      description: 'Barangays reached.',
    },
    {
      id: 'gecs-total',
      title: 'GECS Total',
      value: overviewStats.totalCompleters,
      description: 'Total participants reached.',
    },
  ];

  const bottomRowCards = [
    {
      id: 'planned-activities',
      title: 'Planned Activities',
      value: overviewStats.plannedActivities,
      description: 'Activities yet to be completed.',
    },
    {
      id: 'total-completers',
      title: 'Total Completers',
      value: overviewStats.totalCompleters,
      description: 'Total participants reached.',
    },
    {
      id: 'male-completers',
      title: 'Male Completers',
      value: overviewStats.maleCompleters,
      description: 'Male participants reached.',
    },
    {
      id: 'female-completers',
      title: 'Female Completers',
      value: overviewStats.femaleCompleters,
      description: 'Female participants reached.',
    },
  ];

  const municipalityData = await getCompletedActivitiesByMunicipality(
    'GECS',
    params.year,
    params.semester,
    params.project,
  );
  const genderData = await getGenderDemographics(
    'GECS',
    params.year,
    params.semester,
    params.project,
  );
  const modeData = await getModeOfImplementationBreakdown(
    'GECS',
    params.year,
    params.semester,
    params.project,
  );
  const targetData = await getTargetAccomplishments(
    'GECS',
    params.year,
    params.semester,
  );

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-row justify-between items-end'>
        <div>
          <CardTitle className='text-xl'>GECS Metrics</CardTitle>
          <CardDescription>
            Monitor and evaluate government e-commerce systems, digital
            transactions, and online service delivery across the province.
          </CardDescription>
        </div>
        <div className='flex flex-row gap-2'>
          <ViewTargets bureauName='GECS' />
          <TargetsDialog />
          <FilterTerm />
        </div>
      </div>
      <Suspense>
        <OverviewStatCards topRow={topRowCards} bottomRow={bottomRowCards} />
      </Suspense>
      <Tabs defaultValue='overview' className='w-full col-span-4'>
        <TabsList className='flex flex-row gap-2'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='map'>Map</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>
          <DataTableProjects bureauName='GECS' searchParams={params} />
        </TabsContent>
        <TabsContent value='map'>
          <ActivityMap
            district1={municipalityData.district1}
            district2={municipalityData.district2}
          />
        </TabsContent>
        <TabsContent value='analytics' className='flex flex-col gap-4'>
          <TargetAnalyticsGrid targetData={targetData} />

          <CompletedActivitiesChart
            district1={municipalityData.district1}
            district2={municipalityData.district2}
          />
          <div className='grid grid-cols-4 gap-4'>
            <ChartDemographics data={genderData} />
            <ChartModeOfImplementation data={modeData} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
