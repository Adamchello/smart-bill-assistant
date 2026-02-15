"use client";

import { useMemo } from "react";
import type { Category } from "@/components/category-selector";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_COLORS, formatCurrency } from "@/lib/category-colors";

export interface Bill {
  id: string;
  amount: number;
  date: string;
  provider_name: string;
  description: string | null;
  category: Category;
  created_at: string;
}

interface BillHistoryProps {
  bills: Bill[];
  onRefresh?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BillHistory({ bills, onRefresh }: BillHistoryProps) {
  if (bills.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No bills yet. Add your first bill to get started!
        </p>
      </div>
    );
  }

  // Group bills by date
  const groupedBills = useMemo(() => {
    const groups: Record<string, Bill[]> = {};
    bills.forEach((bill) => {
      const dateKey = bill.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(bill);
    });
    return groups;
  }, [bills]);

  const sortedDates = Object.keys(groupedBills).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Bill History</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatDate(date)}
              </h3>
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {groupedBills[date].length}{" "}
                {groupedBills[date].length === 1 ? "bill" : "bills"}
              </span>
            </div>

            <div className="space-y-2">
              {groupedBills[date].map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{bill.provider_name}</h4>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[bill.category]}`}
                        >
                          {bill.category}
                        </span>
                      </div>
                      {bill.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bill.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(bill.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
