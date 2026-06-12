import { TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReportSummary, MonthComparison } from "../hooks/use-reports";

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  comparison: MonthComparison;
  currency: string;
  locale: string;
  isLoading: boolean;
}

function ChangeIndicator({ pct }: { pct: number }) {
  const abs = Math.abs(pct);
  if (abs < 0.5) return <Minus className="size-3 text-muted-foreground" />;
  const up = pct > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-xs font-medium", up ? "text-emerald-500" : "text-red-500")}>
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {abs.toFixed(1)}%
    </span>
  );
}

interface CardDef {
  label: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  valueClass?: string;
  subtext?: string;
  invertChange?: boolean;
}

export function ReportSummaryCards({ summary, comparison, currency, locale, isLoading }: ReportSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      label: "Total Income",
      value: summary.totalIncome,
      change: comparison.incomeChange,
      icon: <TrendingUp className="size-4 text-emerald-500" />,
      valueClass: "text-emerald-500",
    },
    {
      label: "Total Expenses",
      value: summary.totalExpenses,
      change: comparison.expensesChange,
      icon: <TrendingDown className="size-4 text-red-500" />,
      valueClass: "text-red-500",
      invertChange: true,
    },
    {
      label: "Net Balance",
      value: summary.netBalance,
      icon: <Minus className="size-4 text-primary" />,
      valueClass: summary.netBalance >= 0 ? "text-emerald-500" : "text-red-500",
    },
    {
      label: "Avg Daily Spend",
      value: summary.avgDailySpend,
      icon: <TrendingDown className="size-4 text-muted-foreground" />,
      subtext: `${summary.transactionCount} transactions`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
              {card.icon}
            </div>
            <p className={cn("text-xl font-semibold tabular-nums", card.valueClass)}>
              {formatCurrency(card.value, currency, locale)}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {card.change !== undefined && (
                <>
                  <ChangeIndicator pct={card.invertChange ? -card.change : card.change} />
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </>
              )}
              {card.subtext && (
                <span className="text-xs text-muted-foreground">{card.subtext}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
