import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /production-build\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3100" },
    },
    {
      // Runs against a real `next build --webpack` + `next start`, not the
      // dev server — see production-build.spec.ts for why that distinction
      // matters.
      name: "production-build",
      testMatch: /production-build\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3101" },
    },
  ],
  webServer: [
    {
      command: "pnpm dev -p 3100",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "pnpm build && pnpm start -p 3101",
      url: "http://localhost:3101",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
