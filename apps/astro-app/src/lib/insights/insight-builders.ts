/**
 * Insight object builders.
 *
 * Every Insight literal lives here.  To change copy, priorities, icons,
 * or sentiments, edit this single file.
 */

import type { Category } from "@/shared/domain/category";
import type { Insight } from "@/modules/bill-insights/domain/insights";
import { roundCents } from "../bill-math";

// ── 1. Spending spike (priority 1) ──────────────────────────────────────────

export function buildSpendingSpike(
  category: Category,
  prev: number,
  curr: number,
  changePct: number,
): Insight {
  const up = changePct > 0;
  return {
    type: "spending-spike",
    priority: 1,
    title: up
      ? `${category} spending jumped ${Math.round(Math.abs(changePct))}%`
      : `${category} spending dropped ${Math.round(Math.abs(changePct))}%`,
    description: up
      ? `Your ${category.toLowerCase()} spending increased from $${roundCents(prev)} to $${roundCents(curr)} last month. Review recent charges to ensure nothing unexpected slipped in.`
      : `Great news — your ${category.toLowerCase()} spending fell from $${roundCents(prev)} to $${roundCents(curr)}. Keep it up!`,
    category,
    iconHint: up ? "trending-up" : "trending-down",
    sentiment: up ? "negative" : "positive",
    comparison: {
      label: `${category} MoM`,
      previousValue: roundCents(prev),
      currentValue: roundCents(curr),
      changePercent: roundCents(changePct),
      unit: "$",
    },
  };
}

// ── 2. Seasonal pattern (priority 2) ────────────────────────────────────────

export function buildSeasonalPattern(
  category: Category,
  monthName: string,
  cmAvg: number,
  overallAvg: number,
): Insight {
  return {
    type: "seasonal-pattern",
    priority: 2,
    title: `${category} peaks in ${monthName}`,
    description: `Historically, your ${category.toLowerCase()} spending in ${monthName} averages $${roundCents(cmAvg)}, which is ${Math.round(((cmAvg - overallAvg) / overallAvg) * 100)}% above your usual $${roundCents(overallAvg)}/mo. Plan ahead for this seasonal bump.`,
    category,
    iconHint: "calendar",
    sentiment: "warning",
  };
}

// ── 3. Budget trajectory (priority 3) ───────────────────────────────────────

export function buildBudgetTrajectory(
  monthlyChange: number,
  projected: number,
  up: boolean,
  firstTotal: number,
  lastTotal: number,
): Insight {
  return {
    type: "budget-trajectory",
    priority: 3,
    title: up
      ? "Overall spending is trending upward"
      : "Overall spending is trending downward",
    description: up
      ? `Your total monthly spending is growing by roughly $${monthlyChange}/mo. At this rate you'll be spending ~$${projected}/mo in 3 months. Consider setting a monthly budget cap.`
      : `Your total monthly spending is decreasing by roughly $${monthlyChange}/mo. Projected spending in 3 months: ~$${Math.max(0, projected)}/mo. Nice work!`,
    iconHint: up ? "trending-up" : "trending-down",
    sentiment: up ? "warning" : "positive",
    comparison: {
      label: "Monthly trend",
      previousValue: roundCents(firstTotal),
      currentValue: roundCents(lastTotal),
      changePercent: roundCents(
        ((lastTotal - firstTotal) / (firstTotal || 1)) * 100,
      ),
      unit: "$",
    },
  };
}

// ── 4. New category (priority 4) ────────────────────────────────────────────

export function buildNewCategory(category: Category, total: number): Insight {
  return {
    type: "new-category",
    priority: 4,
    title: `New spending category: ${category}`,
    description: `${category} appeared in your bills recently with $${roundCents(total)} spent so far. Keep an eye on it to make sure it doesn't become an unplanned recurring expense.`,
    category,
    iconHint: "plus-circle",
    sentiment: "neutral",
  };
}

// ── 5. Subscription creep (priority 5) ──────────────────────────────────────

export function buildSubscriptionCreep(prevQ: number, lastQ: number): Insight {
  return {
    type: "subscription-creep",
    priority: 5,
    title: "Category count is growing",
    description: `You went from ${prevQ} active spending categories last quarter to ${lastQ} this quarter. More categories often means more subscriptions or recurring charges creeping in. Review whether all are necessary.`,
    iconHint: "layers",
    sentiment: "warning",
  };
}

// ── 6. Top spending category (priority 6) ───────────────────────────────────

export function buildTopSpendingCategory(
  topCategory: Category,
  pct: number,
  topTotal: number,
): Insight {
  return {
    type: "top-spending-category",
    priority: 6,
    title: `${topCategory} is your biggest expense`,
    description: `${topCategory} accounts for ${pct}% of your total spending ($${roundCents(topTotal)} overall). If you're looking to cut costs, this is the category with the most impact.`,
    category: topCategory,
    iconHint: "bar-chart",
    sentiment: "neutral",
  };
}

// ── 7. Category consolidation (priority 7) ──────────────────────────────────

export function buildCategoryConsolidation(
  smallCategories: Category[],
): Insight {
  return {
    type: "category-consolidation",
    priority: 7,
    title: `${smallCategories.length} low-spend categories detected`,
    description: `${smallCategories.join(", ")} each average under $20/mo. Consider whether these small recurring charges are still providing value.`,
    iconHint: "target",
    sentiment: "neutral",
  };
}

// ── 8. Month-over-month summary (priority 8) ───────────────────────────────

export function buildMonthOverMonth(
  curr: number,
  prev: number,
  changePct: number,
): Insight {
  const up = curr > prev;
  const diff = Math.abs(roundCents(curr - prev));

  return {
    type: "month-over-month",
    priority: 8,
    title: up
      ? `Total spending up $${diff} from last month`
      : curr === prev
        ? "Total spending unchanged from last month"
        : `Total spending down $${diff} from last month`,
    description: up
      ? `You spent $${roundCents(curr)} last month vs $${roundCents(prev)} the month before — a ${Math.round(Math.abs(changePct))}% increase. Check individual categories to see where the increase came from.`
      : curr === prev
        ? `You spent $${roundCents(curr)} both months. Your spending is holding steady.`
        : `You spent $${roundCents(curr)} last month vs $${roundCents(prev)} the month before — a ${Math.round(Math.abs(changePct))}% decrease. Great job keeping costs down!`,
    iconHint: up
      ? "trending-up"
      : curr === prev
        ? "lightbulb"
        : "trending-down",
    sentiment: up ? "negative" : curr === prev ? "neutral" : "positive",
    comparison: {
      label: "Total MoM",
      previousValue: roundCents(prev),
      currentValue: roundCents(curr),
      changePercent: roundCents(changePct),
      unit: "$",
    },
  };
}

// ── 9. Spending diversity / HHI (priority 9) ───────────────────────────────

export function buildSpendingDiversityConcentrated(hhi: number): Insight {
  return {
    type: "spending-diversity",
    priority: 9,
    title: "Spending is highly concentrated",
    description: `Most of your budget goes to just one or two categories (HHI: ${roundCents(hhi)}). This isn't necessarily bad, but make sure those dominant categories are well-optimised.`,
    iconHint: "pie-chart",
    sentiment: "warning",
  };
}

export function buildSpendingDiversityDiversified(
  hhi: number,
  categoryCount: number,
): Insight {
  return {
    type: "spending-diversity",
    priority: 9,
    title: "Spending is well diversified",
    description: `Your spending is spread fairly evenly across ${categoryCount} categories (HHI: ${roundCents(hhi)}). This makes it easier to find savings in any single area.`,
    iconHint: "pie-chart",
    sentiment: "positive",
  };
}
