import type { Category } from "@/components/category-selector";

export interface ConfidenceInterval {
  low: number;
  high: number;
}

export interface CategoryMonthForecast {
  month: string;
  predictedAmount: number;
  confidence: ConfidenceInterval;
  trend: "increasing" | "decreasing" | "stable";
  billCount: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
  confidence: ConfidenceInterval;
}

export interface CategorySummary {
  category: Category;
  trend: "increasing" | "decreasing" | "stable";
  avgMonthlyAmount: number;
  forecasts: CategoryMonthForecast[];
}

export interface ForecastResponse {
  categorySummaries: CategorySummary[];
  monthlyTotals: MonthlyTotal[];
  yearlyProjection: number;
  dataQuality: "full" | "limited";
  generatedAt: string;
}
