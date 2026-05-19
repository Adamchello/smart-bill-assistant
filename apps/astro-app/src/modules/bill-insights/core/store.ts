import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { getInsights } from "../integration/repository";

export function useInsights() {
  return useQuery(
    {
      queryKey: ["insights"],
      queryFn: ({ signal }) => getInsights(signal),
    },
    queryClient,
  );
}
