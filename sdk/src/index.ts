export * from "./types.js";
export * from "./limits.js";
export * from "./schema.js";
export * from "./config-file.js";
export * from "./lint.js";
export * from "./diff.js";

// `./apply` (transaction-building, smart-account-kit) is NOT re-exported
// here. It pulls in smart-account-kit and @stellar/stellar-sdk, which drag
// in a browser wallet-adapter with an optional peer dependency — fine for
// the CLI, but it has no business in the frontend's bundle, which only ever
// needs the lightweight parsing/lint/TOML surface above. Import
// `@baradd/sdk/apply` explicitly where it's actually needed.
