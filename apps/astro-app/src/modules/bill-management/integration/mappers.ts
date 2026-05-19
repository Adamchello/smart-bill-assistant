import type { Bill } from "../domain/bill";
import type { Category } from "../domain/category";

interface ApiBill {
  id: string;
  amount: number;
  date: string;
  provider_name: string;
  description: string | null;
  category: string;
  created_at: string;
}

export function mapBill(raw: ApiBill): Bill {
  return {
    id: raw.id,
    amount: raw.amount,
    date: raw.date,
    provider_name: raw.provider_name,
    description: raw.description,
    category: raw.category as Category,
    created_at: raw.created_at,
  };
}

export function mapBills(raw: ApiBill[]): Bill[] {
  return raw.map(mapBill);
}
