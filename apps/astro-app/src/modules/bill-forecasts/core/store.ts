import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { getForecasts } from "../integration/repository";

export function useForecasts() {
  return useQuery(
    {
      queryKey: ["forecasts"],
      queryFn: ({ signal }) => getForecasts(signal),
    },
    queryClient,
  );
}
