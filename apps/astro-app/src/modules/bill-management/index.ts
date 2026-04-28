// Models
export type { Bill } from "./models/bill";
export type { Category } from "./models/category";
export { CATEGORIES } from "./models/category";
export type {
  ForecastResponse,
  CategorySummary,
  CategoryMonthForecast,
  MonthlyTotal,
  ConfidenceInterval,
} from "./models/forecast";
export type {
  InsightsResponse,
  Insight,
  InsightType,
  InsightSentiment,
  InsightIconHint,
  InsightComparison,
} from "./models/insights";

// Core
export { CATEGORY_COLORS, formatCurrency } from "./core/category-colors";
export { suggestCategory } from "./core/category-suggestion";

// Hooks
export {
  useBills,
  useCreateBill,
  useSuggestCategory,
  useForecasts,
  useInsights,
} from "./integration/hooks";

// Presentation
export { BillEntryForm } from "./presentation/bill-entry-form";
export { BillHistory } from "./presentation/bill-history";
export { BillForecasts } from "./presentation/bill-forecasts";
export { BillInsights } from "./presentation/bill-insights";
export { DashboardOverview } from "./presentation/dashboard-overview";
export { CategorySelector } from "./presentation/category-selector";
