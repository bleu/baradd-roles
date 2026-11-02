import type { Signer } from "@/lib/types";
import { shortAddr } from "@/lib/format";

export function SignerList({ signers, threshold }: { signers: Signer[]; threshold: number }) {
  return (
    <ul className="divide-y divide-line rounded-sm border border-line">
      {signers.map((s, i) => (
        <li key={s.address} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${i < threshold ? "bg-lamp" : "bg-line"}`}
              aria-hidden
            />
            <span className="text-ink">{s.label ?? shortAddr(s.address)}</span>
          </div>
          <span className="font-mono text-xs text-stone">{shortAddr(s.address, 6, 6)}</span>
        </li>
      ))}
    </ul>
  );
}
