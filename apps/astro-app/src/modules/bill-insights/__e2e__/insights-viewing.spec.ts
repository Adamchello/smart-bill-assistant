import { test, expect, type Page } from "@playwright/test";
import { interpreter } from "@/__e2e__/interpreter";
import { loginAs } from "@/__e2e__/auth";
import { getById } from "@/__e2e__/data-e2e";
import type { InsightsResponse } from "../domain/insights";

const INSIGHTS_URL = "**/api/bills/insights";

const richInsights: { data: InsightsResponse } = {
  data: {
    dataQuality: "full",
    generatedAt: "2026-05-21T00:00:00Z",
    insights: [
      {
        type: "spending-spike",
        priority: 1,
        title: "Utilities Spending Spike",
        description:
          "Your Utilities spending jumped from $50/mo to $120/mo this month.",
        category: "Utilities",
        iconHint: "alert-triangle",
        sentiment: "warning",
        comparison: {
          label: "Utilities",
          currentValue: 120,
          previousValue: 50,
          changePercent: 140,
          unit: "currency",
        },
      },
      {
        type: "new-category",
        priority: 3,
        title: "New Category Detected",
        description:
          "You started spending in Pets — 2 bills totalling $85 in the last 2 months.",
        category: "Pets",
        iconHint: "plus-circle",
        sentiment: "neutral",
      },
      {
        type: "top-spending-category",
        priority: 5,
        title: "Top Spending: Housing",
        description:
          "Housing accounts for 45% of your monthly spending at $1,200/mo.",
        category: "Housing",
        iconHint: "bar-chart",
        sentiment: "neutral",
      },
    ],
  },
};

const limitedInsights: { data: InsightsResponse } = {
  data: {
    dataQuality: "limited",
    generatedAt: "2026-05-21T00:00:00Z",
    insights: [
      {
        type: "top-spending-category",
        priority: 5,
        title: "Top Spending: Utilities",
        description: "Utilities is your biggest expense at $600/mo.",
        category: "Utilities",
        iconHint: "bar-chart",
        sentiment: "neutral",
      },
    ],
  },
};

const emptyInsights: { data: InsightsResponse } = {
  data: {
    dataQuality: "full",
    generatedAt: "2026-05-21T00:00:00Z",
    insights: [],
  },
};

const commands = {
  "mock rich insights API": async (page: Page) => {
    await page.route(INSIGHTS_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(richInsights),
      }),
    );
  },

  "mock limited insights API": async (page: Page) => {
    await page.route(INSIGHTS_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(limitedInsights),
      }),
    );
  },

  "mock empty insights API": async (page: Page) => {
    await page.route(INSIGHTS_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(emptyInsights),
      }),
    );
  },

  "mock failing insights API": async (page: Page) => {
    await page.route(INSIGHTS_URL, (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({}),
      }),
    );
  },

  "navigate to insights tab": async (page: Page) => {
    await page.goto("/app");
    await page.getByRole("tab", { name: /insights/i }).click();
  },

  "see insight cards displayed": async (page: Page) => {
    await expect(
      getById(page, "bill-insights.section.forecast-alerts"),
    ).toBeVisible();
    await expect(
      getById(page, "bill-insights.section.spending-behavior"),
    ).toBeVisible();
  },

  "see spending spike insight": async (page: Page) => {
    await expect(
      getById(page, "bill-insights.card.spending-spike"),
    ).toBeVisible();
  },

  "see new category insight": async (page: Page) => {
    await expect(
      getById(page, "bill-insights.card.new-category"),
    ).toBeVisible();
  },

  "see limited data warning": async (page: Page) => {
    await expect(
      getById(page, "bill-insights.state.limited-warning"),
    ).toBeVisible();
  },

  "see empty state message": async (page: Page) => {
    await expect(getById(page, "bill-insights.state.empty")).toBeVisible();
  },

  "see error state": async (page: Page) => {
    await expect(getById(page, "bill-insights.state.error")).toBeVisible({
      timeout: 15000,
    });
  },

  "insight sections are not rendered": async (page: Page) => {
    await expect(
      getById(page, "bill-insights.section.forecast-alerts"),
    ).not.toBeVisible();
    await expect(
      getById(page, "bill-insights.section.spending-behavior"),
    ).not.toBeVisible();
  },
};

const run = interpreter(commands);

test.describe("Insights Viewing", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("user with rich history sees prioritized insight cards", async ({
    page,
  }) => {
    await run(
      ["mock rich insights API", page],
      ["navigate to insights tab", page],
      ["see insight cards displayed", page],
      ["see spending spike insight", page],
      ["see new category insight", page],
    );
  });

  test("user with limited history sees warning and reduced insights", async ({
    page,
  }) => {
    await run(
      ["mock limited insights API", page],
      ["navigate to insights tab", page],
      ["see limited data warning", page],
    );
  });

  test("user with no bills sees empty state", async ({ page }) => {
    await run(
      ["mock empty insights API", page],
      ["navigate to insights tab", page],
      ["see empty state message", page],
      ["insight sections are not rendered", page],
    );
  });

  test("user sees error state when API fails", async ({ page }) => {
    await run(
      ["mock failing insights API", page],
      ["navigate to insights tab", page],
      ["see error state", page],
      ["insight sections are not rendered", page],
    );
  });
});
