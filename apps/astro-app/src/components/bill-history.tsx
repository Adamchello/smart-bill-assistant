"use client";

import { useMemo } from "react";
import type { Category } from "@/components/category-selector";
import { Separator } from "@/components/ui/separator";

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

// Category colors for visual identification
const CATEGORY_COLORS: Record<Category, string> = {
  Utilities:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Housing:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Food: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Transportation:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Subscriptions:
    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Healthcare: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Insurance:
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Loans:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  Entertainment:
    "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  Shopping:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Services:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Education:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  Charity: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Pets: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Uncategorized:
    "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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
