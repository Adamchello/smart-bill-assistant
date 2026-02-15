/**
 * Insights-specific helpers: bucketing, calendar/quarter utilities,
 * and the category-total reducer.
 */

import type { Category } from "@/components/category-selector";
import { getMonthKey, type BillInput, type MonthBucket } from "../bill-math";

// ── Types ───────────────────────────────────────────────────────────────────

export interface BucketedData {
  categoryMonthMap: Map<Category, Map<string, MonthBucket>>;
  overallMonthMap: Map<string, number>;
  sortedMonths: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getCalendarMonth(monthKey: string): number {
  return parseInt(monthKey.split("-")[1], 10);
}

export function getQuarterKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const q = Math.ceil(month / 3);
  return `${year}-Q${q}`;
}

export function getCategoryTotal(monthMap: Map<string, MonthBucket>): number {
  let total = 0;
  for (const bucket of monthMap.values()) {
    total += bucket.total;
  }
  return total;
}

// ── Bucketing ───────────────────────────────────────────────────────────────

export function bucketBills(bills: BillInput[]): BucketedData {
  const categoryMonthMap = new Map<Category, Map<string, MonthBucket>>();
  const overallMonthMap = new Map<string, number>();
  const allMonthKeys = new Set<string>();

  for (const bill of bills) {
    const monthKey = getMonthKey(new Date(bill.date));
    allMonthKeys.add(monthKey);

    // per-category
    if (!categoryMonthMap.has(bill.category)) {
      categoryMonthMap.set(bill.category, new Map());
    }
    const catMap = categoryMonthMap.get(bill.category)!;
    const bucket = catMap.get(monthKey) ?? { total: 0, count: 0 };
    bucket.total += bill.amount;
    bucket.count += 1;
    catMap.set(monthKey, bucket);

    // overall
    overallMonthMap.set(
      monthKey,
      (overallMonthMap.get(monthKey) ?? 0) + bill.amount,
    );
  }

  return {
    categoryMonthMap,
    overallMonthMap,
    sortedMonths: [...allMonthKeys].sort(),
  };
}
