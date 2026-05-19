import type { ForecastResponse } from "../domain/forecast";

export const getForecasts = async (
  signal?: AbortSignal,
): Promise<ForecastResponse> => {
  const response = await fetch("/api/bills/forecast", { signal });
  if (!response.ok) throw new Error("Failed to fetch forecasts");
  const data = await response.json();
  return data.data;
};
