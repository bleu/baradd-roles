import { test, expect, type Page } from "@playwright/test";

const SIGNER_1 = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const SIGNER_2 = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const CONTRACT = "CEXAMPLEVAULTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

async function addSigner(page: Page, address: string, label: string) {
  await page.getByPlaceholder("GABCD... signer address").fill(address);
  await page.getByPlaceholder("Label (optional)").first().fill(label);
  await page.getByRole("button", { name: "Add signer" }).click();
}

test.describe("Create and configure a chest", () => {
  test("create a chest, add a rule, add a signer, export TOML, and persist across reload", async ({
    page,
  }) => {
    await page.goto("/app");
    await page.getByRole("link", { name: "New draft" }).click();
    await expect(page.getByRole("heading", { name: "Create a chest" })).toBeVisible();

    await page.getByLabel("Label").fill("Test Chest");
    await page.getByRole("button", { name: "+ Governance" }).click();
    await addSigner(page, SIGNER_1, "Gov 1");
    await addSigner(page, SIGNER_2, "Gov 2");
    await page.getByRole("button", { name: "Create chest" }).click();

    await expect(page.getByRole("heading", { name: "Test Chest", level: 1 })).toBeVisible();
    await expect(page.getByText("Not deployed")).toBeVisible();
    const accountUrl = page.url();
    expect(accountUrl).toMatch(/\/app\/DRAFT-/);

    // Add a rule with one target/function/condition and an Operator group.
    await page.getByRole("link", { name: "+ Add rule" }).click();
    await expect(page.getByRole("heading", { name: "Add a rule" })).toBeVisible();

    await page.getByLabel("Name").fill("Example Vault withdraw");

    await page.getByPlaceholder("Contract address (C...)").fill(CONTRACT);
    await page.getByRole("button", { name: "Add function (0/8)" }).click();
    await page.getByPlaceholder("function name, e.g. withdraw").fill("withdraw");
    await page.getByRole("button", { name: "Add condition (0/4)" }).click();

    await page.getByRole("button", { name: "+ Operator" }).click();
    await addSigner(page, SIGNER_1, "Operator 1");

    // Default condition kind is EqSelf, which already satisfies the exit lint rule.
    await expect(page.getByText("roles lint: no findings.")).toBeVisible();

    await page.getByRole("button", { name: "Add rule" }).click();
    await expect(page.getByRole("heading", { name: "Example Vault withdraw", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Operator" })).toBeVisible();
    await expect(page.getByText("Threshold: 1 of 1")).toBeVisible();
    await expect(page.getByText("arg[0] = this account")).toBeVisible();

    // Add a second signer directly on the rule page.
    await addSigner(page, SIGNER_2, "Operator 2");
    await expect(page.getByText("Threshold: 1 of 2")).toBeVisible();

    // Export: the TOML should contain the mapped config.
    const code = page.locator("pre code");
    await expect(code).toContainText('mode = "exit"');
    await expect(code).toContainText("withdraw");
    await expect(code).toContainText("eq_self");

    // Reload: the draft, its rule, and the added signer must survive.
    await page.reload();
    await expect(page.getByRole("heading", { name: "Example Vault withdraw", level: 1 })).toBeVisible();
    await expect(page.getByText("Threshold: 1 of 2")).toBeVisible();

    // The chest shows up back on the dashboard.
    await page.goto("/app");
    await expect(page.getByText("Drafts in this browser")).toBeVisible();
    await expect(page.getByRole("link", { name: /Test Chest/ })).toBeVisible();
  });

  test("the example chest cannot have rules added to it", async ({ page }) => {
    await page.goto("/app/CCHESTACCOUNTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/rules/new");
    await expect(page.getByText(/example chest/)).toBeVisible();
  });
});
