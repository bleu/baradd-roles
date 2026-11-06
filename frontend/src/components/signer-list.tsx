import type { Signer } from "@/lib/types";
import { shortAddr } from "@/lib/format";
import { Keyhole } from "@/components/ui/keyhole";

export function SignerList({ signers, threshold }: { signers: Signer[]; threshold: number }) {
  return (
    <ul className="divide-y-[3px] divide-line border-[3px] border-line">
      {signers.map((s, i) => (
        <li key={s.address} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <Keyhole state={i < threshold ? "required" : "spare"} size={16} />
            <span className="text-pale">{s.label ?? shortAddr(s.address)}</span>
          </div>
          <span className="font-mono text-xs text-mist">{shortAddr(s.address, 6, 6)}</span>
        </li>
      ))}
    </ul>
  );
}
