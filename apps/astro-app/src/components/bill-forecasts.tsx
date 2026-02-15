"use client";

import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { CATEGORY_COLORS, formatCurrency } from "@/lib/category-colors";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { ForecastResponse } from "@/types/forecast";

const getForecast = async (): Promise<ForecastResponse> => {
  const response = await fetch("/api/bills/forecast");
  if (!response.ok) {
    throw new Error("Failed to fetch forecasts");
  }
  const data = await response.json();
  return data.data;
};

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function TrendIcon({
  trend,
}: {
  trend: "increasing" | "decreasing" | "stable";
}) {
  if (trend === "increasing") {
    return <TrendingUp className="h-4 w-4 text-red-500" />;
  }
  if (trend === "decreasing") {
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function TrendLabel({
  trend,
}: {
  trend: "increasing" | "decreasing" | "stable";
}) {
  const labels = {
    increasing: "Increasing",
    decreasing: "Decreasing",
    stable: "Stable",
  };
  return <span className="text-xs text-muted-foreground">{labels[trend]}</span>;
}

export function BillForecasts() {
  const query = useQuery(
    {
      queryKey: ["forecasts"],
      queryFn: getForecast,
    },
    queryClient,
  );

  if (query.isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Generating forecasts...</p>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
        <p className="text-sm text-destructive">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load forecasts"}
        </p>
      </div>
    );
  }

  const forecast = query.data;

  if (!forecast || forecast.categorySummaries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No bill data available for forecasting. Add some bills to see spending
          predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data quality banner */}
      {forecast.dataQuality === "limited" && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Limited data available
            </p>
            <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
              Less than 3 months of bill history. Forecasts will improve as you
              add more data over time.
            </p>
          </div>
        </div>
      )}

      {/* Yearly projection */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-1">
          Projected Yearly Spending
        </p>
        <p className="text-3xl font-bold">
          {formatCurrency(forecast.yearlyProjection)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Based on {forecast.categorySummaries.length}{" "}
          {forecast.categorySummaries.length === 1 ? "category" : "categories"}
        </p>
      </div>

      {/* Monthly totals */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Monthly Forecast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {forecast.monthlyTotals.map((mt) => (
            <div
              key={mt.month}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="text-sm text-muted-foreground mb-1">
                {formatMonth(mt.month)}
              </p>
              <p className="text-xl font-semibold">
                {formatCurrency(mt.total)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(mt.confidence.low)} &ndash;{" "}
                {formatCurrency(mt.confidence.high)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* By Category */}
      <div>
        <h3 className="text-lg font-semibold mb-3">By Category</h3>
        <div className="space-y-3">
          {forecast.categorySummaries.map((cs) => (
            <div
              key={cs.category}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cs.category]}`}
                  >
                    {cs.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={cs.trend} />
                    <TrendLabel trend={cs.trend} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Avg: {formatCurrency(cs.avgMonthlyAmount)}/mo
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cs.forecasts.map((f) => (
                  <div key={f.month} className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatMonth(f.month)}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(f.predictedAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(f.confidence.low)} &ndash;{" "}
                      {formatCurrency(f.confidence.high)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
