import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import {
  getBills,
  createBill,
  suggestCategoryApi,
  getForecasts,
  getInsights,
} from "./api";

export function useBills(options?: { enabled?: boolean }) {
  return useQuery(
    {
      queryKey: ["bills"],
      queryFn: getBills,
      enabled: options?.enabled,
    },
    queryClient,
  );
}

export function useCreateBill() {
  return useMutation(
    {
      mutationFn: createBill,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bills"] });
      },
    },
    queryClient,
  );
}

export function useSuggestCategory(providerName: string) {
  return useQuery(
    {
      queryKey: ["suggest-category", providerName],
      queryFn: () => suggestCategoryApi(providerName),
      enabled: !!providerName,
      retry: false,
      staleTime: Infinity,
    },
    queryClient,
  );
}

export function useForecasts() {
  return useQuery(
    {
      queryKey: ["forecasts"],
      queryFn: getForecasts,
    },
    queryClient,
  );
}

export function useInsights() {
  return useQuery(
    {
      queryKey: ["insights"],
      queryFn: getInsights,
    },
    queryClient,
  );
}
