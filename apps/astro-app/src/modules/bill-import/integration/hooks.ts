import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { importBills } from "./api";

export function useImportBills() {
  return useMutation(
    {
      mutationFn: importBills,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bills"] });
      },
    },
    queryClient,
  );
}
