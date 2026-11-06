import { Address, TransactionBuilder, rpc, type Transaction, type xdr } from "@stellar/stellar-sdk";
import { signTransactionWithWallet } from "../wallets";

export interface SubmitEnvelopeResult {
  hash: string;
  /** The invoked function's return value, when the host function call produced one (e.g. add_context_rule's new ContextRule). */
  returnValue?: xdr.ScVal;
}

/** Signs the outer transaction envelope with the fee-paying wallet, submits, and polls for the result. */
export async function signAndSubmitEnvelope(
  server: rpc.Server,
  envelope: xdr.TransactionEnvelope,
  sourceWalletId: string,
  networkPassphrase: string,
): Promise<SubmitEnvelopeResult> {
  const unsignedEnvelopeXdr = envelope.toXDR("base64");
  const signedEnvelopeXdr = await signTransactionWithWallet(sourceWalletId, unsignedEnvelopeXdr, networkPassphrase);
  const signedTx = TransactionBuilder.fromXDR(signedEnvelopeXdr, networkPassphrase) as Transaction;

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status !== "PENDING") {
    throw new Error(`Submission failed (${sendResult.status}): ${JSON.stringify(sendResult.errorResult ?? "")}`);
  }

  const deadline = Date.now() + 30_000;
  let getResult = await server.getTransaction(sendResult.hash);
  while (getResult.status === "NOT_FOUND" && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    getResult = await server.getTransaction(sendResult.hash);
  }
  if (getResult.status !== "SUCCESS") {
    throw new Error(`Transaction ${sendResult.hash} did not succeed: ${getResult.status}`);
  }

  return { hash: sendResult.hash, returnValue: getResult.returnValue };
}

/** Finds the raw invokeHostFunctionOp inside a prepared transaction's first operation, for direct auth-list mutation. */
export function getInvokeHostFunctionOp(envelope: xdr.TransactionEnvelope): {
  auth: xdr.SorobanAuthorizationEntry[];
} {
  type RawOperation = { body: { invokeHostFunctionOp?: { auth: xdr.SorobanAuthorizationEntry[] } } };
  const innerTx = (envelope as unknown as { v1: { tx: { operations: RawOperation[] } } }).v1.tx;
  const invokeHostFunctionOp = innerTx.operations[0].body.invokeHostFunctionOp;
  if (!invokeHostFunctionOp) throw new Error("Expected an invokeHostFunction operation in this transaction.");
  return invokeHostFunctionOp;
}

/**
 * The address an address-credentialed Soroban auth entry authenticates, or
 * null for a source-account-credentialed entry. Handles both the legacy
 * `sorobanCredentialsAddress` shape and CAP-71's `sorobanCredentialsAddressV2`
 * (what `prepareTransaction` actually returns today — verified against a
 * real simulation; the two put the address under different field names).
 */
export function getEntryAddress(entry: xdr.SorobanAuthorizationEntry): string | null {
  const credentials = entry.credentials as unknown as {
    type: string;
    address?: { address: xdr.ScAddress };
    addressV2?: { address: xdr.ScAddress };
  };
  const addrAuth =
    credentials.type === "sorobanCredentialsAddress"
      ? credentials.address
      : credentials.type === "sorobanCredentialsAddressV2"
        ? credentials.addressV2
        : undefined;
  if (!addrAuth) return null;
  return Address.fromScAddress(addrAuth.address).toString();
}
