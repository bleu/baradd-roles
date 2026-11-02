# Barad — frontend

A treasury wallet UI for Stellar Roles smart accounts: browse accounts, inspect their ADMIN/EXIT/ENTRY context rules, and read the installed `RolesPolicy` configuration in plain language.

## Status

Illustrative only — `src/lib/mock-data.ts` holds placeholder accounts and policies. Nothing here reads from testnet or mainnet yet; wiring it up needs a deployed `roles-policy` contract and a preset for a real protocol (see `docs/spec.md`, "MVP scope"). Connecting Freighter works today (read-only: it reads the active address and network, it doesn't sign anything).

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```

Runs `next build --webpack`. Turbopack's production build has a flaky bug fetching Google Fonts in Next.js 16.4.4 (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`) that doesn't affect `next dev` — webpack is used for `build` until that's fixed upstream.
