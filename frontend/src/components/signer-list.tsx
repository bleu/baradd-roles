import type { Signer } from "@/lib/types";
import { shortAddr } from "@/lib/format";

export function SignerList({ signers, threshold }: { signers: Signer[]; threshold: number }) {
  return (
    <ul className="divide-y divide-border rounded-sm border border-border">
      {signers.map((s, i) => (
        <li key={s.address} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${i < threshold ? "bg-gold" : "bg-muted-dim"}`}
              aria-hidden
            />
            <span className="text-foreground">{s.label ?? shortAddr(s.address)}</span>
          </div>
          <span className="font-mono text-xs text-muted-dim">{shortAddr(s.address, 6, 6)}</span>
        </li>
      ))}
    </ul>
  );
}
