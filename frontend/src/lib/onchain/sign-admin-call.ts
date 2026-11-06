import { Transaction, TransactionBuilder, authorizeEntry, rpc, type xdr } from "@stellar/stellar-sdk";
import { base64ToBytes } from "./base64";
import { signAuthEntryWithWallet } from "../wallets";
import { getEntryAddress, getInvokeHostFunctionOp, signAndSubmitEnvelope } from "./submit-envelope";
import { buildDelegateCheckAuthEntry, encodeAuthDigestPreimage, encodeAuthPayload } from "./auth-payload";
import type { NativeSigner } from "./native";

export interface AdminCallSigner {
  /** G-address of a Delegated signer on the context rule authorizing this call. */
  address: string;
  /** Connected wallet id controlling that address. */
  walletId: string;
}

export interface SignAndSubmitAdminCallOptions {
  rpcUrl: string;
  networkPassphrase: string;
  accountId: string;
  /** The already-existing Default-type context rule (e.g. Governance or Admin) this call is authorized under. */
  contextRuleId: number;
  /** The prepared (simulated) transaction XDR for a self-call like add_context_rule. */
  preparedXdr: string;
  /** Exactly the Delegated signers contributing to satisfy that rule's threshold/policy — not necessarily all of its registered signers. */
  contributingSigners: AdminCallSigner[];
  /** Wallet id that signs the outer transaction envelope (pays the fee); may or may not be one of contributingSigners. */
  sourceWalletId: string;
}

export interface SignAndSubmitAdminCallResult {
  hash: string;
  /** add_context_rule's return value (the new ContextRule, including its assigned id) — see decode-new-rule-id.ts. */
  returnValue?: xdr.ScVal;
}

/**
 * Signs and submits a call that triggers the smart account's own
 * `self.require_auth()` (add_context_rule, remove_context_rule, add_signer,
 * etc.), using this contract's actual custom authorization scheme — verified
 * against the real `stellar-accounts` 0.8.0 crate source, not assumed:
 *
 * 1. The account's own self-authorization entry (returned by simulation)
 *    gets a custom `AuthPayload` ScVal as its signature, built directly
 *    (authorizeEntry's default "Vec<{public_key,signature}>" wrapping does
 *    not apply to this contract — see auth-payload.ts).
 * 2. Each contributing Delegated signer needs its OWN separate, manually
 *    constructed auth entry (simulation never returns these — the call
 *    happens inside __check_auth itself), authenticated the standard way
 *    since the delegate is a plain classic account.
 */
export async function signAndSubmitAdminCall(
  opts: SignAndSubmitAdminCallOptions,
): Promise<SignAndSubmitAdminCallResult> {
  if (opts.contributingSigners.length === 0) {
    throw new Error("At least one connected signer is required to authorize this.");
  }

  const server = new rpc.Server(opts.rpcUrl);
  const tx = new Transaction(opts.preparedXdr, opts.networkPassphrase);
  const envelope = tx.toEnvelope();
  const invokeHostFunctionOp = getInvokeHostFunctionOp(envelope);

  const accountEntryIndex = invokeHostFunctionOp.auth.findIndex(
    (entry) => getEntryAddress(entry) === opts.accountId,
  );
  if (accountEntryIndex === -1) {
    throw new Error("No self-authorization entry found for this account on this transaction.");
  }
  const accountEntry = invokeHostFunctionOp.auth[accountEntryIndex];

  const latestLedger = await server.getLatestLedger();
  const validUntilLedgerSeq = latestLedger.sequence + 720; // ~1 hour

  const nativeSigners: NativeSigner[] = opts.contributingSigners.map((s) => ({
    tag: "Delegated",
    values: [s.address],
  }));

  let capturedPayload: Uint8Array | null = null;
  const signedAccountEntry = await authorizeEntry(
    accountEntry,
    async (_preimage, payload) => {
      capturedPayload = payload;
      const authPayloadScVal = encodeAuthPayload(
        opts.contextRuleId,
        nativeSigners.map((signer) => ({ signer, signature: new Uint8Array(0) })),
      );
      return { signatureScVal: authPayloadScVal };
    },
    validUntilLedgerSeq,
    opts.networkPassphrase,
  );
  if (!capturedPayload) {
    throw new Error("internal: did not capture the signature payload while signing the account entry");
  }

  const preimageScVal = encodeAuthDigestPreimage({
    account: opts.accountId,
    signature_payload: capturedPayload,
    context_rule_ids: [opts.contextRuleId],
  });

  const delegateEntries: xdr.SorobanAuthorizationEntry[] = [];
  for (const contributor of opts.contributingSigners) {
    const unsignedDelegateEntry = buildDelegateCheckAuthEntry(opts.accountId, contributor.address, preimageScVal);
    const signedDelegateEntry = await authorizeEntry(
      unsignedDelegateEntry,
      async (preimage) => {
        const signedBase64 = await signAuthEntryWithWallet(
          contributor.walletId,
          preimage.toXDR("base64"),
          opts.networkPassphrase,
        );
        return { signature: base64ToBytes(signedBase64), publicKey: contributor.address };
      },
      validUntilLedgerSeq,
      opts.networkPassphrase,
    );
    delegateEntries.push(signedDelegateEntry);
  }

  invokeHostFunctionOp.auth = [
    ...invokeHostFunctionOp.auth.slice(0, accountEntryIndex),
    signedAccountEntry,
    ...invokeHostFunctionOp.auth.slice(accountEntryIndex + 1),
    ...delegateEntries,
  ];

  // The first simulation (build-add-rule-tx.ts's prepareTransaction) ran
  // before any real auth was attached, so it never actually executed
  // __check_auth and its footprint doesn't cover the context rule/policy
  // storage __check_auth reads (verified against the real network: submitting
  // with that footprint fails with "trying to access contract data key
  // outside of the footprint" on ContextRuleData). Re-simulating now, with
  // the real auth entries already attached, exercises __check_auth for real
  // and discovers the correct footprint; assembleTransaction keeps our auth
  // entries as-is (it only replaces simulation-provided auth when the
  // transaction arrives with none).
  const reSimulateTx = TransactionBuilder.fromXDR(envelope.toXDR("base64"), opts.networkPassphrase) as Transaction;
  const resim = await server.simulateTransaction(reSimulateTx);
  if (rpc.Api.isSimulationError(resim)) {
    throw new Error(`Re-simulation after attaching signatures failed: ${resim.error}`);
  }
  const assembledTx = rpc.assembleTransaction(reSimulateTx, resim).build();

  return signAndSubmitEnvelope(server, assembledTx.toEnvelope(), opts.sourceWalletId, opts.networkPassphrase);
}
