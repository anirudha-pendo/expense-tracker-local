import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pendoTrack } from "@/lib/pendo";
import { getTransactionsByWorkspaceId } from "@/lib/db/repositories/transactions.repo";
import { getCategoriesByWorkspaceId } from "@/lib/db/repositories/categories.repo";
import { getBudgetsByWorkspaceId } from "@/lib/db/repositories/budgets.repo";
import { useDataChanged } from "@/shared/lib/data-events";
import {
  computeHealthScore,
  detectAnomalies,
  forecastEndOfMonth,
  largestExpenses,
  monthOverMonthDeltas,
  type Anomaly,
  type CategoryDelta,
  type Forecast,
  type HealthScore,
} from "../lib/insights-engine";
import type { Budget, Category, Transaction } from "@/types";

export interface Insights {
  forecast: Forecast;
  deltas: CategoryDelta[];
  anomalies: Anomaly[];
  largest: Transaction[];
  health: HealthScore;
  categories: Category[];
  hasTransactions: boolean;
  isLoading: boolean;
}

export function useInsights(workspaceId: string): Insights {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txs, cats, buds] = await Promise.all([
        getTransactionsByWorkspaceId(workspaceId),
        getCategoriesByWorkspaceId(workspaceId),
        getBudgetsByWorkspaceId(workspaceId),
      ]);
      setTransactions(txs);
      setCategories(cats);
      setBudgets(buds);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  useDataChanged(load);

  const hasTrackedRef = useRef(false);

  return useMemo(() => {
    const now = new Date();
    const forecast = forecastEndOfMonth(transactions, now);
    const anomalies = detectAnomalies(transactions, categories, now);
    const health = computeHealthScore(transactions, budgets, now);

    if (!isLoading && transactions.length > 0 && !hasTrackedRef.current) {
      hasTrackedRef.current = true;
      pendoTrack("insights_generated", {
        healthScore: health.score,
        forecastAmount: forecast.projected,
        anomalyCount: anomalies.length,
        transactionCount: transactions.length,
        budgetCount: budgets.length,
      });
    }

    return {
      forecast,
      deltas: monthOverMonthDeltas(transactions, categories, now),
      anomalies,
      largest: largestExpenses(transactions, now),
      health,
      categories,
      hasTransactions: transactions.length > 0,
      isLoading,
    };
  }, [transactions, categories, budgets, isLoading]);
}
