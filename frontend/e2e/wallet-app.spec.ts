import { test, expect } from "@playwright/test";

test.describe("Wallet app (/app) — prototype UI", () => {
  test("shows the demo-data banner on every screen", async ({ page }) => {
    await page.goto("/app");
    const banner = page.getByText("Demo data. No live chest is connected.");
    await expect(banner).toBeVisible();

    await page.getByRole("link", { name: "Main chest" }).click();
    await expect(banner).toBeVisible();

    await page.getByRole("link", { name: /Open rule/ }).first().click();
    await expect(banner).toBeVisible();
  });

  test("dashboard lists the chest with its rule count", async ({ page }) => {
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Chests" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Main chest" })).toBeVisible();
    await expect(page.getByText("5 rules")).toBeVisible();
  });

  test("account page lists the Admin rule and all generic rules", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Main chest" }).click();
    await expect(page.getByRole("heading", { name: "Main chest", level: 1 })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Governance & Admin" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Example Vault withdraw" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Example Vault deposit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "USDC approve for Example Vault" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Soroswap remove liquidity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Soroswap add liquidity" })).toBeVisible();
  });

  test("a rule's detail page renders its signers and policy in plain language", async ({ page }) => {
    await page.goto(`/app/CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/1`);

    await expect(page.getByRole("heading", { name: "Example Vault withdraw" })).toBeVisible();
    await expect(page.getByText("Operator · 1 of 2 required")).toBeVisible();
    await expect(page.getByText("Operator 1")).toBeVisible();
    await expect(page.getByText("arg[0] = this account")).toBeVisible();
  });

  test("the Admin rule shows a notice instead of a policy viewer", async ({ page }) => {
    await page.goto(`/app/CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/0`);
    await expect(
      page.getByText("This is the Admin rule — it has no RolesPolicy attached."),
    ).toBeVisible();
  });

  test("the tooling panel explains what each CLI command needs, without claiming they work", async ({ page }) => {
    await page.goto(`/app/CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/1`);

    await page.getByRole("button", { name: "roles simulate" }).click();
    await expect(page.getByText(/isn't wired up in this preview/)).toBeVisible();

    await page.getByRole("button", { name: "roles apply" }).click();
    await expect(page.getByText(/doesn't have yet/)).toBeVisible();
  });

  test("a non-existent rule 404s instead of crashing", async ({ page }) => {
    const response = await page.goto(
      `/app/CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/999`,
    );
    expect(response?.status()).toBe(404);
  });

  test("'Back to the site' returns to the landing page", async ({ page }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "Back to the site" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();
  });
});
