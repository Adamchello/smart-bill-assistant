import type { ParsedBillRow } from "../domain/bill-import";

interface BillImportPayload {
  amount: number;
  date: string;
  providerName: string;
  description: string | null;
  category: string;
}

export function mapRowToPayload(row: ParsedBillRow): BillImportPayload {
  return {
    amount: parseFloat(row.amount),
    date: row.date,
    providerName: row.providerName,
    description: row.description || null,
    category: row.category,
  };
}
