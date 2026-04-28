import type { Bill } from "../models/bill";
import type { Category } from "../models/category";
import type { ForecastResponse } from "../models/forecast";
import type { InsightsResponse } from "../models/insights";

export const getBills = async (): Promise<Bill[]> => {
  const response = await fetch("/api/bills/list");
  if (!response.ok) {
    throw new Error("Failed to fetch bills");
  }
  const data = await response.json();
  return data.data || [];
};

interface BillFormData {
  amount: number;
  date: string;
  providerName: string;
  description: string | null;
  category: Category;
}

export const createBill = async (formData: BillFormData) => {
  const response = await fetch("/api/bills/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: formData.amount,
      date: formData.date,
      providerName: formData.providerName.trim(),
      description: formData.description?.trim() || null,
      category: formData.category,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save bill");
  }

  return data;
};

export const suggestCategoryApi = async (
  providerName: string,
): Promise<{ category: Category }> => {
  const response = await fetch("/api/bills/suggest-category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerName }),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest category");
  }

  const data = await response.json();
  return data;
};

export const getForecasts = async (): Promise<ForecastResponse> => {
  const response = await fetch("/api/bills/forecast");
  if (!response.ok) {
    throw new Error("Failed to fetch forecasts");
  }
  const data = await response.json();
  return data.data;
};

export const getInsights = async (): Promise<InsightsResponse> => {
  const response = await fetch("/api/bills/insights");
  if (!response.ok) {
    throw new Error("Failed to fetch insights");
  }
  const data = await response.json();
  return data.data;
};
