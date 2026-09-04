import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { DailySpend } from "../hooks/use-reports";

interface DailySpendChartProps {
  data: DailySpend[];
  currency: string;
  locale: string;
  isLoading: boolean;
}

export function DailySpendChart({ data, currency, locale, isLoading }: DailySpendChartProps) {
  const hasData = data.some((d) => d.expenses > 0 || d.income > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !hasData ? (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions this month</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={6} barGap={2}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={4}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const entry = data.find((d) => d.day === label);
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                      <p className="font-medium mb-1">{entry?.date ?? label}</p>
                      {payload.map((p) => (
                        <div key={String(p.dataKey)} className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-muted-foreground capitalize">{String(p.dataKey)}:</span>
                          <span className="font-medium">
                            {formatCurrency(Number(p.value), currency, locale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
