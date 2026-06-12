import { useCallback, useEffect, useState } from "react";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval, isSameDay } from "date-fns";
import { getTransactionsByWorkspaceId } from "@/lib/db/repositories/transactions.repo";
import { getCategoriesByWorkspaceId } from "@/lib/db/repositories/categories.repo";
import { useDataChanged } from "@/shared/lib/data-events";
import type { Category, Transaction } from "@/types";

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  avgDailySpend: number;
  topExpenseDay: string | null;
}

export interface CategorySpend {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  transactionCount: number;
}

export interface DailySpend {
  day: string;
  date: string;
  income: number;
  expenses: number;
}

export interface ReportTransaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  categoryName: string;
  categoryColor: string;
  notes: string;
}

export interface MonthComparison {
  incomeChange: number;
  expensesChange: number;
  previousIncome: number;
  previousExpenses: number;
}

export interface ReportsData {
  summary: ReportSummary;
  categoryBreakdown: CategorySpend[];
  dailySpend: DailySpend[];
  transactions: ReportTransaction[];
  comparison: MonthComparison;
  isLoading: boolean;
}

export function useReports(workspaceId: string, selectedDate: Date): ReportsData {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, cats] = await Promise.all([
        getTransactionsByWorkspaceId(workspaceId),
        getCategoriesByWorkspaceId(workspaceId),
      ]);
      setTransactions(txs);
      setCategories(cats);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  useDataChanged(load);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const monthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= monthStart && d <= monthEnd;
  });

  const prevMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const prevMonthEnd = endOfMonth(subMonths(selectedDate, 1));
  const prevMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= prevMonthStart && d <= prevMonthEnd;
  });

  const totalIncome = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevMonthTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevMonthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const daysInMonth = monthEnd.getDate();
  const avgDailySpend = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;

  const daySpendMap = new Map<string, number>();
  monthTxs
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const day = t.date.slice(0, 10);
      daySpendMap.set(day, (daySpendMap.get(day) ?? 0) + t.amount);
    });
  let topExpenseDay: string | null = null;
  let topExpenseDayAmount = 0;
  daySpendMap.forEach((amount, day) => {
    if (amount > topExpenseDayAmount) {
      topExpenseDayAmount = amount;
      topExpenseDay = day;
    }
  });

  const catSpendMap = new Map<string, { amount: number; count: number }>();
  monthTxs
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const prev = catSpendMap.get(t.categoryId) ?? { amount: 0, count: 0 };
      catSpendMap.set(t.categoryId, { amount: prev.amount + t.amount, count: prev.count + 1 });
    });

  const categoryBreakdown: CategorySpend[] = Array.from(catSpendMap.entries())
    .map(([id, { amount, count }]) => {
      const cat = categoryMap.get(id);
      return {
        name: cat?.name ?? "Unknown",
        amount,
        color: cat?.color ?? "#6b7280",
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        transactionCount: count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dailySpend: DailySpend[] = days.map((day) => {
    const dayTxs = monthTxs.filter((t) => isSameDay(new Date(t.date), day));
    return {
      day: format(day, "d"),
      date: format(day, "MMM d"),
      income: dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expenses: dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const reportTransactions: ReportTransaction[] = monthTxs.map((t) => {
    const cat = categoryMap.get(t.categoryId);
    return {
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date,
      categoryName: cat?.name ?? "Uncategorized",
      categoryColor: cat?.color ?? "#6b7280",
      notes: t.notes,
    };
  });

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: monthTxs.length,
      avgDailySpend,
      topExpenseDay,
    },
    categoryBreakdown,
    dailySpend,
    transactions: reportTransactions,
    comparison: {
      incomeChange: pctChange(totalIncome, prevIncome),
      expensesChange: pctChange(totalExpenses, prevExpenses),
      previousIncome: prevIncome,
      previousExpenses: prevExpenses,
    },
    isLoading,
  };
}
