import type { Category } from "@/shared/domain/category";

export type InsightSentiment = "positive" | "negative" | "neutral" | "warning";

export type InsightIconHint =
  | "trending-up"
  | "trending-down"
  | "alert-triangle"
  | "calendar"
  | "plus-circle"
  | "layers"
  | "bar-chart"
  | "target"
  | "pie-chart"
  | "lightbulb";

export type InsightType =
  | "spending-spike"
  | "seasonal-pattern"
  | "budget-trajectory"
  | "new-category"
  | "subscription-creep"
  | "top-spending-category"
  | "category-consolidation"
  | "month-over-month"
  | "spending-diversity";

export interface InsightComparison {
  label: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  unit: string;
}

export interface Insight {
  type: InsightType;
  priority: number;
  title: string;
  description: string;
  category?: Category;
  iconHint: InsightIconHint;
  sentiment: InsightSentiment;
  comparison?: InsightComparison;
}

export interface InsightsResponse {
  insights: Insight[];
  dataQuality: "full" | "limited";
  generatedAt: string;
}
