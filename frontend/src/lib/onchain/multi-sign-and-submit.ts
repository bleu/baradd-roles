import { Transaction, authorizeEntry, rpc, xdr } from "@stellar/stellar-sdk";
import { base64ToBytes } from "./base64";
import { signAuthEntryWithWallet } from "../wallets";
import { getEntryAddress, getInvokeHostFunctionOp, signAndSubmitEnvelope } from "./submit-envelope";

/** Maps a signer's G-address to the connected wallet id that controls it. */
export type SignerWalletMap = Record<string, string>;

export interface MultiSignAndSubmitOptions {
  rpcUrl: string;
  networkPassphrase: string;
  /** The prepared (simulated) transaction XDR from build-create-account-tx.ts. */
  preparedXdr: string;
  signerWallets: SignerWalletMap;
  /** Wallet id that signs the outer transaction envelope (pays the fee). */
  sourceWalletId: string;
}

export interface MultiSignAndSubmitResult {
  hash: string;
}

/**
 * Collects a signature from each connected wallet that owns one of the
 * transaction's required Soroban auth entries, then signs the envelope and
 * submits — the standard Soroban multi-party-authorization pattern, using
 * `authorizeEntry`'s default signature convention.
 *
 * This is only correct for entries authorizing a *classic* address directly
 * (e.g. the deployer paying/authorizing account creation in
 * build-create-account-tx.ts). It is NOT correct for a smart account's own
 * self-authorization entry (e.g. add_context_rule) — that contract uses a
 * custom AuthPayload signature scheme instead; see auth-payload.ts and
 * sign-admin-call.ts for that path, verified against the real
 * `stellar-accounts` crate source.
 */
export async function multiSignAndSubmit(opts: MultiSignAndSubmitOptions): Promise<MultiSignAndSubmitResult> {
  const server = new rpc.Server(opts.rpcUrl);
  const tx = new Transaction(opts.preparedXdr, opts.networkPassphrase);
  const envelope = tx.toEnvelope();
  const invokeHostFunctionOp = getInvokeHostFunctionOp(envelope);

  if (invokeHostFunctionOp.auth.length > 0) {
    const latestLedger = await server.getLatestLedger();
    const validUntilLedgerSeq = latestLedger.sequence + 720; // ~1 hour

    const signedAuth: xdr.SorobanAuthorizationEntry[] = [];
    for (const entry of invokeHostFunctionOp.auth) {
      const address = getEntryAddress(entry);
      if (!address) {
        // Source-account-credentialed entries authorize themselves via the
        // envelope signature below; nothing more to do here.
        signedAuth.push(entry);
        continue;
      }
      const walletId = opts.signerWallets[address];
      if (!walletId) {
        throw new Error(
          `This needs a signature from ${address}, but no connected wallet controls it. Connect that signer's wallet first.`,
        );
      }
      const signed = await authorizeEntry(
        entry,
        async (preimage) => {
          const signedBase64 = await signAuthEntryWithWallet(
            walletId,
            preimage.toXDR("base64"),
            opts.networkPassphrase,
          );
          return { signature: base64ToBytes(signedBase64), publicKey: address };
        },
        validUntilLedgerSeq,
        opts.networkPassphrase,
      );
      signedAuth.push(signed);
    }
    invokeHostFunctionOp.auth = signedAuth;
  }

  return signAndSubmitEnvelope(server, envelope, opts.sourceWalletId, opts.networkPassphrase);
}
