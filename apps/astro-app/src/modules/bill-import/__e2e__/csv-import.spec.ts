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

  "upload valid CSV file": async (page: Page) => {
    const csv = [
      "amount,date,provider,description",
      "125.50,2024-01-15,Electric Company,Monthly bill",
      "45.00,2024-01-20,Netflix,Subscription",
      "89.99,2024-02-01,Water Utility,Quarterly",
    ].join("\n");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText(/click to browse/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "bills.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv, "utf-8"),
    });
  },

  "see review table with parsed rows": async (page: Page) => {
    await expect(page.getByText("Review Import")).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  },

  "see import summary section": async (page: Page) => {
    await expect(page.getByText(/total rows/i)).toBeVisible();
    await expect(page.getByText(/ready to import/i)).toBeVisible();
  },

  "finalize import": async (page: Page) => {
    await page.getByRole("button", { name: /import.*bills/i }).click();
  },

  "see success confirmation": async (page: Page) => {
    await expect(page.getByText(/bills imported/i)).toBeVisible();
  },

  "see error rows highlighted": async (page: Page) => {
    await expect(page.locator("tr.bg-destructive\\/5").first()).toBeVisible();
  },

  "see duplicate indicator": async (page: Page) => {
    await expect(page.getByText(/potential duplicate/i)).toBeVisible();
  },

  "see error indicators on row": async (page: Page) => {
    await expect(page.getByText(/with errors/i)).toBeVisible();
  },

  "see file parse error": async (page: Page) => {
    await expect(
      page.locator("[data-testid='file-error'], .text-destructive").first(),
    ).toBeVisible();
  },

  "see processing indicator": async (page: Page) => {
    await expect(page.getByText("Processing file...")).toBeVisible();
  },

  "cancel import": async (page: Page) => {
    await page.getByRole("button", { name: /cancel/i }).click();
  },

  "import panel is closed": async (page: Page) => {
    await expect(
      page.getByRole("heading", { name: "Import Bills" }),
    ).not.toBeVisible();
  },
};

const run = interpreter(commands);

test.describe("CSV Import", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test("user uploads CSV and reaches review state", async ({ page }) => {
    await run(
      ["navigate to dashboard", page],
      ["open import panel", page],
      ["upload valid CSV file", page],
      ["see review table with parsed rows", page],
      ["see import summary section", page],
    );
  });

  test("user can cancel and close the import panel", async ({ page }) => {
    await run(
      ["navigate to dashboard", page],
      ["open import panel", page],
      ["cancel import", page],
      ["import panel is closed", page],
    );
  });
});
