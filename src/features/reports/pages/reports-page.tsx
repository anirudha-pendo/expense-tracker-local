import { useState } from "react";
import { AppLayout } from "@/shared/components/app-layout";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { useReports } from "../hooks/use-reports";
import { MonthSelector } from "../components/month-selector";
import { ReportSummaryCards } from "../components/report-summary-cards";
import { CategoryBreakdownChart } from "../components/category-breakdown-chart";
import { DailySpendChart } from "../components/daily-spend-chart";
import { ReportTransactionsList } from "../components/report-transactions-list";

export function ReportsPage() {
  const { workspace } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const currency = workspace?.currency ?? "USD";
  const locale = workspace?.locale ?? "en-US";

  const report = useReports(workspace!.id, selectedDate);

  return (
    <AppLayout
      title="Reports"
      actions={
        <MonthSelector value={selectedDate} onChange={setSelectedDate} />
      }
    >
      <div className="flex flex-col gap-6">
        <ReportSummaryCards
          summary={report.summary}
          comparison={report.comparison}
          currency={currency}
          locale={locale}
          isLoading={report.isLoading}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DailySpendChart
            data={report.dailySpend}
            currency={currency}
            locale={locale}
            isLoading={report.isLoading}
          />
          <CategoryBreakdownChart
            data={report.categoryBreakdown}
            currency={currency}
            locale={locale}
            isLoading={report.isLoading}
          />
        </div>

        <ReportTransactionsList
          transactions={report.transactions}
          currency={currency}
          locale={locale}
          isLoading={report.isLoading}
        />
      </div>
    </AppLayout>
  );
}
