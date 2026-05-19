/**
 * Actionable Insights Engine
 *
 * Analyses bill history and produces prioritised insights explaining
 * spending changes and suggesting actions.
 * Pure logic — no DB or framework dependencies.
 *
 * Priority scale: lower = higher priority.
 *   Forecasting insights: 1–3
 *   Behavioural insights:  4–6
 *   Optimisation insights: 7–9
 */

import type { InsightsResponse } from "@/modules/bill-insights/domain/insights";
import { getMonthSpan, type BillInput } from "../bill-math";
import { bucketBills } from "./helpers";
import {
  generateSpendingSpikeInsights,
  generateSeasonalPatternInsights,
  generateBudgetTrajectoryInsight,
  generateNewCategoryInsight,
  generateSubscriptionCreepInsight,
  generateTopSpendingCategoryInsight,
  generateCategoryConsolidationInsight,
  generateMonthOverMonthSummary,
  generateSpendingDiversityInsight,
} from "./generators";

export function computeInsights(bills: BillInput[]): InsightsResponse {
  const generatedAt = new Date().toISOString();

  if (bills.length === 0) {
    return { insights: [], dataQuality: "limited", generatedAt };
  }

  const { categoryMonthMap, overallMonthMap, sortedMonths } =
    bucketBills(bills);

  const dataQuality = getMonthSpan(sortedMonths) >= 3 ? "full" : "limited";

  const insights = [
    ...generateSpendingSpikeInsights(categoryMonthMap, sortedMonths),
    ...generateSeasonalPatternInsights(categoryMonthMap, sortedMonths),
    ...generateBudgetTrajectoryInsight(overallMonthMap, sortedMonths),
    ...generateNewCategoryInsight(categoryMonthMap, sortedMonths),
    ...generateSubscriptionCreepInsight(categoryMonthMap, sortedMonths),
    ...generateTopSpendingCategoryInsight(categoryMonthMap),
    ...generateCategoryConsolidationInsight(categoryMonthMap, sortedMonths),
    ...generateMonthOverMonthSummary(overallMonthMap, sortedMonths),
    ...generateSpendingDiversityInsight(categoryMonthMap),
  ].sort((a, b) => a.priority - b.priority);

  return { insights, dataQuality, generatedAt };
}
