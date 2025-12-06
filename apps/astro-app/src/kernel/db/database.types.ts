export type Database = {
  public: {
    Tables: {
      bills: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          date: string;
          provider_name: string;
          description: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          date: string;
          provider_name: string;
          description?: string | null;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          date?: string;
          provider_name?: string;
          description?: string | null;
          category?: string;
          created_at?: string;
        };
      };
    };
  };
};
