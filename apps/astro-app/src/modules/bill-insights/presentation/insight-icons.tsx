"use client";

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
import type { InsightIconHint, InsightSentiment } from "../domain/insights";

export const ICON_MAP: Record<InsightIconHint, LucideIcon> = {
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

export const SENTIMENT_STYLES: Record<
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
