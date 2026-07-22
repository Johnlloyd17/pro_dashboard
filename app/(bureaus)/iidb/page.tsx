import {
  getActivityStats,
  getCompletedActivitiesByMunicipality,
  getGenderDemographics,
  getModeOfImplementationBreakdown,
  getOverallTargetAchievementRate,
  getTargetAccomplishments,
} from '@/app/actions/activity-actions';
import { ActivityMap } from '@/components/activity-map';
import { ChartDemographics } from '@/components/chart-demographics';
import { ChartModeOfImplementation } from '@/components/chart-mode-implementation';
import { CompletedActivitiesChart } from '@/components/completed-activities-chart';
import { DataTableProjects } from '@/components/data-table-projects';
import FilterTerm from '@/components/filter-term';
import { TargetChartCard } from '@/components/target-chart-card';
import { TargetsDialog } from '@/components/targets-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ViewTargets from '@/components/view-targets';

export default async function IidbPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; year?: string; semester?: string }>;
}) {
  const params = await searchParams;
  const stats = await getActivityStats('IIDB', params.year, params.semester);

  const achievementRate = await getOverallTargetAchievementRate(
    'IIDB',
    params.year,
    params.semester,
  );

  const iidbData = [
    {
      id: 'completed-activities',
      title: 'Completed Activities',
      value: stats.completedCount,
      description: 'Activities completed to date.',
    },
    {
      id: 'upcoming-activities',
      title: 'Upcoming Activities',
      value: stats.upcomingCount,
      description: 'Activities scheduled ahead.',
    },
    {
      id: 'total-participants',
      title: 'Total Participants',
      value: stats.totalParticipants,
      description: 'Participants reached so far.',
    },
    {
      id: 'achievement-rate',
      title: 'Target Achievement Rate',
      value: achievementRate !== null ? `${achievementRate}%` : '—',
      description:
        achievementRate !== null
          ? 'Average progress across all set targets.'
          : 'No targets set yet.',
    },
  ];

  const municipalityData = await getCompletedActivitiesByMunicipality(
    'IIDB',
    params.year,
    params.semester,
  );
  const genderData = await getGenderDemographics(
    'IIDB',
    params.year,
    params.semester,
  );
  const modeData = await getModeOfImplementationBreakdown(
    'IIDB',
    params.year,
    params.semester,
  );
  const targetData = await getTargetAccomplishments(
    'IIDB',
    params.year,
    params.semester,
  );

  return (
    <main className='flex flex-col gap-4'>
      <div className='flex flex-row justify-between items-end'>
        <div>
          <CardTitle className='text-xl'>IIDB Metrics</CardTitle>
          <CardDescription>
            Monitor your organization&apos;s performance and compliance.
          </CardDescription>
        </div>
        <div className='flex flex-row gap-2'>
          <ViewTargets bureauName='IIDB' />
          <TargetsDialog />
          <FilterTerm />
        </div>
      </div>
      <div className='grid grid-cols-4 gap-4'>
        {iidbData.map((item) => (
          <Card key={item.id} className='col-span-1'>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardTitle className='text-3xl'>{item.value}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue='overview' className='w-full col-span-4'>
        <TabsList className='flex flex-row gap-2'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='map'>Map</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>
          <DataTableProjects bureauName='IIDB' searchParams={params} />
        </TabsContent>
        <TabsContent value='map'>
          <ActivityMap
            district1={municipalityData.district1}
            district2={municipalityData.district2}
          />
        </TabsContent>
        <TabsContent value='analytics' className='flex flex-col gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {targetData.length === 0 ? (
              <p className='text-sm text-muted-foreground col-span-full text-center py-8'>
                No targets set yet for this bureau.
              </p>
            ) : (
              targetData.map((t, index) => (
                <TargetChartCard
                  key={index}
                  indicator={t.indicator}
                  semester={t.semester}
                  target={t.target1stDistrict + t.target2ndDistrict}
                  accomplished={t.accomplished1st + t.accomplished2nd}
                  projectName={t.projectName}
                />
              ))
            )}
          </div>
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
