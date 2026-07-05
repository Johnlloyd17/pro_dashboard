"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ModeOfImplementationData } from "@/lib/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface ChartModeOfImplementationProps {
  data: ModeOfImplementationData[];
}

export function ChartModeOfImplementation({
  data,
}: ChartModeOfImplementationProps) {
  const chartData = data.map((item, index) => ({
    mode: item.mode,
    count: item.count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const chartConfig = data.reduce((config, item, index) => {
    config[item.mode] = {
      label: item.mode,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return config;
  }, {} as ChartConfig);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const topMode = [...data].sort((a, b) => b.count - a.count)[0];
  const topModePercent =
    topMode && total > 0 ? ((topMode.count / total) * 100).toFixed(1) : "0";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Mode of Implementation</CardTitle>
        <CardDescription>
          Breakdown of activities by delivery mode
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5 pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="mode" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
