import { test, expect, type Page, type Locator } from "@playwright/test";

function resultPanel(page: Page): Locator {
  return page.locator('[aria-live="polite"]');
}

async function signAndAct(page: Page, keys: string[], actionName: string) {
  for (const key of keys) {
    await page.getByRole("button", { name: key, exact: true }).click();
  }
  await page.getByRole("button", { name: actionName }).click();
}

test.describe("Demo — independent role groups, driven through the real UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#demo");
  });

  test("O1 exits to the chest — approved via the operator group", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Exit to the chest");
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("O1 exits to an outside address — denied despite a valid signature", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Exit to an outside address");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
    await expect(resultPanel(page).getByText("Destination is not this chest. Failed.")).toBeVisible();
  });

  test("O1 alone tries to enter — denied, operator isn't an entering group", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Enter a new position");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
  });

  test("A1 + A2 enter — approved via the admin group", async ({ page }) => {
    await signAndAct(page, ["Admin 1", "Admin 2"], "Enter a new position");
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("G1 + G2 enter — approved via the other independent path, governance", async ({ page }) => {
    await signAndAct(page, ["Governance 1", "Governance 2"], "Enter a new position");
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("G1 alone tries to change the rules — denied, 1 of 2 governance", async ({ page }) => {
    await signAndAct(page, ["Governance 1"], "Change the rules");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
  });

  test("G1 + G2 change the rules — approved, governance 2 of 2", async ({ page }) => {
    await signAndAct(page, ["Governance 1", "Governance 2"], "Change the rules");
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("A1 alone tries to change the rules — denied, admin isn't a governance signer", async ({ page }) => {
    await signAndAct(page, ["Admin 1"], "Change the rules");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
  });
});

test.describe("Demo — classic multisig contrast (section 8.1)", () => {
  test("needs 5 of 8 keys regardless of role or action", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: /Classic multisig/ }).click();

    await signAndAct(page, ["Operator 1", "Operator 2", "Admin 1", "Admin 2"], "Exit to the chest");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Admin 3" }).click();
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("approves an outside exit with 5 keys, since destination isn't checked", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: /Classic multisig/ }).click();
    await signAndAct(
      page,
      ["Operator 1", "Operator 2", "Admin 1", "Admin 2", "Admin 3"],
      "Exit to an outside address",
    );
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });
});

test.describe("Demo — shortcuts and shareable state", () => {
  test("'3 a.m.: one operator exits' approves via the operator group in one click", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "3 a.m.: one operator exits" }).click();
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();
  });

  test("'Exit to a stranger' reproduces the policy-denied case in one click", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "Exit to a stranger" }).click();
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
    await expect(resultPanel(page).getByText("Destination is not this chest. Failed.")).toBeVisible();
  });

  test("Reset clears the scenario back to the default", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "Operator 1" }).click();
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("button", { name: "Operator 1" })).toHaveAttribute("aria-pressed", "false");
    await expect(resultPanel(page).getByText("✕ Denied", { exact: true })).toBeVisible();
  });

  test("a result can be shared and restored via its URL", async ({ page, context }) => {
    await page.goto("/#demo");
    await signAndAct(page, ["Admin 1", "Admin 2"], "Enter a new position");
    await expect(resultPanel(page).getByText("✓ Approved", { exact: true })).toBeVisible();

    const url = page.url();
    expect(url).toContain("signed=A1%2CA2");
    expect(url).toContain("action=enter");

    const fresh = await context.newPage();
    await fresh.goto(url);
    await expect(resultPanel(fresh).getByText("✓ Approved", { exact: true })).toBeVisible();
    await expect(fresh.getByRole("button", { name: "Enter a new position" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("the evaluation steps are always listed, in order", async ({ page }) => {
    await page.goto("/#demo");
    // Default scenario (no keys signed, exit) passes the argument check and
    // fails both independent groups: rule matched, argument check, operator
    // group, admin group, any-one-group-enough.
    const steps = resultPanel(page).locator("ol li");
    await expect(steps).toHaveCount(5);
    await expect(steps.first()).toContainText("Rule matched");
  });
});
