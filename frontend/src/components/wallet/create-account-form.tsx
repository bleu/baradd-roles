"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { RoleGroupsEditor } from "@/components/wallet/role-groups-editor";
import { HonestLimit } from "@/components/ui/honest-limit";
import type { RoleGroup } from "@/lib/types";

export function CreateAccountForm() {
  const router = useRouter();
  const { createAccount } = useAccountsStore();
  const [label, setLabel] = useState("");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("Give the chest a label.");
      return;
    }
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);
    if (withSigners.length === 0) {
      setError("Add at least one Governance or Admin signer.");
      return;
    }
    const account = createAccount({
      label: label.trim(),
      network,
      adminRoleGroups: withSigners,
    });
    router.push(`/app/${account.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <HonestLimit>
        Saved in this browser only. Nothing here is deployed on-chain — install it for real with
        roles apply once you&apos;ve deployed roles-policy to testnet.
      </HonestLimit>

      <div>
        <label className="text-xs tracking-[0.2em] text-mist uppercase" htmlFor="label">
          Label
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Main chest"
          className="mt-2 w-full rounded-2xl border-[3px] border-line bg-surface px-3 py-2 text-sm text-pale placeholder:text-mist"
        />
      </div>

      <div>
        <span className="text-xs tracking-[0.2em] text-mist uppercase">Network</span>
        <div className="mt-2 flex gap-2">
          {(["testnet", "mainnet"] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNetwork(n)}
              className={`rounded-2xl border px-3 py-1.5 text-sm transition ${
                network === n ? "border-pale text-pale" : "border-line text-mist hover:border-mist"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
          Who can create, edit, or delete rules
        </h2>
        <p className="mt-2 text-sm text-mist">
          Governance and Admin are independent paths — either one alone, satisfying its own
          threshold, is enough. Operators don&apos;t belong here: they only get power once you add
          them to a specific rule below.
        </p>
        <div className="mt-3">
          <RoleGroupsEditor
            roleGroups={roleGroups}
            onChange={setRoleGroups}
            allowedRoles={["governance", "admin"]}
          />
        </div>
      </div>

      {error && <p className="text-sm text-denied">{error}</p>}

      <button
        type="submit"
        className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
      >
        Create chest
      </button>
    </form>
  );
}
