/**
 * Insight generator functions (1–9).
 *
 * Each generator receives pre-bucketed data, runs the detection logic,
 * and delegates object construction to ./insight-builders.
 */

import type { Category } from "@/modules/bill-management/domain/category";
import type { Insight } from "@/modules/bill-management/domain/insights";
import {
  getMonthSpan,
  linearRegression,
  classifyTrend,
  roundCents,
  type MonthBucket,
} from "../bill-math";
import { getCalendarMonth, getQuarterKey, getCategoryTotal } from "./helpers";
import {
  buildSpendingSpike,
  buildSeasonalPattern,
  buildBudgetTrajectory,
  buildNewCategory,
  buildSubscriptionCreep,
  buildTopSpendingCategory,
  buildCategoryConsolidation,
  buildMonthOverMonth,
  buildSpendingDiversityConcentrated,
  buildSpendingDiversityDiversified,
} from "./insight-builders";

// ── Generator 1: Spending spike (priority 1) ────────────────────────────────

export function generateSpendingSpikeInsights(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length < 2) return [];

  const insights: Insight[] = [];
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const prevMonth = sortedMonths[sortedMonths.length - 2];

  for (const [category, monthMap] of categoryMonthMap) {
    const curr = monthMap.get(lastMonth)?.total ?? 0;
    const prev = monthMap.get(prevMonth)?.total ?? 0;

    if (prev === 0 && curr === 0) continue;
    if (prev === 0) continue; // new-category generator handles this

    const changePct = ((curr - prev) / prev) * 100;

    if (Math.abs(changePct) > 20) {
      insights.push(buildSpendingSpike(category, prev, curr, changePct));
    }
  }

  return insights;
}

// ── Generator 2: Seasonal pattern (priority 2) ─────────────────────────────

export function generateSeasonalPatternInsights(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
  sortedMonths: string[],
): Insight[] {
  if (getMonthSpan(sortedMonths) < 6) return [];

  const insights: Insight[] = [];

  for (const [category, monthMap] of categoryMonthMap) {
    const totals = sortedMonths.map((m) => monthMap.get(m)?.total ?? 0);
    const overallAvg = totals.reduce((a, b) => a + b, 0) / totals.length;
    if (overallAvg === 0) continue;

    // group by calendar month
    const calMonthTotals = new Map<number, number[]>();
    for (let i = 0; i < sortedMonths.length; i++) {
      const cm = getCalendarMonth(sortedMonths[i]);
      if (!calMonthTotals.has(cm)) calMonthTotals.set(cm, []);
      calMonthTotals.get(cm)!.push(totals[i]);
    }

    for (const [cm, values] of calMonthTotals) {
      const cmAvg = values.reduce((a, b) => a + b, 0) / values.length;
      if (cmAvg > overallAvg * 1.3) {
        const monthName = new Date(2024, cm - 1, 1).toLocaleString("en-US", {
          month: "long",
        });
        insights.push(
          buildSeasonalPattern(category, monthName, cmAvg, overallAvg),
        );
      }
    }
  }

  return insights;
}

// ── Generator 3: Budget trajectory (priority 3) ────────────────────────────

export function generateBudgetTrajectoryInsight(
  overallMonthMap: Map<string, number>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length < 2) return [];

  const totals = sortedMonths.map((m) => overallMonthMap.get(m) ?? 0);
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  if (mean === 0) return [];

  const reg = linearRegression(totals);
  const trend = classifyTrend(reg.slope, mean);

  if (trend === "stable") return [];

  const monthlyChange = roundCents(Math.abs(reg.slope));
  const projected = roundCents(mean + reg.slope * 3);
  const up = trend === "increasing";

  return [
    buildBudgetTrajectory(
      monthlyChange,
      projected,
      up,
      totals[0],
      totals[totals.length - 1],
    ),
  ];
}

// ── Generator 4: New category (priority 4) ─────────────────────────────────

export function generateNewCategoryInsight(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length < 2) return [];

  const insights: Insight[] = [];
  const recentMonths = new Set(sortedMonths.slice(-2));

  for (const [category, monthMap] of categoryMonthMap) {
    const monthsWithData = [...monthMap.keys()];
    const allRecent = monthsWithData.every((m) => recentMonths.has(m));

    if (allRecent && monthsWithData.length > 0) {
      const total = monthsWithData.reduce(
        (sum, m) => sum + (monthMap.get(m)?.total ?? 0),
        0,
      );
      insights.push(buildNewCategory(category, total));
    }
  }

  return insights;
}

// ── Generator 5: Subscription creep (priority 5) ───────────────────────────

export function generateSubscriptionCreepInsight(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length < 4) return [];

  // count distinct active categories per quarter
  const quarterCategories = new Map<string, Set<Category>>();

  for (const [category, monthMap] of categoryMonthMap) {
    for (const monthKey of monthMap.keys()) {
      const qk = getQuarterKey(monthKey);
      if (!quarterCategories.has(qk)) quarterCategories.set(qk, new Set());
      quarterCategories.get(qk)!.add(category);
    }
  }

  const quarters = [...quarterCategories.keys()].sort();
  if (quarters.length < 2) return [];

  const lastQ = quarterCategories.get(quarters[quarters.length - 1])!.size;
  const prevQ = quarterCategories.get(quarters[quarters.length - 2])!.size;

  if (lastQ > prevQ) {
    return [buildSubscriptionCreep(prevQ, lastQ)];
  }

  return [];
}

// ── Generator 6: Top spending category (priority 6) ────────────────────────

export function generateTopSpendingCategoryInsight(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
): Insight[] {
  if (categoryMonthMap.size === 0) return [];

  let grandTotal = 0;
  let topCategory: Category | null = null;
  let topTotal = 0;

  for (const [category, monthMap] of categoryMonthMap) {
    const catTotal = getCategoryTotal(monthMap);
    grandTotal += catTotal;
    if (catTotal > topTotal) {
      topTotal = catTotal;
      topCategory = category;
    }
  }

  if (!topCategory || grandTotal === 0) return [];

  const pct = Math.round((topTotal / grandTotal) * 100);
  return [buildTopSpendingCategory(topCategory, pct, topTotal)];
}

// ── Generator 7: Category consolidation (priority 7) ───────────────────────

export function generateCategoryConsolidationInsight(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length === 0) return [];

  const smallCategories: Category[] = [];
  const numMonths = sortedMonths.length;

  for (const [category, monthMap] of categoryMonthMap) {
    const catTotal = getCategoryTotal(monthMap);
    const avgMonthly = catTotal / numMonths;
    if (avgMonthly < 20) {
      smallCategories.push(category);
    }
  }

  if (smallCategories.length < 2) return [];

  return [buildCategoryConsolidation(smallCategories)];
}

// ── Generator 8: Month-over-month summary (priority 8) ─────────────────────

export function generateMonthOverMonthSummary(
  overallMonthMap: Map<string, number>,
  sortedMonths: string[],
): Insight[] {
  if (sortedMonths.length < 2) return [];

  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const prevMonth = sortedMonths[sortedMonths.length - 2];
  const curr = overallMonthMap.get(lastMonth) ?? 0;
  const prev = overallMonthMap.get(prevMonth) ?? 0;

  if (prev === 0 && curr === 0) return [];

  const changePct = prev === 0 ? 100 : ((curr - prev) / prev) * 100;
  return [buildMonthOverMonth(curr, prev, changePct)];
}

// ── Generator 9: Spending diversity / HHI (priority 9) ─────────────────────

export function generateSpendingDiversityInsight(
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>,
): Insight[] {
  if (categoryMonthMap.size < 2) return [];

  let grandTotal = 0;
  const catTotals: number[] = [];

  for (const monthMap of categoryMonthMap.values()) {
    const catTotal = getCategoryTotal(monthMap);
    catTotals.push(catTotal);
    grandTotal += catTotal;
  }

  if (grandTotal === 0) return [];

  // Herfindahl-Hirschman Index
  let hhi = 0;
  for (const ct of catTotals) {
    const share = ct / grandTotal;
    hhi += share * share;
  }

  if (hhi > 0.4) return [buildSpendingDiversityConcentrated(hhi)];
  if (hhi < 0.2)
    return [buildSpendingDiversityDiversified(hhi, categoryMonthMap.size)];

  return [];
}
