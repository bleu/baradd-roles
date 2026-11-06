// Maps plain addresses/numbers into the native tag/values shape
// `Spec.nativeToScVal` expects for the account contract's own types —
// verified against the real contract spec in account-spec.ts, not guessed.

export interface NativeSigner {
  tag: "Delegated";
  values: [string];
}

export function signersToNative(addresses: string[]): NativeSigner[] {
  return addresses.map((address) => ({ tag: "Delegated", values: [address] }));
}

export function thresholdParamsToNative(threshold: number): { threshold: number } {
  return { threshold };
}
