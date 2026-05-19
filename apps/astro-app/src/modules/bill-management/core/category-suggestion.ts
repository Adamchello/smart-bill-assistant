import type { Category } from "../domain/category";
import { CATEGORY_KEYWORDS } from "../configuration/constraints";

export function suggestCategory(providerName: string): Category {
  if (!providerName || !providerName.trim()) {
    return "Uncategorized";
  }

  const normalizedProvider = providerName.toLowerCase().trim();

  const categoryScores: Record<Category, number> = {
    Utilities: 0,
    Housing: 0,
    Food: 0,
    Transportation: 0,
    Subscriptions: 0,
    Healthcare: 0,
    Insurance: 0,
    Loans: 0,
    Entertainment: 0,
    Shopping: 0,
    Services: 0,
    Education: 0,
    Charity: 0,
    Pets: 0,
    Uncategorized: 0,
  };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedProvider.includes(keyword)) {
        categoryScores[category as Category]++;
      }
    }
  }

  let maxScore = 0;
  let suggestedCategory: Category = "Uncategorized";

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      suggestedCategory = category as Category;
    }
  }

  return maxScore > 0 ? suggestedCategory : "Uncategorized";
}
