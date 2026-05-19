export type Category =
  | "Utilities"
  | "Housing"
  | "Food"
  | "Transportation"
  | "Subscriptions"
  | "Healthcare"
  | "Insurance"
  | "Loans"
  | "Entertainment"
  | "Shopping"
  | "Services"
  | "Education"
  | "Charity"
  | "Pets"
  | "Uncategorized";

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
