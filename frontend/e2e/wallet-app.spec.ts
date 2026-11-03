import { test, expect } from "@playwright/test";

test.describe("Wallet app (/app) — prototype UI", () => {
  test("shows the demo-data banner on every screen", async ({ page }) => {
    await page.goto("/app");
    const banner = page.getByText("Demo data. No live treasury is connected.");
    await expect(banner).toBeVisible();

    await page.getByRole("link", { name: "Main treasury" }).click();
    await expect(banner).toBeVisible();

    await page.getByRole("link", { name: /View rule/ }).first().click();
    await expect(banner).toBeVisible();
  });

  test("dashboard lists the treasury with its exit/entry rule counts", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Treasuries" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Main treasury" })).toBeVisible();
    await expect(page.getByText("2 exit rules, 2 entry rules")).toBeVisible();
  });

  test("account page lists all five rules with their kind badges", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Main treasury" }).click();
    await expect(page.getByRole("heading", { name: "Main treasury", level: 1 })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Governance" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Exit · DeFindex" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Entry · DeFindex" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Exit · Soroswap" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Entry · Soroswap" })).toBeVisible();
  });

  test("a rule's detail page renders its signers and policy in plain language", async ({ page }) => {
    await page.goto(`/app/CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/1`);

    await expect(page.getByRole("heading", { name: "Exit · DeFindex" })).toBeVisible();
    await expect(page.getByText("Signers · 1 of 2 required")).toBeVisible();
    await expect(page.getByText("Operator 1")).toBeVisible();
    await expect(page.getByText("arg[0] = this account")).toBeVisible();
  });

  test("the Admin rule shows a notice instead of a policy viewer", async ({ page }) => {
    await page.goto(`/app/CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/0`);
    await expect(
      page.getByText("This is the Admin rule — it has no RolesPolicy attached."),
    ).toBeVisible();
  });

  test("the tooling panel explains what each CLI command needs, without claiming they work", async ({ page }) => {
    await page.goto(`/app/CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/1`);

    await page.getByRole("button", { name: "roles simulate" }).click();
    await expect(page.getByText(/isn't wired up in this preview/)).toBeVisible();

    await page.getByRole("button", { name: "roles apply" }).click();
    await expect(page.getByText(/doesn't have yet/)).toBeVisible();
  });

  test("a non-existent rule 404s instead of crashing", async ({ page }) => {
    const response = await page.goto(
      `/app/CTREASURYACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/999`,
    );
    expect(response?.status()).toBe(404);
  });

  test("'Back to the site' returns to the landing page", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Back to the site" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many." })).toBeVisible();
  });
});
