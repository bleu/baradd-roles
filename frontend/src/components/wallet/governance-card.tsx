import type { ContextRule } from "@/lib/types";
import { RoleGroupsView } from "@/components/role-groups-view";

/** The account's own admin authority — who can change its rules and policies, shown separately from the policy rules below it. */
export function GovernanceCard({ adminRule }: { adminRule: ContextRule | undefined }) {
  if (!adminRule) return null;

  return (
    <div className="card-shadow border-[3px] border-line bg-surface p-6">
      <h2 className="font-display text-xl text-pale">{adminRule.name}</h2>
      <p className="mt-1 text-sm text-mist">Who can change this chest&apos;s rules and policies.</p>
      <div className="mt-4">
        <RoleGroupsView roleGroups={adminRule.roleGroups} />
      </div>
    </div>
  );
}
