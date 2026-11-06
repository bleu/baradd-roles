// Shape-only check, not a StrKey checksum validator: it catches obviously
// malformed input (wrong length, lowercase, stray characters) but does not
// guarantee the address is real or well-formed per SEP-0023. Good enough to
// stop a manager from submitting a typo; not a substitute for the wallet or
// contract validating the address for real.
const BASE32_56 = /^[A-Z2-7]{56}$/;

export function isPlausibleStellarAddress(value: string): boolean {
  if (!BASE32_56.test(value)) return false;
  return value[0] === "G" || value[0] === "C" || value[0] === "M";
}
