# @baradd/sdk

TypeScript tools for Baradd Roles configurations and policy installation. The [CLI](../cli/README.md) uses this package.

## Capabilities

- Parse, validate, and serialize TOML configurations.
- Lint thresholds, permission conditions, and contract configuration limits.
- Compare configurations and classify permission changes as widening, narrowing, or neutral.
- Encode policy configuration values for Soroban.
- Build an installation plan and submit rule creation with policy installation through the Smart Account Kit.

Parsing, lint, diff, and installation planning work offline. Submission needs a configured network, a deployed policy contract, and signers for an existing administrative rule. Installation creates a `Default` context rule restricted by `RolesPolicy`; it does not create the smart account.

The installer does not install a signature-threshold policy. It checks and reports the configured threshold but creates a rule that requires all listed signers. Use the frontend's rule-creation path for lower thresholds.

Candidate-call simulation through `roles simulate` is not implemented.

See the [technical specification](../docs/spec.md#tooling-cli-and-sdk) for behavior and limits, and [`src/index.ts`](src/index.ts) for exports.

## Development

Run from the repository root:

```sh
pnpm --filter @baradd/sdk test
pnpm --filter @baradd/sdk build
```
