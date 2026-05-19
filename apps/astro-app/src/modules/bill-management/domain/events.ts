import type { Category } from "./category";
import type { Bill } from "./bill";

export type BillManagementEvent =
  | { type: "BillCreated"; bill: Bill }
  | { type: "CategorySuggested"; providerName: string; category: Category };
