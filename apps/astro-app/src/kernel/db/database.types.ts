import type { CreateInsertType } from "@/types/utils";

type Bill = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  provider_name: string;
  description: string | null;
  category: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      bills: {
        Row: Bill;
        Insert: CreateInsertType<Bill, "id" | "description" | "created_at">;
        Update: Partial<Bill>;
      };
    };
  };
};
