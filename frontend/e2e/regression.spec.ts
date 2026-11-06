import { test, expect, type Page } from "@playwright/test";

function collectConsoleErrors(page: Page): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") messages.push(msg.text());
  });
  page.on("pageerror", (err) => messages.push(String(err)));
  return messages;
}

test.describe("Regression", () => {
  test("plain landing page load has no console errors or hydration warnings", async ({ page }) => {
    const messages = collectConsoleErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();
    expect(messages).toEqual([]);
  });

  test("visiting the homepage does not rewrite the URL with default demo state", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();
    // The demo's URL-sync effect must not fire for default state (no signed
    // keys, default action, classic off) — otherwise every plain visit to "/"
    // gets its address bar dirtied with "?action=exit-to-treasury#demo"
    // before the user has touched anything.
    await expect(page).toHaveURL(/\/$/);
  });

  test("restoring a shared demo link raises no console noise beyond the known hydration mismatch", async ({
    page,
  }) => {
    const messages = collectConsoleErrors(page);
    await page.goto("/?signed=O1&action=exit#demo");
    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();

    // Known, accepted cost of the Demo component's useState(readFromUrl) lazy
    // initializer: it reads shareable state from the URL synchronously before
    // first paint, which is correct for restoring a shared link but can cause
    // a server/client markup mismatch when the URL carries query params. This
    // is documented in demo.tsx. The regression this test guards against is
    // unrelated console noise appearing alongside that known, bounded cost.
    const other = messages.filter((m) => !/hydration/i.test(m));
    expect(other).toEqual([]);
  });
});
