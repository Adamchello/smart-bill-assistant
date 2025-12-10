import type { Category } from "@/components/category-selector";

export const CATEGORIES: Category[] = [
  "Utilities",
  "Housing",
  "Food",
  "Transportation",
  "Subscriptions",
  "Healthcare",
  "Insurance",
  "Loans",
  "Entertainment",
  "Shopping",
  "Services",
  "Education",
  "Charity",
  "Pets",
  "Uncategorized",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Utilities: "bg-blue-100 text-blue-800",
  Housing: "bg-purple-100 text-purple-800",
  Food: "bg-green-100 text-green-800",
  Transportation: "bg-orange-100 text-orange-800",
  Subscriptions: "bg-pink-100 text-pink-800",
  Healthcare: "bg-red-100 text-red-800",
  Insurance: "bg-indigo-100 text-indigo-800",
  Loans: "bg-yellow-100 text-yellow-800",
  Entertainment: "bg-cyan-100 text-cyan-800",
  Shopping: "bg-amber-100 text-amber-800",
  Services: "bg-teal-100 text-teal-800",
  Education: "bg-violet-100 text-violet-800",
  Charity: "bg-emerald-100 text-emerald-800",
  Pets: "bg-lime-100 text-lime-800",
  Uncategorized: "bg-gray-100 text-gray-800",
};
