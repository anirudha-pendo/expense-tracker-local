import { useState } from "react";
import { Download, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/shared/components/app-layout";
import { BpBox } from "@/shared/components/bp-box";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { useBudgets, type BudgetState } from "../hooks/use-budgets";
import { BudgetManager } from "../components/budget-manager";

const STATE_BAR_CLASS: Record<BudgetState, string> = {
  ok: "",
  warning: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  over: "[&_[data-slot=progress-indicator]]:bg-destructive",
};

const STATE_LABEL: Record<BudgetState, { text: string; className: string }> = {
  ok: { text: "On track", className: "text-emerald-600 dark:text-emerald-400" },
  warning: { text: "Warning", className: "text-amber-600" },
  over: { text: "Over budget", className: "text-destructive" },
};

export function BudgetsPage() {
  const { workspace } = useAuthContext();
  const { rows, isLoading } = useBudgets(workspace!.id);
  const [isExporting, setIsExporting] = useState(false);

  const currency = workspace?.currency ?? "USD";
  const locale = workspace?.locale ?? "en-US";
  const fmt = (n: number) => formatCurrency(n, currency, locale);

  function handleExportCSV() {
    if (rows.length === 0) return;
    setIsExporting(true);
    try {
      const month = new Date().toISOString().slice(0, 7);
      const header = ["Category", "Monthly Limit", "Spent", "Remaining", "% Used", "Status"];
      const csvRows = rows.map((row) => {
        const remaining = row.budget.monthlyLimit - row.spent;
        return [
          `"${row.category.name.replace(/"/g, '""')}"`,
          row.budget.monthlyLimit.toFixed(2),
          row.spent.toFixed(2),
          remaining.toFixed(2),
          Math.round(row.ratio * 100),
          row.state === "over" ? "Over Budget" : row.state === "warning" ? "Warning" : "On Track",
        ];
      });
      const csv = [header.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `budgets-${month}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Budget CSV exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  }

  const totalBudgeted = rows.reduce((s, r) => s + r.budget.monthlyLimit, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
  const overCount = rows.filter((r) => r.state === "over").length;

  const summaryCards = [
    {
      label: "Total Budgeted",
      value: fmt(totalBudgeted),
      sub: "across all categories",
      marker: "Σ",
      valueClass: "text-foreground",
    },
    {
      label: "Total Spent",
      value: fmt(totalSpent),
      sub: "this month",
      marker: "▼",
      valueClass: totalSpent > totalBudgeted ? "text-destructive" : "text-foreground",
    },
    {
      label: "Over Budget",
      value: String(overCount),
      sub: overCount === 0 ? "all categories on track" : `${overCount} categor${overCount === 1 ? "y" : "ies"} exceeded`,
      marker: overCount > 0 ? "!" : "✓",
      valueClass: overCount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <AppLayout
      title="Budgets"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isExporting || isLoading || rows.length === 0}
        >
          {isExporting ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Download data-icon="inline-start" />
          )}
          Export CSV
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Summary cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <BpBox key={i} className="p-5">
                <Skeleton className="h-3 w-16 mb-4" />
                <Skeleton className="h-7 w-28 mb-2" />
                <Skeleton className="h-2.5 w-20" />
              </BpBox>
            ))}
          </div>
        ) : rows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {summaryCards.map((card, i) => (
              <BpBox
                key={card.label}
                className="p-5 stagger-item"
                style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                    {card.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/40 select-none">
                    {card.marker}
                  </span>
                </div>
                <p className={`font-mono text-2xl font-semibold tabular-nums tracking-tight leading-none mb-2 ${card.valueClass}`}>
                  {card.value}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                  {card.sub}
                </p>
              </BpBox>
            ))}
          </div>
        ) : null}

        {/* Budget detail rows */}
        {isLoading ? (
          <BpBox>
            <div className="border-b border-border/40 px-5 py-3">
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="p-5 flex flex-col gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </BpBox>
        ) : rows.length === 0 ? (
          <BpBox className="stagger-item">
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Wallet className="size-6 text-muted-foreground/40" />
              <p className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground/60">
                No budgets set
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Use the form below to set monthly spending limits per category. You&apos;ll see progress
                here and get alerted when you&apos;re approaching or over a limit.
              </p>
            </div>
          </BpBox>
        ) : (
          <BpBox className="stagger-item">
            <div className="border-b border-border/40 px-5 py-3 flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                This Month
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/40">
                {rows.length} budget{rows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-5 flex flex-col gap-5">
              {rows.map((row) => {
                const remaining = row.budget.monthlyLimit - row.spent;
                const stateInfo = STATE_LABEL[row.state];
                return (
                  <div key={row.budget.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: row.category.color }} />
                        <span className="text-sm font-medium truncate">{row.category.name}</span>
                        <span className={`font-mono text-[10px] uppercase tracking-wider shrink-0 ${stateInfo.className}`}>
                          {stateInfo.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] tabular-nums">
                        <span className={row.state === "over" ? "text-destructive font-semibold" : "text-foreground"}>
                          {fmt(row.spent)}
                        </span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-muted-foreground">{fmt(row.budget.monthlyLimit)}</span>
                      </div>
                    </div>

                    <Progress value={Math.min(row.ratio * 100, 100)} className={STATE_BAR_CLASS[row.state]} />

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {Math.round(row.ratio * 100)}% used
                      </span>
                      {row.state === "over" ? (
                        <span className="font-mono text-[10px] text-destructive tracking-wider">
                          over by {fmt(Math.abs(remaining))}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground/50">
                          {fmt(remaining)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </BpBox>
        )}

        {/* Manage limits */}
        <BpBox className="stagger-item">
          <div className="border-b border-border/40 px-5 py-3 flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
              Manage Limits
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/40">monthly</span>
          </div>
          <div className="p-5">
            <BudgetManager />
          </div>
        </BpBox>
      </div>
    </AppLayout>
  );
}
