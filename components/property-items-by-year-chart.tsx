"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  count: {
    label: "Items Acquired",
  },
  bar: {
    label: "Items",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface YearData {
  year: string;
  count: number;
}

interface PropertyItemsByYearChartProps {
  data: YearData[];
}

export function PropertyItemsByYearChart({
  data,
}: PropertyItemsByYearChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const peakYear = [...data].sort((a, b) => b.count - a.count)[0];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Items Acquired by Year</CardTitle>
        <CardDescription>
          Distribution of property acquisitions over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              hide
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25) || 1]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-bar)" radius={0}>
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={
                    peakYear && entry.year === peakYear.year
                      ? "var(--chart-1)"
                      : "var(--chart-2)"
                  }
                />
              ))}
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <div className="flex items-center justify-center gap-2 pb-4 text-xs text-muted-foreground">
        <span>Total acquisitions:</span>
        <span className="font-medium text-foreground">{total}</span>
        {peakYear && (
          <>
            <span>· Peak year:</span>
            <span className="font-medium text-foreground">
              {peakYear.year}
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
