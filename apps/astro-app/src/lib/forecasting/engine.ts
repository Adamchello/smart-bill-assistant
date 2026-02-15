/**
 * Bill Forecasting Engine
 *
 * Produces per-category spending predictions for the next 3 months.
 * Pure logic — no DB or framework dependencies.
 *
 * Flow:
 * 1. Bucket bills by YYYY-MM + category into { total, count } aggregates.
 * 2. Determine data quality from the month span ("full" if >= 3 months, "limited" otherwise).
 * 3. For each category, build a monthly timeline (gaps filled with $0) and forecast:
 *    a. Limited data (< 3 months): predict using a simple average with wide
 *       confidence intervals (max of 1.5x stdDev or 20% of mean).
 *    b. Full data (>= 3 months):
 *       - Compute a weighted moving average (linear decay, recent months weighted more).
 *       - Build seasonal indices (same-calendar-month average / overall average).
 *       - Fit a linear regression to detect trend (increasing/decreasing/stable at 5% threshold).
 *       - Predict: WMA * seasonalIndex + slope * monthsAhead.
 *       - Confidence: stdDev of regression residuals, widening with distance.
 * 4. Aggregate category forecasts into monthly totals.
 * 5. Project yearly spending: average monthly total * 12.
 *
 * Edge cases: zero bills -> empty response; missing months -> treated as $0;
 * single bill -> wide confidence intervals (20% floor).
 */

import type { Category } from "@/components/category-selector";
import type {
  ForecastResponse,
  CategorySummary,
  CategoryMonthForecast,
  MonthlyTotal,
  ConfidenceInterval,
} from "@/types/forecast";

interface BillInput {
  amount: number;
  date: string;
  category: Category;
}

interface MonthBucket {
  total: number;
  count: number;
}

interface BucketedData {
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>;
  sortedMonths: string[];
}

type Trend = "increasing" | "decreasing" | "stable";

function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getFutureMonthKeys(count: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    keys.push(getMonthKey(d));
  }
  return keys;
}

function getMonthSpan(monthKeys: string[]): number {
  if (monthKeys.length < 2) return monthKeys.length;
  const sorted = [...monthKeys].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const [fy, fm] = first.split("-").map(Number);
  const [ly, lm] = last.split("-").map(Number);
  return (ly - fy) * 12 + (lm - fm) + 1;
}

function linearRegression(values: number[]): {
  slope: number;
  intercept: number;
} {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function classifyTrend(slope: number, mean: number): Trend {
  if (mean === 0) return "stable";
  const ratio = slope / mean;
  if (ratio > 0.05) return "increasing";
  if (ratio < -0.05) return "decreasing";
  return "stable";
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildConfidence(
  predicted: number,
  sd: number,
  monthsAhead: number,
  mean: number,
): ConfidenceInterval {
  const floor = Math.max(mean * 0.2, 1);
  const margin = Math.max(sd * (1 + 0.1 * monthsAhead), floor);
  return {
    low: Math.max(0, roundCents(predicted - margin)),
    high: roundCents(predicted + margin),
  };
}

function bucketBills(bills: BillInput[]): BucketedData {
  const categoryMonthMap = new Map<Category, Map<string, MonthBucket>>();
  const allMonthKeys = new Set<string>();

  for (const bill of bills) {
    const monthKey = getMonthKey(new Date(bill.date));
    allMonthKeys.add(monthKey);

    if (!categoryMonthMap.has(bill.category)) {
      categoryMonthMap.set(bill.category, new Map());
    }
    const catMap = categoryMonthMap.get(bill.category)!;
    const bucket = catMap.get(monthKey) ?? { total: 0, count: 0 };
    bucket.total += bill.amount;
    bucket.count += 1;
    catMap.set(monthKey, bucket);
  }

  return {
    categoryMonthMap,
    sortedMonths: [...allMonthKeys].sort(),
  };
}

function buildTimeline(
  monthMap: Map<string, MonthBucket>,
  sortedMonths: string[],
): { totals: number[]; counts: number[] } {
  const totals: number[] = [];
  const counts: number[] = [];
  for (const mk of sortedMonths) {
    const bucket = monthMap.get(mk) ?? { total: 0, count: 0 };
    totals.push(bucket.total);
    counts.push(bucket.count);
  }
  return { totals, counts };
}

function weightedMovingAverage(values: number[]): number {
  let wmaSum = 0;
  let weightSum = 0;
  for (let i = 0; i < values.length; i++) {
    const weight = i + 1;
    wmaSum += values[i] * weight;
    weightSum += weight;
  }
  return wmaSum / weightSum;
}

function buildSeasonalIndices(
  sortedMonths: string[],
  timeline: number[],
): Map<number, number[]> {
  const indices = new Map<number, number[]>();
  for (let i = 0; i < sortedMonths.length; i++) {
    const calMonth = parseInt(sortedMonths[i].split("-")[1], 10);
    if (!indices.has(calMonth)) indices.set(calMonth, []);
    indices.get(calMonth)!.push(timeline[i]);
  }
  return indices;
}

function computeSeasonalIndex(
  calMonth: number,
  seasonalIndices: Map<number, number[]>,
  overallMean: number,
): number {
  if (overallMean === 0) return 1;
  const values = seasonalIndices.get(calMonth);
  if (!values || values.length === 0) return 1;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg / overallMean;
}

function computeResidualStdDev(
  timeline: number[],
  reg: { slope: number; intercept: number },
): number {
  const residuals = timeline.map(
    (val, i) => val - (reg.intercept + reg.slope * i),
  );
  return stdDev(residuals);
}

function forecastLimited(
  timeline: number[],
  mean: number,
  avgCount: number,
  futureMonths: string[],
): CategoryMonthForecast[] {
  const sd = stdDev(timeline);
  const margin = Math.max(1.5 * sd, mean * 0.2);

  return futureMonths.map((month) => ({
    month,
    predictedAmount: roundCents(mean),
    confidence: {
      low: Math.max(0, roundCents(mean - margin)),
      high: roundCents(mean + margin),
    },
    trend: "stable" as const,
    billCount: Math.round(avgCount),
  }));
}

function forecastFull(
  timeline: number[],
  sortedMonths: string[],
  mean: number,
  avgCount: number,
  futureMonths: string[],
): { forecasts: CategoryMonthForecast[]; trend: Trend } {
  const reg = linearRegression(timeline);
  const trend = classifyTrend(reg.slope, mean);
  const wma = weightedMovingAverage(timeline);
  const seasonalIndices = buildSeasonalIndices(sortedMonths, timeline);
  const residualSd = computeResidualStdDev(timeline, reg);

  const forecasts = futureMonths.map((month, i) => {
    const calMonth = new Date(month + "-01").getMonth() + 1;
    const monthsAhead = i + 1;
    const seasonalIndex = computeSeasonalIndex(calMonth, seasonalIndices, mean);

    const predicted = wma * seasonalIndex + reg.slope * monthsAhead;
    const finalPrediction = Math.max(0, roundCents(predicted));
    const confidence = buildConfidence(
      finalPrediction,
      residualSd,
      monthsAhead,
      mean,
    );

    return {
      month,
      predictedAmount: finalPrediction,
      confidence,
      trend,
      billCount: Math.round(avgCount),
    };
  });

  return { forecasts, trend };
}

function forecastCategory(
  monthMap: Map<string, MonthBucket>,
  sortedMonths: string[],
  dataQuality: "full" | "limited",
  futureMonths: string[],
  category: Category,
): CategorySummary {
  const { totals, counts } = buildTimeline(monthMap, sortedMonths);
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;

  let trend: Trend = "stable";
  let forecasts: CategoryMonthForecast[];

  if (dataQuality === "limited") {
    forecasts = forecastLimited(totals, mean, avgCount, futureMonths);
  } else {
    const result = forecastFull(
      totals,
      sortedMonths,
      mean,
      avgCount,
      futureMonths,
    );
    forecasts = result.forecasts;
    trend = result.trend;
  }

  return {
    category,
    trend,
    avgMonthlyAmount: roundCents(mean),
    forecasts,
  };
}

function aggregateMonthlyTotals(
  categorySummaries: CategorySummary[],
  futureMonths: string[],
): MonthlyTotal[] {
  return futureMonths.map((month, i) => {
    let total = 0;
    let totalLow = 0;
    let totalHigh = 0;

    for (const cs of categorySummaries) {
      const f = cs.forecasts[i];
      total += f.predictedAmount;
      totalLow += f.confidence.low;
      totalHigh += f.confidence.high;
    }

    return {
      month,
      total: roundCents(total),
      confidence: {
        low: roundCents(totalLow),
        high: roundCents(totalHigh),
      },
    };
  });
}

function computeYearlyProjection(monthlyTotals: MonthlyTotal[]): number {
  const avgMonthly =
    monthlyTotals.reduce((sum, mt) => sum + mt.total, 0) / monthlyTotals.length;
  return roundCents(avgMonthly * 12);
}

function buildEmptyResponse(generatedAt: string): ForecastResponse {
  return {
    categorySummaries: [],
    monthlyTotals: getFutureMonthKeys(3).map((month) => ({
      month,
      total: 0,
      confidence: { low: 0, high: 0 },
    })),
    yearlyProjection: 0,
    dataQuality: "limited",
    generatedAt,
  };
}

export function computeForecasts(bills: BillInput[]): ForecastResponse {
  const generatedAt = new Date().toISOString();

  if (bills.length === 0) {
    return buildEmptyResponse(generatedAt);
  }

  const { categoryMonthMap, sortedMonths } = bucketBills(bills);
  const dataQuality = getMonthSpan(sortedMonths) >= 3 ? "full" : "limited";
  const futureMonths = getFutureMonthKeys(3);

  const categorySummaries = [...categoryMonthMap.entries()]
    .map(([category, monthMap]) =>
      forecastCategory(
        monthMap,
        sortedMonths,
        dataQuality,
        futureMonths,
        category,
      ),
    )
    .sort((a, b) => b.avgMonthlyAmount - a.avgMonthlyAmount);

  const monthlyTotals = aggregateMonthlyTotals(categorySummaries, futureMonths);
  const yearlyProjection = computeYearlyProjection(monthlyTotals);

  return {
    categorySummaries,
    monthlyTotals,
    yearlyProjection,
    dataQuality,
    generatedAt,
  };
}
