"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { PolicyBuilder } from "@/components/wallet/policy-builder";
import { RoleGroupsEditor } from "@/components/wallet/role-groups-editor";
import { LintPanel } from "@/components/wallet/lint-panel";
import { HonestLimit } from "@/components/ui/honest-limit";
import { accountRuleToConfigFile } from "@/lib/to-sdk-config";
import type { ContextRule, RoleGroup, Target } from "@/lib/types";

export function CreateRuleForm({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { addRule } = useAccountsStore();
  const [name, setName] = useState("");
  const [target, setTarget] = useState<Target>({ contract: "", fns: [] });
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  const draftRule: ContextRule = useMemo(
    () => ({
      id: -1,
      kind: "Rule",
      name: name || "(untitled rule)",
      roleGroups,
      target,
    }),
    [name, roleGroups, target],
  );

  const configFile = useMemo(() => {
    if (target.fns.length === 0 || !target.contract.trim()) return null;
    try {
      return accountRuleToConfigFile(accountId, draftRule);
    } catch {
      return null;
    }
  }, [accountId, draftRule, target]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the rule a name.");
    if (!target.contract.trim()) return setError("The rule needs a contract address.");
    if (target.fns.length === 0) return setError("Add at least one function.");
    if (target.fns.some((fn) => !fn.name.trim())) return setError("Every function needs a name.");
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);
    if (withSigners.length === 0) return setError("Add at least one signer group.");

    const rule = addRule(accountId, {
      kind: "Rule",
      name: name.trim(),
      roleGroups: withSigners,
      target,
    });
    router.push(`/app/${accountId}/rules/${rule.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <HonestLimit>
        This installs nothing yet — it&apos;s saved in this browser. Use the Export panel below to
        get a config file for roles lint/apply once you&apos;ve deployed roles-policy.
      </HonestLimit>

      <div>
        <label className="text-xs tracking-[0.2em] text-mist uppercase" htmlFor="rule-name">
          Name
        </label>
        <input
          id="rule-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Example Vault withdraw"
          className="mt-2 w-full rounded-2xl border-[3px] border-line bg-surface px-3 py-2 text-sm text-pale placeholder:text-mist"
        />
      </div>

      <div>
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
          Contract and functions — deny-by-default, only what&apos;s listed is allowed
        </h2>
        <div className="mt-3">
          <PolicyBuilder target={target} onChange={setTarget} />
        </div>
      </div>

      <div>
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Signers</h2>
        <p className="mt-2 text-sm text-mist">
          Governance, Admin, and Operator are independent paths here too — any one group alone,
          satisfying its own threshold, can authorize a call that matches this rule.
        </p>
        <div className="mt-3">
          <RoleGroupsEditor
            roleGroups={roleGroups}
            onChange={setRoleGroups}
            allowedRoles={["governance", "admin", "operator"]}
          />
        </div>
      </div>

      {configFile && (
        <div>
          <h2 className="text-xs tracking-[0.2em] text-mist uppercase">roles lint (live)</h2>
          <div className="mt-3">
            <LintPanel config={configFile} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-denied">{error}</p>}

      <button
        type="submit"
        className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
      >
        Add rule
      </button>
    </form>
  );
}
