import { test, expect, type Page, type Locator } from "@playwright/test";

function resultPanel(page: Page): Locator {
  return page.locator('[aria-live="polite"]');
}

async function signAndAct(page: Page, keys: string[], actionName: string) {
  for (const key of keys) {
    await page.getByRole("group", { name: "Keys that have signed" }).getByRole("button", { name: key }).click();
  }
  await page.getByRole("button", { name: actionName }).click();
}

test.describe("Demo — approval and denial cases through the UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#demo");
  });

  test("case 1: O1 exits to the chest — approved, EXIT 1 of 1", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Exit the position to the chest");
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "1 of 1 required signatures" })).toBeVisible();
  });

  test("case 2: O1 exits to an outside address — denied despite a valid signature", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Exit the position to an outside address");
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(
      resultPanel(page).getByText("The exit rule only allows the chest as destination, even though the signature is valid."),
    ).toBeVisible();
  });

  test("case 3: O1 alone tries to enter — denied, 1 of 3", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Enter the position");
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "1 of 3 required signatures" })).toBeVisible();
  });

  test("case 4: O1 + A1 + A2 enter — approved, 3 of 3", async ({ page }) => {
    await signAndAct(page, ["Operator 1", "Approver 1", "Approver 2"], "Enter the position");
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "3 of 3 required signatures" })).toBeVisible();
  });

  test("case 5: O1 alone tries to approve token spending — denied, needs the ENTRY threshold", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Approve token spending");
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "1 of 3 required signatures" })).toBeVisible();
  });

  test("case 6: O1 alone tries to change the rules — denied, not an ADMIN signer", async ({ page }) => {
    await signAndAct(page, ["Operator 1"], "Change the rules");
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "0 of 2 required signatures" })).toBeVisible();
  });

  test("case 7: G1 + G2 change the rules — approved, ADMIN 2 of 2", async ({ page }) => {
    await signAndAct(page, ["Governance 1", "Governance 2"], "Change the rules");
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "2 of 2 required signatures" })).toBeVisible();
  });

  test("case 8: A1 (not an EXIT signer) tries to exit to the chest — denied, 0 counted", async ({ page }) => {
    await signAndAct(page, ["Approver 1"], "Exit the position to the chest");
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "0 of 1 required signatures" })).toBeVisible();
  });
});

test.describe("Demo — classic multisig contrast", () => {
  test("case 1 and case 3 both need 2 signatures in classic mode", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("checkbox", { name: /Classic multisig/ }).check();

    await page.getByRole("button", { name: "Operator 1" }).click();
    await page.getByRole("button", { name: "Exit the position to the chest" }).click();
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "1 of 2 required signatures" })).toBeVisible();

    await page.getByRole("button", { name: "Enter the position" }).click();
    await expect(page.getByRole("img", { name: "1 of 2 required signatures" })).toBeVisible();
  });

  test("case 2 is approved with 2 keys in classic mode, since destination isn't checked", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("checkbox", { name: /Classic multisig/ }).check();
    await signAndAct(page, ["Operator 1", "Operator 2"], "Exit the position to an outside address");
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();
  });
});

test.describe("Demo — shortcuts and shareable state", () => {
  test("'A 3 a.m. exit' reproduces case 1 in one click", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "A 3 a.m. exit" }).click();
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();
  });

  test("'A stolen operator key' reproduces case 2 in one click", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "A stolen operator key" }).click();
    await expect(resultPanel(page).getByText("Denied", { exact: true })).toBeVisible();
    await expect(
      resultPanel(page).getByText("The exit rule only allows the chest as destination, even though the signature is valid."),
    ).toBeVisible();
  });

  test("a result can be shared and restored via its URL", async ({ page, context }) => {
    await page.goto("/#demo");
    await signAndAct(page, ["Operator 1", "Approver 1", "Approver 2"], "Enter the position");
    await expect(resultPanel(page).getByText("Approved", { exact: true })).toBeVisible();

    const url = page.url();
    expect(url).toContain("signed=O1%2CA1%2CA2");
    expect(url).toContain("action=enter");

    const fresh = await context.newPage();
    await fresh.goto(url);
    await expect(resultPanel(fresh).getByText("Approved", { exact: true })).toBeVisible();
    await expect(fresh.getByRole("button", { name: "Enter the position" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("the 'Why?' panel lists the evaluation steps in order", async ({ page }) => {
    await page.goto("/#demo");
    await page.getByRole("button", { name: "Why?" }).click();
    // Default scenario (no keys signed, exit-to-treasury) passes the policy
    // check and fails on the threshold: route, count, policy, threshold.
    const steps = resultPanel(page).locator("ol li");
    await expect(steps).toHaveCount(4);
    await expect(steps.first()).toContainText("Route");
  });
});
