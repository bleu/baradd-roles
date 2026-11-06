import type { NetworkId } from "@/lib/network-store";

export interface OnchainNetworkConfigValues {
  rpcUrl: string;
  networkPassphrase: string;
  accountWasmHash: string;
  thresholdPolicyAddress: string;
  rolesPolicyAddress: string;
}

// Real testnet addresses — same ones already verified this session (see
// thoughts/testnet-deployment.md) and cross-checked against
// smart-account-kit's own demo/.env.example, which deploys the identical
// stellar-accounts v0.8.0 contracts.
const TESTNET_CONFIG: OnchainNetworkConfigValues = {
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
  accountWasmHash: "c514d35ea67eaea9bfc1fb3327854c0c06111bc1ddebd4fe217c504c1004b9e1",
  thresholdPolicyAddress: "CAZ2WFUDXGX265LOEARFEOYYUL6F4BYWXZLGUAWZNJY3MRFPNLSZVS4S",
  rolesPolicyAddress: "CCVR6FJSG3IX4NNKPFPZ6R3DWJROUFEDN2JJAN2XNXDIS3YXNPL6QVWF",
};

// No mainnet addresses have been verified yet (see cli/src/commands/apply.ts's
// TESTNET_DEFAULTS comment) — the network selector keeps mainnet disabled
// until this has a real, checked entry.
export const NETWORK_CONFIGS: Record<NetworkId, OnchainNetworkConfigValues | null> = {
  testnet: TESTNET_CONFIG,
  mainnet: null,
};

export function getNetworkConfig(network: NetworkId): OnchainNetworkConfigValues {
  const config = NETWORK_CONFIGS[network];
  if (!config) throw new Error(`No verified contract addresses for "${network}" yet.`);
  return config;
}
