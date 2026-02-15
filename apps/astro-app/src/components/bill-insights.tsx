"use client";

import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { CATEGORY_COLORS, formatCurrency } from "@/lib/category-colors";
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
import type {
  InsightsResponse,
  Insight,
  InsightType,
  InsightIconHint,
  InsightSentiment,
  InsightComparison,
} from "@/types/insights";
import type { Category } from "@/components/category-selector";

// ── Sections ────────────────────────────────────────────────────────────────

interface InsightSection {
  title: string;
  subtitle: string;
  types: InsightType[];
}

const SECTIONS: InsightSection[] = [
  {
    title: "Forecast Alerts",
    subtitle:
      "Where your spending is heading — spikes, seasonal patterns, and budget trajectory.",
    types: ["spending-spike", "seasonal-pattern", "budget-trajectory"],
  },
  {
    title: "Spending Behavior",
    subtitle:
      "How your spending habits are evolving — new categories, creep, and top expenses.",
    types: ["new-category", "subscription-creep", "top-spending-category"],
  },
  {
    title: "Optimization Tips",
    subtitle:
      "Suggestions for fine-tuning — consolidation opportunities, summaries, and balance.",
    types: ["category-consolidation", "month-over-month", "spending-diversity"],
  },
];

// ── Group titles for consolidated cards ──────────────────────────────────────

const GROUP_TITLES: Record<InsightType, string> = {
  "spending-spike": "Spending Spikes",
  "seasonal-pattern": "Seasonal Patterns",
  "budget-trajectory": "Budget Trajectory",
  "new-category": "New Categories",
  "subscription-creep": "Subscription Creep",
  "top-spending-category": "Top Spending Category",
  "category-consolidation": "Category Consolidation",
  "month-over-month": "Month-over-Month",
  "spending-diversity": "Spending Diversity",
};

const SENTIMENT_SEVERITY: Record<InsightSentiment, number> = {
  negative: 3,
  warning: 2,
  neutral: 1,
  positive: 0,
};

function getMostSevereSentiment(insights: Insight[]): InsightSentiment {
  return insights.reduce<InsightSentiment>(
    (worst, i) =>
      SENTIMENT_SEVERITY[i.sentiment] > SENTIMENT_SEVERITY[worst]
        ? i.sentiment
        : worst,
    "positive",
  );
}

// ── Data fetching ───────────────────────────────────────────────────────────

const getInsights = async (): Promise<InsightsResponse> => {
  const response = await fetch("/api/bills/insights");
  if (!response.ok) {
    throw new Error("Failed to fetch insights");
  }
  const data = await response.json();
  return data.data;
};

// ── Icon mapping ────────────────────────────────────────────────────────────

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

// ── Sentiment styling ───────────────────────────────────────────────────────

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

// ── Comparison bar sub-component ────────────────────────────────────────────

function InsightComparisonBar({
  comparison,
}: {
  comparison: InsightComparison;
}) {
  const max = Math.max(comparison.previousValue, comparison.currentValue, 1);
  const prevWidth = (comparison.previousValue / max) * 100;
  const currWidth = (comparison.currentValue / max) * 100;
  const up = comparison.changePercent > 0;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{comparison.label}</span>
        <span
          className={cn(
            "font-medium rounded-full px-2 py-0.5",
            up
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-green-500/10 text-green-600 dark:text-green-400",
          )}
        >
          {up ? "+" : ""}
          {Math.round(comparison.changePercent)}%
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Previous
          </span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-muted-foreground/30"
              style={{ width: `${prevWidth}%` }}
            />
          </div>
          <span className="text-xs font-medium w-20 text-right">
            {formatCurrency(comparison.previousValue)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            Current
          </span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                up ? "bg-red-500/60" : "bg-green-500/60",
              )}
              style={{ width: `${currWidth}%` }}
            />
          </div>
          <span className="text-xs font-medium w-20 text-right">
            {formatCurrency(comparison.currentValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Bold numbers helper ─────────────────────────────────────────────────────

function BoldNumbers({ text }: { text: string }) {
  // Match $amounts (with optional decimals and /mo), standalone percentages
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

// ── Insight card ────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
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
          {insight.comparison && (
            <InsightComparisonBar comparison={insight.comparison} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared tip extraction ────────────────────────────────────────────────────

function extractSharedTip(descriptions: string[]): {
  tip: string;
  trimmed: string[];
} {
  if (descriptions.length < 2) return { tip: "", trimmed: descriptions };

  // Find longest common suffix character-by-character
  const minLen = Math.min(...descriptions.map((s) => s.length));
  let commonLen = 0;

  for (let i = 0; i < minLen; i++) {
    const ch = descriptions[0][descriptions[0].length - 1 - i];
    if (descriptions.every((s) => s[s.length - 1 - i] === ch)) {
      commonLen = i + 1;
    } else {
      break;
    }
  }

  if (commonLen < 15) return { tip: "", trimmed: descriptions };

  const rawSuffix = descriptions[0].slice(-commonLen);

  // Snap to a sentence boundary inside the suffix (". " pattern)
  const startsClean = descriptions.every((d) => {
    const idx = d.length - commonLen;
    return idx === 0 || (d[idx - 1] === " " && d[idx - 2] === ".");
  });

  let tip: string;
  if (startsClean) {
    tip = rawSuffix.trim();
  } else {
    const sentenceBreak = rawSuffix.indexOf(". ");
    if (sentenceBreak === -1) return { tip: "", trimmed: descriptions };
    tip = rawSuffix.slice(sentenceBreak + 2).trim();
  }

  if (tip.length < 15) return { tip: "", trimmed: descriptions };

  const trimmed = descriptions.map((d) => {
    const idx = d.lastIndexOf(tip);
    return idx > 0 ? d.slice(0, idx).trim() : d;
  });

  return { tip, trimmed };
}

// ── Grouped insight card ────────────────────────────────────────────────────

function GroupedInsightCard({ insights }: { insights: Insight[] }) {
  const sentiment = getMostSevereSentiment(insights);
  const style = SENTIMENT_STYLES[sentiment];
  const Icon = ICON_MAP[insights[0].iconHint];
  const groupTitle = GROUP_TITLES[insights[0].type];

  const { tip, trimmed } = extractSharedTip(insights.map((i) => i.description));

  return (
    <div className={cn("rounded-lg border p-4", style.border, style.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", style.iconColor)} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">
            {groupTitle}{" "}
            <span className="font-normal text-muted-foreground">
              ({insights.length} categories)
            </span>
          </h4>
          {tip && (
            <p className="text-sm text-muted-foreground mt-1">
              <BoldNumbers text={tip} />
            </p>
          )}
          <div className="mt-3 space-y-3">
            {insights.map((insight, i) => (
              <div
                key={`${insight.type}-${i}`}
                className="rounded-md bg-background/50 border border-border/50 p-3"
              >
                <div className="flex items-center gap-2 flex-wrap">
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
                  <span className="text-xs font-medium">{insight.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <BoldNumbers text={trimmed[i]} />
                </p>
                {insight.comparison && (
                  <InsightComparisonBar comparison={insight.comparison} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Render helpers ──────────────────────────────────────────────────────────

function groupByType(insights: Insight[]): Insight[][] {
  const groups = new Map<InsightType, Insight[]>();
  for (const insight of insights) {
    if (!groups.has(insight.type)) groups.set(insight.type, []);
    groups.get(insight.type)!.push(insight);
  }
  return [...groups.values()];
}

function renderInsightGroup(group: Insight[]) {
  if (group.length === 1) {
    return <InsightCard key={group[0].type} insight={group[0]} />;
  }
  return <GroupedInsightCard key={group[0].type} insights={group} />;
}

// ── Main component ──────────────────────────────────────────────────────────

export function BillInsights() {
  const query = useQuery(
    {
      queryKey: ["insights"],
      queryFn: getInsights,
    },
    queryClient,
  );

  if (query.isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Analysing your spending...</p>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
        <p className="text-sm text-destructive">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load insights"}
        </p>
      </div>
    );
  }

  const result = query.data;

  if (!result || result.insights.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No insights available yet. Add more bills to unlock personalised
          spending insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {result.dataQuality === "limited" && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Limited data available
            </p>
            <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
              Less than 3 months of bill history. Some insights require more
              data to appear.
            </p>
          </div>
        </div>
      )}

      {SECTIONS.map((section) => {
        const sectionInsights = result.insights.filter((i) =>
          section.types.includes(i.type),
        );
        if (sectionInsights.length === 0) return null;

        return (
          <div key={section.title}>
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">
                {section.subtitle}
              </p>
            </div>
            <div className="space-y-3">
              {groupByType(sectionInsights).map(renderInsightGroup)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
