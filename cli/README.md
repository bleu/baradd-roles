# @baradd/cli

`roles` checks, compares, and installs Baradd Roles configurations. See the [technical specification](../docs/spec.md#tooling-cli-and-sdk) for the permission model.

Run from the repository root after installing workspace dependencies:

```sh
pnpm --filter @baradd/cli exec tsx src/index.ts <command>
```

## Commands

| Command | Behavior |
| --- | --- |
| `roles lint <config.toml>` | Checks thresholds, conditions, duplicate targets, and contract configuration limits without a network connection |
| `roles diff <before.toml> <after.toml>` | Compares local configurations and reports permission changes |
| `roles apply <config.toml>` | Prints an installation plan; use `--submit` to sign and submit |
| `roles simulate <config> <call>` | Not implemented |

Lint warns about potentially loose permissions. It does not prove that an exit function is safe or that a protocol integration is correct. Diff compares configuration structure, not on-chain state.

## Policy installation

`apply` requires `--policy-contract <address>`. By default, it uses testnet and prints a local plan without RPC calls or transaction construction.

```sh
pnpm --filter @baradd/cli exec tsx src/index.ts apply <config.toml> \
  --policy-contract <policy-contract-address>
```

To submit, add `--submit` and one or more `--admin-signer-env <VAR>` flags. Each environment variable supplies a signing key for an existing administrative rule. Never commit those keys.

| Flag | Use |
| --- | --- |
| `--submit` | Sign and submit instead of printing a local plan |
| `--network testnet\|mainnet` | Select the network; defaults to testnet |
| `--policy-contract <address>` | Deployed `RolesPolicy` address; required |
| `--admin-rule-id <id>` | Existing rule that authorizes installation; defaults to `0` |
| `--admin-signer-env <VAR>` | Environment variable containing an administrative signing key; repeatable |
| `--rule <name>` | Select rules from the configuration; repeatable |
| `--rpc-url <url>` | Override the RPC endpoint |
| `--network-passphrase <passphrase>` | Override the network passphrase |
| `--account-wasm-hash <hash>` | Override the account Wasm hash |
| `--webauthn-verifier <address>` | Override the WebAuthn verifier |
| `--ed25519-verifier <address>` | Override the Ed25519 verifier |

Mainnet requires explicit values for all five network overrides. The code is experimental and has not been externally audited.

Installation creates a `Default` context rule and installs the supplied `RolesPolicy` configuration. It does not install `simple_threshold`: the TOML threshold appears in lint and the plan but is not applied on submission. The resulting rule requires all listed signers. The frontend's rule-creation path supports lower thresholds.

The existing administrative rule authorizes installation. The new rule's signer set does not authorize its own creation.

See the [example TOML files](../examples/) and [SDK documentation](../sdk/README.md) for configuration tools.
