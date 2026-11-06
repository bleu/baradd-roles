import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads with the expected title and hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Baradd/);
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();
    await expect(page.getByText("Early prototype · testnet demo in progress")).toBeVisible();
  });

  test("every main section is present, in order", async ({ page }) => {
    await page.goto("/");
    const headings = page.locator("h2");
    await expect(headings).toContainText([
      "3:07 a.m. One operator. One key.",
      "Try to move the chest.",
      "Rules, scope, and a closed door by default.",
      "Real config, in plain words.",
      "A command line that checks your rules.",
      "Where Baradd sits among the options.",
      "What is real today.",
      "Teams with money that must move at different speeds.",
      "Planned, not built.",
      "Straight answers.",
      "Leave with one key. Enter with many.",
    ]);
  });

  test("the hero CTA scrolls to the demo section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Try to move the chest" }).first().click();
    await expect(page).toHaveURL(/#demo$/);
    await expect(page.getByRole("heading", { name: "Try to move the chest." })).toBeInViewport();
  });

  test("'Open the prototype' navigates to the wallet app", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Open the prototype" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: "Chests" })).toBeVisible();
  });

  test("nav section links scroll to their targets", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/#how-it-works$/);
    await expect(
      page.getByRole("heading", { name: "Rules, scope, and a closed door by default." }),
    ).toBeInViewport();
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

  test("the hero visual placeholder is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-visual")).toBeVisible();
    await expect(page.getByText("ASSET C1")).toBeVisible();
  });
});
