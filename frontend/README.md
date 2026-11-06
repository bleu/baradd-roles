# Baradd frontend

The Next.js frontend provides the product website and treasury interface.

## Routes

- `app/(marketing)` contains the website at `/`, including an interactive permission demo, configuration examples, and security information.
- `app/(app)` contains the treasury interface at `/app`.
- `/docs` redirects to the [technical specification](../docs/spec.md).

## Account data and signing

The treasury interface supports three kinds of account data:

| Kind | Storage and behavior |
| --- | --- |
| Example accounts | Illustrative data bundled with the app |
| Local drafts | Browser-local configuration with TOML export; no account is deployed |
| On-chain accounts | Testnet account, rule, threshold, and policy reads through Soroban RPC |

Account bookmarks and logical role-group mappings are stored in the browser. Contract state is read from the network.

The account and rule forms build transactions, request wallet signatures, and submit them to testnet. Freighter and Hana are configured signer wallets. Account creation installs the first administrative group, then adds further groups and an optional first permission rule through separate transactions. Rule creation currently uses administrative rule `0`.

Each independently authorizing role group becomes a separate on-chain context rule. Permission rules use `CallContract` for one target contract, with `RolesPolicy` and a threshold policy where needed.

Mainnet is disabled. Protocol action buttons do not execute DeFi transactions. The rule-page CLI buttons display explanations rather than running CLI commands.

The website's interactive demo is separate from these testnet flows. It evaluates a fixed example in the browser without wallet access or RPC calls.

## Visual design and content

Brand assets are in `public/brand/`. Keep the values in `public/brand/design-tokens.css` and `src/app/globals.css` in sync.

Website claims and status content are in `src/content/`. `scripts/check-claims.ts` checks rendered copy for unsupported claims and restricted wording.

## Development

Install dependencies from the repository root:

```sh
pnpm install
pnpm --filter frontend dev
```

## Checks

Run from the repository root:

```sh
pnpm --filter frontend test
pnpm --filter frontend test:e2e
pnpm --filter frontend check-claims
pnpm --filter frontend lint
pnpm --filter frontend build
```

Unit tests cover permission evaluation and interface behavior. Playwright covers browser flows and runs separately from the current CI workflow. The production build uses `next build --webpack`.
