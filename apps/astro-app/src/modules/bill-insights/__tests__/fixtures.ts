import type { InsightsResponse } from "../domain/insights";

export const fullInsights: InsightsResponse = {
  dataQuality: "full",
  generatedAt: "2026-05-21T00:00:00Z",
  insights: [
    {
      type: "spending-spike",
      priority: 1,
      title: "Utilities Spending Spike",
      description:
        "Your Utilities spending jumped from $50.00 to $120.00 this month — a 140% increase.",
      category: "Utilities",
      iconHint: "alert-triangle",
      sentiment: "warning",
      comparison: {
        label: "Month-over-month",
        previousValue: 50,
        currentValue: 120,
        changePercent: 140,
        unit: "$",
      },
    },
    {
      type: "new-category",
      priority: 3,
      title: "New Category Detected",
      description: "Pets is a new spending category this month.",
      category: "Pets",
      iconHint: "plus-circle",
      sentiment: "neutral",
    },
    {
      type: "top-spending-category",
      priority: 5,
      title: "Top Spending: Housing",
      description:
        "Housing remains your largest expense at $1,200.00/mo, accounting for 45% of total spending.",
      category: "Housing",
      iconHint: "bar-chart",
      sentiment: "neutral",
      comparison: {
        label: "vs last month",
        previousValue: 1150,
        currentValue: 1200,
        changePercent: 4.3,
        unit: "$",
      },
    },
    {
      type: "budget-trajectory",
      priority: 2,
      title: "Food Budget On Track",
      description:
        "Your Food spending is trending $30.00 below budget this month. Keep it up!",
      category: "Food",
      iconHint: "target",
      sentiment: "positive",
    },
  ],
};

export const limitedInsights: InsightsResponse = {
  dataQuality: "limited",
  generatedAt: "2026-05-21T00:00:00Z",
  insights: [
    {
      type: "top-spending-category",
      priority: 5,
      title: "Top Spending: Utilities",
      description:
        "Utilities is your largest expense at $600.00/mo based on limited data.",
      category: "Utilities",
      iconHint: "bar-chart",
      sentiment: "neutral",
    },
  ],
};

export const emptyInsights: InsightsResponse = {
  dataQuality: "full",
  generatedAt: "2026-05-21T00:00:00Z",
  insights: [],
};

export const groupedInsights: InsightsResponse = {
  dataQuality: "full",
  generatedAt: "2026-05-21T00:00:00Z",
  insights: [
    {
      type: "spending-spike",
      priority: 1,
      title: "Utilities Spike",
      description:
        "Utilities jumped from $80.00 to $150.00 this month. Review your usage to avoid surprises.",
      category: "Utilities",
      iconHint: "alert-triangle",
      sentiment: "warning",
      comparison: {
        label: "Month-over-month",
        previousValue: 80,
        currentValue: 150,
        changePercent: 87.5,
        unit: "$",
      },
    },
    {
      type: "spending-spike",
      priority: 1,
      title: "Entertainment Spike",
      description:
        "Entertainment jumped from $40.00 to $95.00 this month. Review your usage to avoid surprises.",
      category: "Entertainment",
      iconHint: "alert-triangle",
      sentiment: "warning",
      comparison: {
        label: "Month-over-month",
        previousValue: 40,
        currentValue: 95,
        changePercent: 137.5,
        unit: "$",
      },
    },
  ],
};
