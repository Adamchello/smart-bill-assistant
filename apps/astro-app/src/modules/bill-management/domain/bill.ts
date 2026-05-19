import type { Category } from "./category";

export interface Bill {
  id: string;
  amount: number;
  date: string;
  provider_name: string;
  description: string | null;
  category: Category;
  created_at: string;
}
