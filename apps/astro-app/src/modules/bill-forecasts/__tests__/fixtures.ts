import type { ForecastResponse } from "../domain/forecast";

export const fullForecast: ForecastResponse = {
  dataQuality: "full",
  yearlyProjection: 18600,
  monthlyTotals: [
    { month: "2026-06", total: 1550, confidence: { low: 1400, high: 1700 } },
    { month: "2026-07", total: 1580, confidence: { low: 1420, high: 1740 } },
    { month: "2026-08", total: 1600, confidence: { low: 1450, high: 1750 } },
  ],
  categorySummaries: [
    {
      category: "Utilities",
      trend: "increasing",
      avgMonthlyAmount: 320,
      forecasts: [
        {
          month: "2026-06",
          predictedAmount: 340,
          confidence: { low: 300, high: 380 },
          trend: "increasing",
          billCount: 6,
        },
        {
          month: "2026-07",
          predictedAmount: 350,
          confidence: { low: 310, high: 390 },
          trend: "increasing",
          billCount: 6,
        },
        {
          month: "2026-08",
          predictedAmount: 360,
          confidence: { low: 320, high: 400 },
          trend: "increasing",
          billCount: 6,
        },
      ],
    },
    {
      category: "Housing",
      trend: "decreasing",
      avgMonthlyAmount: 1200,
      forecasts: [
        {
          month: "2026-06",
          predictedAmount: 1180,
          confidence: { low: 1100, high: 1220 },
          trend: "decreasing",
          billCount: 6,
        },
        {
          month: "2026-07",
          predictedAmount: 1160,
          confidence: { low: 1080, high: 1220 },
          trend: "decreasing",
          billCount: 6,
        },
        {
          month: "2026-08",
          predictedAmount: 1140,
          confidence: { low: 1060, high: 1220 },
          trend: "decreasing",
          billCount: 6,
        },
      ],
    },
    {
      category: "Subscriptions",
      trend: "stable",
      avgMonthlyAmount: 50,
      forecasts: [
        {
          month: "2026-06",
          predictedAmount: 50,
          confidence: { low: 48, high: 52 },
          trend: "stable",
          billCount: 6,
        },
      ],
    },
  ],
  generatedAt: "2026-05-21T00:00:00Z",
};

export const limitedForecast: ForecastResponse = {
  dataQuality: "limited",
  yearlyProjection: 7200,
  monthlyTotals: [
    { month: "2026-06", total: 600, confidence: { low: 300, high: 900 } },
    { month: "2026-07", total: 620, confidence: { low: 310, high: 930 } },
  ],
  categorySummaries: [
    {
      category: "Utilities",
      trend: "stable",
      avgMonthlyAmount: 600,
      forecasts: [
        {
          month: "2026-06",
          predictedAmount: 600,
          confidence: { low: 300, high: 900 },
          trend: "stable",
          billCount: 2,
        },
        {
          month: "2026-07",
          predictedAmount: 620,
          confidence: { low: 310, high: 930 },
          trend: "stable",
          billCount: 2,
        },
      ],
    },
  ],
  generatedAt: "2026-05-21T00:00:00Z",
};

export const emptyForecast: ForecastResponse = {
  categorySummaries: [],
  monthlyTotals: [],
  yearlyProjection: 0,
  dataQuality: "full",
  generatedAt: "2026-05-21T00:00:00Z",
};
