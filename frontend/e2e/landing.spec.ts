import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads with the expected title and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Barad/);
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many." })).toBeVisible();
    await expect(page.getByText("Early prototype · testnet demo in progress")).toBeVisible();
  });

  test("every main section is present, in order", async ({ page }) => {
    await page.goto("/");
    const headings = page.locator("h2");
    await expect(headings).toContainText([
      "Try to move the treasury",
      "How it works",
      "What a policy looks like",
      "Tooling",
      "Why not the alternatives",
      "Security and status",
      "Who it's for",
      "Roadmap",
      "Frequently asked",
      "Follow the build",
    ], { useInnerText: true });
  });

  test("the hero CTA scrolls to the demo section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Try to move the treasury" }).click();
    await expect(page).toHaveURL(/#demo$/);
    await expect(page.getByRole("heading", { name: "Try to move the treasury" })).toBeInViewport();
  });

  test("'Open the prototype' navigates to the wallet app", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Open the prototype" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: "Treasuries" })).toBeVisible();
  });

  test("nav section links scroll to their targets", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(page.getByRole("heading", { name: "How it works" })).toBeInViewport();
  });

  test("the FAQ accordion expands and collapses a question", async ({ page }) => {
    await page.goto("/#security-and-status");
    const question = page.getByRole("button", { name: "Is it audited?" });
    await question.scrollIntoViewIfNeeded();
    await expect(question).toHaveAttribute("aria-expanded", "false");

    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("No. An external audit is planned.")).toBeVisible();

    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "false");
  });

  test("the hero backdrop image loads successfully", async ({ page }) => {
    await page.goto("/");
    const img = page.locator('img[alt=""]').first();
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });
});
