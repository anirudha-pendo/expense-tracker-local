import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import type { CategorySpend } from "../hooks/use-reports";

interface CategoryBreakdownChartProps {
  data: CategorySpend[];
  currency: string;
  locale: string;
  isLoading: boolean;
}

export function CategoryBreakdownChart({ data, currency, locale, isLoading }: CategoryBreakdownChartProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No expense data for this month</p>
        ) : (
          <div className="space-y-3">
            {data.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm truncate">{cat.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {cat.transactionCount}×
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-muted-foreground">
                      {cat.percentage.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(cat.amount, currency, locale)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
