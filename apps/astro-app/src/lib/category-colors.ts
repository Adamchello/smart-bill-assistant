import type { Category } from "@/components/category-selector";

export const CATEGORY_COLORS: Record<Category, string> = {
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
