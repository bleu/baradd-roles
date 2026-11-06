"use client";

import { useState } from "react";
import type { Signer } from "@/lib/types";
import { isPlausibleStellarAddress } from "@/lib/validate";

export function SignerEditor({
  signers,
  onChange,
}: {
  signers: Signer[];
  onChange: (signers: Signer[]) => void;
}) {
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addSigner() {
    const trimmed = address.trim();
    if (!isPlausibleStellarAddress(trimmed)) {
      setError("That doesn't look like a Stellar address (56 characters, starting with G, C, or M).");
      return;
    }
    if (signers.some((s) => s.address === trimmed)) {
      setError("This address is already a signer.");
      return;
    }
    onChange([...signers, { address: trimmed, label: label.trim() || undefined }]);
    setAddress("");
    setLabel("");
    setError(null);
  }

  function removeSigner(addr: string) {
    onChange(signers.filter((s) => s.address !== addr));
  }

  return (
    <div>
      <ul className="divide-y-[3px] divide-line rounded-2xl border-[3px] border-line">
        {signers.length === 0 && (
          <li className="px-4 py-3 text-sm text-mist">No signers yet.</li>
        )}
        {signers.map((s) => (
          <li key={s.address} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <div>
              <div className="text-pale">{s.label ?? "Signer"}</div>
              <div className="font-mono text-xs text-mist">{s.address}</div>
            </div>
            <button
              type="button"
              onClick={() => removeSigner(s.address)}
              className="rounded-2xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-denied hover:text-denied"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="GABCD... signer address"
          className="min-w-0 flex-1 rounded-2xl border-[3px] border-line bg-surface px-3 py-2 font-mono text-xs text-pale placeholder:text-mist"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="w-40 rounded-2xl border-[3px] border-line bg-surface px-3 py-2 text-sm text-pale placeholder:text-mist"
        />
        <button
          type="button"
          onClick={addSigner}
          className="rounded-2xl border-[3px] border-line px-3 py-2 text-sm text-pale transition hover:border-mist"
        >
          Add signer
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-denied">{error}</p>}
    </div>
  );
}
