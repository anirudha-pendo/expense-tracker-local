import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReportTransaction } from "../hooks/use-reports";

interface ReportTransactionsListProps {
  transactions: ReportTransaction[];
  currency: string;
  locale: string;
  isLoading: boolean;
}

const PAGE_SIZE = 10;

export function ReportTransactionsList({ transactions, currency, locale, isLoading }: ReportTransactionsListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? transactions : transactions.slice(0, PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {transactions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0 divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No transactions this month</p>
        ) : (
          <>
            <div className="divide-y">
              {visible.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div
                    className="size-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: tx.categoryColor }}
                  >
                    {tx.categoryName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || tx.categoryName}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.categoryName} · {formatDate(tx.date, locale)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums shrink-0",
                      tx.type === "income" ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount, currency, locale)}
                  </span>
                </div>
              ))}
            </div>
            {transactions.length > PAGE_SIZE && (
              <div className="px-4 py-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowAll((p) => !p)}
                >
                  {showAll ? "Show less" : `Show all ${transactions.length} transactions`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
