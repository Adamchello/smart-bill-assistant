/**
 * Shared math & date utilities used by both the forecasting and insights engines.
 */

import type { Category } from "@/shared/domain/category";

// ── Shared types ────────────────────────────────────────────────────────────

export interface BillInput {
  amount: number;
  date: string;
  category: Category;
}

export interface MonthBucket {
  total: number;
  count: number;
}

export type Trend = "increasing" | "decreasing" | "stable";

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getMonthSpan(monthKeys: string[]): number {
  if (monthKeys.length < 2) return monthKeys.length;
  const sorted = [...monthKeys].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const [fy, fm] = first.split("-").map(Number);
  const [ly, lm] = last.split("-").map(Number);
  return (ly - fy) * 12 + (lm - fm) + 1;
}

export function linearRegression(values: number[]): {
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

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function classifyTrend(slope: number, mean: number): Trend {
  if (mean === 0) return "stable";
  const ratio = slope / mean;
  if (ratio > 0.05) return "increasing";
  if (ratio < -0.05) return "decreasing";
  return "stable";
}

export function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}
