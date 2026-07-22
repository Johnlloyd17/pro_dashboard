"use client";

import { Pie, PieChart } from "recharts";
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

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface ClassificationData {
  classification: string;
  count: number;
}

interface PropertyClassificationChartProps {
  data: ClassificationData[];
}

const RADIAN = Math.PI / 180;

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  value: number;
}

function renderInsideLabel(props: unknown) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } =
    props as PieLabelProps;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
      fill="white"
    >
      {value}
    </text>
  );
}

export function PropertyClassificationChart({
  data,
}: PropertyClassificationChartProps) {
  const chartData = data.map((item, index) => ({
    classification: item.classification,
    count: item.count,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const chartConfig = data.reduce((config, item, index) => {
    config[item.classification] = {
      label: item.classification,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return config;
  }, {} as ChartConfig);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const topClassification = [...data].sort((a, b) => b.count - a.count)[0];
  const topPercent =
    topClassification && total > 0
      ? ((topClassification.count / total) * 100).toFixed(1)
      : "0";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Items by Classification</CardTitle>
        <CardDescription>
          Distribution of property items by type
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5 pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="classification"
              label={renderInsideLabel}
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      {topClassification && (
        <div className="flex items-center justify-center gap-2 pb-4 text-xs text-muted-foreground">
          <span>Top:</span>
          <span className="font-medium text-foreground">
            {topClassification.classification}
          </span>
          <span>({topPercent}%)</span>
        </div>
      )}
    </Card>
  );
}
