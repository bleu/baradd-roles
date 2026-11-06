// Implements this account contract's actual (non-standard) authorization
// scheme — verified by reading the real `stellar-accounts` 0.8.0 crate source
// (~/.cargo/registry/.../stellar-accounts-0.8.0/src/smart_account/{mod,storage}.rs
// and its own test/auth_entries.rs), not assumed:
//
// - The account's own self-authorization entry (for admin calls like
//   add_context_rule) does NOT use the generic "Vec<{public_key,signature}>"
//   signature convention `authorizeEntry` builds by default. Its custom
//   `__check_auth` expects an `AuthPayload { context_rule_ids, signers }`
//   ScVal instead, where `signers` maps each participating Signer to its raw
//   signature bytes (empty for Delegated signers — their proof is a separate
//   nested entry, not sig bytes here).
// - A `Signer::Delegated(address)` is authenticated by require_auth_for_args
//   on a manually constructed, separate top-level SorobanAuthorizationEntry
//   whose root invocation is a call to `<account>.__check_auth(preimage)` —
//   simulation never returns this (the call happens inside __check_auth
//   itself), so clients must build and append it themselves. THIS entry uses
//   the standard signature convention (the delegate is a plain classic
//   account), so it goes through authorizeEntry/wallet.signAuthEntry normally.
import { Address, Keypair, xdr } from "@stellar/stellar-sdk";
import { accountSpec, AUTH_PAYLOAD_TYPE, AUTH_DIGEST_PREIMAGE_TYPE } from "./account-spec";
import type { NativeSigner } from "./native";

/** A fresh, random nonce for a manually constructed auth entry (mirrors @stellar/stellar-sdk's own authorizeInvocation()). */
export function randomNonce(): bigint {
  const bytes = Keypair.random().rawPublicKey().subarray(0, 8);
  const view = new DataView(bytes.buffer, bytes.byteOffset, 8);
  return view.getBigInt64(0, false);
}

export interface AuthDigestPreimageNative {
  account: string;
  signature_payload: Uint8Array;
  context_rule_ids: number[];
}

export function encodeAuthDigestPreimage(preimage: AuthDigestPreimageNative): xdr.ScVal {
  return accountSpec.nativeToScVal(preimage, AUTH_DIGEST_PREIMAGE_TYPE);
}

/**
 * Builds the AuthPayload ScVal that goes directly into the smart account's
 * own address-credentials `signature` field (via authorizeEntry's
 * `{ signatureScVal }` escape hatch — its default signature wrapping doesn't
 * apply to this contract's custom scheme).
 *
 * `signerSignatures` must have one entry per signer contributing to this
 * authorization (exactly the signers passed to the policy's `enforce()`,
 * not necessarily every signer registered on the rule) — empty bytes for
 * Delegated signers, the real digest signature for External signers.
 */
export function encodeAuthPayload(
  contextRuleId: number,
  signerSignatures: Array<{ signer: NativeSigner; signature: Uint8Array }>,
): xdr.ScVal {
  const signersMap = new Map<NativeSigner, Uint8Array>();
  for (const { signer, signature } of signerSignatures) signersMap.set(signer, signature);
  return accountSpec.nativeToScVal(
    { context_rule_ids: [contextRuleId], signers: signersMap },
    AUTH_PAYLOAD_TYPE,
  );
}

/** The manually constructed entry that authenticates one Delegated signer against a given AuthDigestPreimage. */
export function buildDelegateCheckAuthEntry(
  accountId: string,
  delegateAddress: string,
  preimageScVal: xdr.ScVal,
): xdr.SorobanAuthorizationEntry {
  const invocation = new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: Address.fromString(accountId).toScAddress(),
        functionName: "__check_auth",
        args: [preimageScVal],
      }),
    ),
    subInvocations: [],
  });

  return new xdr.SorobanAuthorizationEntry({
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: Address.fromString(delegateAddress).toScAddress(),
        nonce: randomNonce(),
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVoid(),
      }),
    ),
    rootInvocation: invocation,
  });
}
