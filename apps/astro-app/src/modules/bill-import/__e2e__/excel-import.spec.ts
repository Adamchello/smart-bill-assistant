import { test, expect, type Page } from "@playwright/test";
import { interpreter } from "@/__e2e__/interpreter";
import { loginAs } from "@/__e2e__/auth";

const commands = {
  "navigate to dashboard": async (page: Page) => {
    await page.goto("/app");
  },

  "open import panel": async (page: Page) => {
    await page.getByRole("button", { name: /import/i }).click();
    await expect(
      page.getByRole("heading", { name: "Import Bills" }),
    ).toBeVisible();
  },

  "drop valid Excel file": async (page: Page) => {
    // Minimal xlsx binary would need the xlsx lib — use route mock instead
    // For e2e, we test that the upload flow reaches the review state
    const dropZone = page.getByText(/drag and drop/i);
    await expect(dropZone).toBeVisible();
    // Note: actual xlsx drop requires serving a fixture file from the test assets
    // This is a placeholder — real implementation needs fileChooser or fixture serving
  },

  "see review table": async (page: Page) => {
    await expect(page.getByText("Review Import")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  },

  "see import summary section": async (page: Page) => {
    await expect(page.getByText(/total rows/i)).toBeVisible();
    await expect(page.getByText(/ready to import/i)).toBeVisible();
  },

  "see error rows highlighted": async (page: Page) => {
    await expect(page.getByText(/with errors/i)).toBeVisible();
  },

  "see file parse error": async (page: Page) => {
    await expect(page.locator(".text-destructive").first()).toBeVisible();
  },

  "see processing indicator": async (page: Page) => {
    await expect(page.getByText("Processing file...")).toBeVisible();
  },

  "finalize import": async (page: Page) => {
    await page.getByRole("button", { name: /import.*bills/i }).click();
  },

  "see success confirmation": async (page: Page) => {
    await expect(page.getByText(/bills imported/i)).toBeVisible();
  },
};

const run = interpreter(commands);

test.describe("Excel Import", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("happy path — drop Excel file, review, finalize", async ({ page }) => {
    await run(
      ["navigate to dashboard", page],
      ["open import panel", page],
      // Note: xlsx file drop needs fixture assets — skeleton test for now
    );
  });
});
