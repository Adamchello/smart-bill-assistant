"use client";

import { CATEGORY_COLORS, formatCurrency } from "../core/category-colors";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  PlusCircle,
  Layers,
  BarChart3,
  Target,
  PieChart,
  Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Bill } from "../models/bill";
import type { ForecastResponse } from "../models/forecast";
import type {
  InsightsResponse,
  Insight,
  InsightIconHint,
  InsightSentiment,
} from "../models/insights";
import type { Category } from "../models/category";
import { useForecasts } from "../integration/hooks";
import { useInsights } from "../integration/hooks";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const ICON_MAP: Record<InsightIconHint, LucideIcon> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "alert-triangle": AlertTriangle,
  calendar: Calendar,
  "plus-circle": PlusCircle,
  layers: Layers,
  "bar-chart": BarChart3,
  target: Target,
  "pie-chart": PieChart,
  lightbulb: Lightbulb,
};

const SENTIMENT_STYLES: Record<
  InsightSentiment,
  { border: string; bg: string; iconColor: string }
> = {
  positive: {
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    iconColor: "text-green-600 dark:text-green-400",
  },
  negative: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  neutral: {
    border: "border-border",
    bg: "bg-card",
    iconColor: "text-muted-foreground",
  },
};

function BoldNumbers({ text }: { text: string }) {
  const parts = text.split(/(\$[\d,]+(?:\.\d+)?(?:\/mo)?|\d+%)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\$[\d,]+(?:\.\d+)?(?:\/mo)?$|^\d+%$/.test(part) ? (
          <span key={i} className="font-semibold text-foreground">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

interface DashboardOverviewProps {
  bills: Bill[];
}

export function DashboardOverview({ bills }: DashboardOverviewProps) {
  const forecastQuery = useForecasts();
  const insightsQuery = useInsights();

  const recentBills = bills.slice(0, 3);
  const nextMonth = forecastQuery.data?.monthlyTotals[0];
  const topInsight = insightsQuery.data?.insights[0];

  return (
    <div className="space-y-6">
      {/* Section A — Recent Bills */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Bills</h3>
        {recentBills.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No bills yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{bill.provider_name}</h4>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[bill.category]}`}
                      >
                        {bill.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(bill.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section B — Upcoming Month Forecast */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming Month Forecast</h3>
        {forecastQuery.isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading forecast...</p>
          </div>
        ) : forecastQuery.error ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">
              {forecastQuery.error instanceof Error
                ? forecastQuery.error.message
                : "Failed to load forecast"}
            </p>
          </div>
        ) : !nextMonth ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No forecast data available yet
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {formatMonth(nextMonth.month)}
            </p>
            <p className="text-xl font-semibold">
              {formatCurrency(nextMonth.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(nextMonth.confidence.low)} &ndash;{" "}
              {formatCurrency(nextMonth.confidence.high)}
            </p>
          </div>
        )}
      </div>

      {/* Section C — Top Insight */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Insight</h3>
        {insightsQuery.isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        ) : insightsQuery.error ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">
              {insightsQuery.error instanceof Error
                ? insightsQuery.error.message
                : "Failed to load insights"}
            </p>
          </div>
        ) : !topInsight ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No insights available yet</p>
          </div>
        ) : (
          <TopInsightCard insight={topInsight} />
        )}
      </div>
    </div>
  );
}

function TopInsightCard({ insight }: { insight: Insight }) {
  const style = SENTIMENT_STYLES[insight.sentiment];
  const Icon = ICON_MAP[insight.iconHint];

  return (
    <div className={cn("rounded-lg border p-4", style.border, style.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold">{insight.title}</h4>
            {insight.category && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  CATEGORY_COLORS[insight.category as Category],
                )}
              >
                {insight.category}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            <BoldNumbers text={insight.description} />
          </p>
        </div>
      </div>
    </div>
  );
}
