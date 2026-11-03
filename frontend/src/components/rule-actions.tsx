"use client";

import { useState } from "react";

type ActionKey = "simulate" | "diff" | "apply";

const COPY: Record<ActionKey, string> = {
  simulate:
    "roles simulate replays a candidate call against this configuration using a network fork. It needs a Soroban RPC endpoint and a funded account, so it isn't wired up in this preview — run it from the CLI once a policy is deployed to testnet.",
  diff: "roles diff compares this configuration against another version and highlights any widening of permissions. It reads two config files locally and doesn't need network access — see cli/.",
  apply:
    "roles apply generates the rule-creation and policy-installation transactions for the Smart Account Kit to sign. It needs a deployed roles-policy contract address, which this preview doesn't have yet.",
};

export function RuleActions() {
  const [open, setOpen] = useState<ActionKey | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(COPY) as ActionKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setOpen(open === key ? null : key)}
            className={`rounded-2xl border px-3 py-1.5 text-xs tracking-wide transition ${
              open === key
                ? "border-pale text-pale"
                : "border-line text-mist hover:border-mist hover:text-pale"
            }`}
          >
            roles {key}
          </button>
        ))}
      </div>
      {open && (
        <p className="mt-3 max-w-xl rounded-2xl border border-line bg-surface p-3 text-xs text-mist">
          {COPY[open]}
        </p>
      )}
    </div>
  );
}
