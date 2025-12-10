import type { Category } from "@/components/category-selector";

export interface ParsedBillRow {
  id: string;
  amount: string;
  date: string;
  providerName: string;
  description: string;
  category: Category;
  errors: string[];
  isDuplicate: boolean;
  duplicateOf?: string;
}

export interface ParseResult {
  success: boolean;
  rows: ParsedBillRow[];
  errors: string[];
}
