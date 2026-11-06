import type { Target } from "@/lib/types";
import { shortAddr } from "@/lib/format";
import { describeCond } from "@/lib/describe";

export function PolicyView({ target }: { target: Target }) {
  return (
    <div className="rounded-2xl border-[3px] border-line">
      <div className="flex items-center justify-between border-b-[3px] border-line bg-surface px-4 py-2.5">
        <span className="text-sm text-pale">{target.label ?? "Contract"}</span>
        <span className="font-mono text-xs text-mist">{shortAddr(target.contract, 6, 6)}</span>
      </div>
      <ul className="divide-y-[3px] divide-line">
        {target.fns.map((fn) => (
          <li key={fn.name} className="px-4 py-3">
            <div className="font-mono text-sm text-pale">{fn.name}()</div>
            {fn.conds.length > 0 ? (
              <ul className="mt-1.5 space-y-1">
                {fn.conds.map((c, i) => (
                  <li key={i} className="font-mono text-xs text-mist">
                    {describeCond(c)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-xs text-mist">No argument conditions — any call to this function is allowed.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
