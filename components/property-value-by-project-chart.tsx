"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  totalValue: {
    label: "Total Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ProjectValueData {
  project: string;
  totalValue: number;
  itemCount: number;
}

interface PropertyValueByProjectChartProps {
  data: ProjectValueData[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data: ProjectValueData = payload[0].payload;

  return (
    <div className="border bg-background p-2.5 shadow-sm text-xs min-w-42.5">
      <div className="font-medium mb-1.5">{data.project}</div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Total Value</span>
        <span className="font-mono font-medium">
          ₱{data.totalValue.toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Items</span>
        <span className="font-mono font-medium">{data.itemCount}</span>
      </div>
    </div>
  );
}

export function PropertyValueByProjectChart({
  data,
}: PropertyValueByProjectChartProps) {
  const totalValue = data.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Total Value by Project</CardTitle>
          <CardDescription>
            Estimated cost breakdown across projects
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-col w-full justify-center gap-1 border-t px-4 py-4 text-left sm:border-t-0 sm:border-l sm:px-4 sm:py-6">
            <span className="text-xs text-muted-foreground">Total Value</span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              ₱{totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 0, top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="project"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              textAnchor="middle"
              height={70}
              interval={0}
            />
            <YAxis
              hide
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25) || 1]}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="totalValue" fill="var(--color-totalValue)" radius={0}>
              <LabelList
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={11}
                formatter={(value) =>
                  `₱${(Number(value) / 1000).toFixed(0)}k`
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
