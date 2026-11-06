"use client";

// Thin wrapper around @creit-tech/stellar-wallets-kit, scoped to the two
// classic wallets that actually support signing a Soroban auth entry
// (SEP-43), not just a whole transaction — required for a wallet to be a
// `Delegated` signer on a Barad Roles rule, not just a fee-payer.
//
// Checked every lightweight wallet module in this library directly (not
// assumed): Freighter and Hana implement a real signAuthEntry. xBull,
// Lobstr, Rabet, and Albedo all reject it outright. Traced xBull's specifically
// down to its real extension bridge (window.xBullSDK only exposes
// signTransaction/signMessage, no auth-entry call) — this is a genuine gap
// in those wallets today, not a choice this app is making.
import { StellarWalletsKit, Networks } from "@creit-tech/stellar-wallets-kit";
import { FreighterModule } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { HanaModule } from "@creit-tech/stellar-wallets-kit/modules/hana";

export interface SupportedWallet {
  id: string;
  name: string;
}

export const SUPPORTED_SIGNER_WALLETS: SupportedWallet[] = [
  { id: "freighter", name: "Freighter" },
  { id: "hana", name: "Hana" },
];

let initialized = false;

function ensureInit() {
  if (initialized) return;
  StellarWalletsKit.init({
    modules: [new FreighterModule(), new HanaModule()],
    network: Networks.TESTNET,
  });
  initialized = true;
}

export interface ConnectedWallet {
  walletId: string;
  walletName: string;
  address: string;
}

/** Connects the given wallet (prompts it for access) and returns its address. */
export async function connectWallet(walletId: string): Promise<ConnectedWallet> {
  ensureInit();
  StellarWalletsKit.setWallet(walletId);
  // fetchAddress() (not getAddress()) actually asks the module to connect —
  // getAddress() only reads whatever's already in the kit's memory and
  // throws if nothing has connected yet.
  const { address } = await StellarWalletsKit.fetchAddress();
  const wallet = SUPPORTED_SIGNER_WALLETS.find((w) => w.id === walletId);
  return { walletId, walletName: wallet?.name ?? walletId, address };
}

/** Signs a full transaction XDR with the given already-connected wallet. */
export async function signTransactionWithWallet(
  walletId: string,
  xdr: string,
  networkPassphrase: string,
): Promise<string> {
  ensureInit();
  StellarWalletsKit.setWallet(walletId);
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, { networkPassphrase });
  return signedTxXdr;
}

/** Signs a single Soroban authorization entry's preimage with the given wallet. */
export async function signAuthEntryWithWallet(
  walletId: string,
  preimageXdr: string,
  networkPassphrase: string,
): Promise<string> {
  ensureInit();
  StellarWalletsKit.setWallet(walletId);
  const { signedAuthEntry } = await StellarWalletsKit.signAuthEntry(preimageXdr, { networkPassphrase });
  return signedAuthEntry;
}
