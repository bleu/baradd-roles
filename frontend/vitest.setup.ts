import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// RTL's own auto-cleanup only registers itself when `afterEach` is a
// global (vitest's `test.globals: true`); this project imports test APIs
// explicitly instead, so register cleanup by hand.
afterEach(() => {
  cleanup();
});
