import { test, expect } from "@playwright/test";

// Regression test for a real bug: `next build --webpack` (forced, since
// Turbopack has a flaky Google Fonts issue on this Next version) had no
// PostCSS/Tailwind config of its own — only next.config.ts's
// `turbopack.rules` loader existed, which `next dev`'s default Turbopack
// picks up but a webpack build never does. The production CSS bundle
// shipped with none of Tailwind's generated utility classes, only the
// hand-written rules in globals.css. Every other E2E test in this suite runs
// against `pnpm dev`, which never exercises this path — this one runs
// against the actual production build (see the "production-build" project
// in playwright.config.ts) so this class of bug can't silently ship again.
test.describe("Production build", () => {
  test("Tailwind CSS is actually applied", async ({ page }) => {
    await page.goto("/");

    // `border-[3px]` is a Tailwind arbitrary-value utility — if Tailwind's
    // utilities didn't compile into the production CSS bundle, this falls
    // back to the browser default border width (and the element is
    // borderless, since it has no hand-written CSS rule of its own).
    const heroVisual = page.getByTestId("hero-visual");
    await expect(heroVisual).toHaveCSS("border-top-width", "3px");

    await expect(page.getByRole("heading", { name: "Leave with one key. Enter with many.", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "How it works" })).toBeVisible();
  });
});
