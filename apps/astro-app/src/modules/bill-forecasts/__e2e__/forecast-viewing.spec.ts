import { test, expect, type Page } from "@playwright/test";
import { interpreter } from "@/__e2e__/interpreter";
import {
  fullForecast,
  limitedForecast,
  emptyForecast,
} from "../__tests__/fixtures";

const FORECAST_URL = "**/api/bills/forecast";

const commands = {
  "mock full forecast API": async (page: Page) => {
    await page.route(FORECAST_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: fullForecast }),
      }),
    );
  },

  "mock limited forecast API": async (page: Page) => {
    await page.route(FORECAST_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: limitedForecast }),
      }),
    );
  },

  "mock empty forecast API": async (page: Page) => {
    await page.route(FORECAST_URL, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: emptyForecast }),
      }),
    );
  },

  "mock failing forecast API": async (page: Page) => {
    await page.route(FORECAST_URL, (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({}),
      }),
    );
  },

  "navigate to forecasts tab": async (page: Page) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /forecasts/i }).click();
  },

  "see forecast content loaded": async (page: Page) => {
    await expect(page.getByText("Projected Yearly Spending")).toBeVisible();
    await expect(page.getByText("Monthly Forecast")).toBeVisible();
    await expect(page.getByText("By Category")).toBeVisible();
  },

  "see limited data warning banner": async (page: Page) => {
    await expect(page.getByText("Limited data available")).toBeVisible();
  },

  "see empty state guidance": async (page: Page) => {
    await expect(page.getByText(/no bill data available/i)).toBeVisible();
  },

  "see error state": async (page: Page) => {
    await expect(page.getByText(/failed to/i)).toBeVisible();
  },

  "forecast sections are not rendered": async (page: Page) => {
    await expect(page.getByText("Projected Yearly Spending")).not.toBeVisible();
    await expect(page.getByText("Monthly Forecast")).not.toBeVisible();
  },
};

const run = interpreter(commands);

test.describe("Forecast Viewing", () => {
  test("user navigates to forecasts and sees full content", async ({
    page,
  }) => {
    await run(
      ["mock full forecast API", page],
      ["navigate to forecasts tab", page],
      ["see forecast content loaded", page],
    );
  });

  test("user with limited history sees a warning", async ({ page }) => {
    await run(
      ["mock limited forecast API", page],
      ["navigate to forecasts tab", page],
      ["see limited data warning banner", page],
    );
  });

  test("user with no bills is guided to add data", async ({ page }) => {
    await run(
      ["mock empty forecast API", page],
      ["navigate to forecasts tab", page],
      ["see empty state guidance", page],
      ["forecast sections are not rendered", page],
    );
  });

  test("user sees error state when API fails", async ({ page }) => {
    await run(
      ["mock failing forecast API", page],
      ["navigate to forecasts tab", page],
      ["see error state", page],
      ["forecast sections are not rendered", page],
    );
  });
});
