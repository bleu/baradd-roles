# Barad — frontend

Two route groups, per `Barad landing page design and messaging specification.md`:

- `app/(marketing)` — the landing page at `/`: hero, an interactive "try to move the treasury" demo, how it works, a real policy example, real CLI output, a comparison of approaches, security/status, audience, roadmap, FAQ.
- `app/(app)` — the prototype wallet UI at `/app`: browse accounts, inspect their ADMIN/EXIT/ENTRY context rules, and read the installed `RolesPolicy` configuration in plain language. Every screen carries a "Demo data" banner.

`/docs` redirects to `docs/spec.md` in the repository.

## Status

Illustrative only — `src/lib/mock-data.ts` holds placeholder accounts and policies. Nothing here reads from testnet or mainnet yet; wiring it up needs a deployed `roles-policy` contract and a preset for a real protocol (see `docs/spec.md`, "MVP scope"). Connecting Freighter works today (read-only: it reads the active address and network, it doesn't sign anything). Every factual claim on the landing page traces to `src/content/claims.ts`; `scripts/check-claims.ts` fails the build on a forbidden word or an unqualified "audited."

## Development

```sh
pnpm install
pnpm dev
```

## Tests

```sh
pnpm test          # evaluate() — the demo's pure evaluation logic, the 8 required cases from the spec
pnpm check-claims   # scans rendered copy for forbidden claims
```

## Build

```sh
pnpm build
```

Runs `next build --webpack`. Turbopack's production build has a flaky bug fetching Google Fonts in Next.js 16.4.4 (`Can't resolve '@vercel/turbopack-next/internal/font/google/font'`) that doesn't affect `next dev` — webpack is used for `build` until that's fixed upstream.
