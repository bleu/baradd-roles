"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAccountsStore } from "@/hooks/use-accounts-store";
import { PolicyView } from "@/components/policy-view";
import { RuleActions } from "@/components/rule-actions";
import { RoleGroupsEditor } from "@/components/wallet/role-groups-editor";
import { RuleHeader } from "@/components/wallet/rule-header";
import { CodeBlock } from "@/components/ui/code-block";
import { accountRuleToConfigFile } from "@/lib/to-sdk-config";
import { stringifyConfigFile } from "@baradd/sdk";
import type { RoleGroup } from "@/lib/types";

export function DraftRulePage({ accountId, ruleId }: { accountId: string; ruleId: number }) {
  const { accounts, updateRule } = useAccountsStore();

  const account = accounts.find((a) => a.id === accountId);
  const rule = account?.rules.find((r) => r.id === ruleId);

  const toml = useMemo(() => {
    if (!rule?.target) return null;
    try {
      return stringifyConfigFile(accountRuleToConfigFile(accountId, rule));
    } catch {
      return null;
    }
  }, [accountId, rule]);

  if (!account || !rule) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/app/${accountId}`} className="text-xs text-mist transition hover:text-pale">
          ← Chest
        </Link>
        <p className="mt-6 text-sm text-mist">
          No draft rule with this id in this browser.
        </p>
      </div>
    );
  }

  function onRoleGroupsChange(groups: RoleGroup[]) {
    updateRule(accountId, ruleId, { roleGroups: groups });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <RuleHeader backHref={`/app/${accountId}`} backLabel={account.label} rule={rule} />

      <section className="mt-10 border-[3px] border-line bg-surface p-6">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Signers</h2>
        <p className="mt-2 text-sm text-mist">
          Each group below is an independent path — satisfying any one group&apos;s own threshold is
          enough.
        </p>
        <div className="mt-3">
          <RoleGroupsEditor
            roleGroups={rule.roleGroups}
            onChange={onRoleGroupsChange}
            allowedRoles={rule.kind === "Admin" ? ["governance", "admin"] : ["governance", "admin", "operator"]}
          />
        </div>
      </section>

      {rule.target ? (
        <>
          <section className="mt-10 border-[3px] border-line bg-surface p-6">
            <h2 className="text-xs tracking-[0.2em] text-mist uppercase">What it allows</h2>
            <p className="mt-2 text-sm text-mist">
              Deny-by-default: any contract, function, or argument not listed below is rejected.
            </p>
            <div className="mt-3">
              <PolicyView target={rule.target} />
            </div>
          </section>

          {toml && (
            <section className="mt-10 border-[3px] border-line bg-surface p-6">
              <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Export</h2>
              <p className="mt-2 text-sm text-mist">
                Feed this to roles lint/apply once roles-policy is deployed to testnet.
              </p>
              <div className="mt-3">
                <CodeBlock code={toml} filename={`${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.toml`} />
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="mt-10 border-[3px] border-line bg-surface p-6 text-sm text-mist">
          This is the Admin rule — it has no RolesPolicy attached. Its signers can change rules and
          install or remove policies on the other rules.
        </section>
      )}

      <section className="mt-10 border-[3px] border-line bg-surface p-6">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Tooling</h2>
        <div className="mt-3">
          <RuleActions />
        </div>
      </section>
    </div>
  );
}
