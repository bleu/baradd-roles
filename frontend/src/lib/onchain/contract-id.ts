import { Address, StrKey, hash, xdr } from "@stellar/stellar-sdk";

/**
 * The standard, deterministic Soroban contract-id formula for a
 * `CreateContractV2` deployed from an address + salt (CAP-46):
 * `StrKey.encodeContract(sha256(HashIdPreimage::ContractId{ network_id, ContractIdPreimage::Address{ address, salt } }))`.
 * Verified against smart-account-kit's own `deriveContractAddress` (same
 * formula, used there to predict a passkey-born wallet's address) — this
 * is generic Soroban logic, not anything smart-account-kit-specific.
 */
export function deriveContractId(deployerAddress: string, salt: Uint8Array, networkPassphrase: string): string {
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: hash(networkPassphrase),
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({
          address: Address.fromString(deployerAddress).toScAddress(),
          salt,
        }),
      ),
    }),
  );
  return StrKey.encodeContract(hash(preimage.toXDR()));
}

export function randomSalt(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
