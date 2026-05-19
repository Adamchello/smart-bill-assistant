import type { InsightsResponse } from "../domain/insights";

export const getInsights = async (
  signal?: AbortSignal,
): Promise<InsightsResponse> => {
  const response = await fetch("/api/bills/insights", { signal });
  if (!response.ok) throw new Error("Failed to fetch insights");
  const data = await response.json();
  return data.data;
};
