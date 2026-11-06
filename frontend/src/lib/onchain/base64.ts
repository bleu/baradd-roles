// Browser-safe base64 <-> bytes, no Node `Buffer` dependency (this code runs
// client-side; Next.js doesn't polyfill Buffer in the browser bundle).
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
