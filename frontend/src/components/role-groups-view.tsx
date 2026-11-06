import type { RoleGroup } from "@/lib/types";
import { SignerList } from "@/components/signer-list";
import { ROLE_LABELS } from "@/lib/role-labels";
import { KeyholeRow } from "@/components/ui/keyhole";

/** Read-only display of a rule's role groups — each is an independent authorization path. */
export function RoleGroupsView({ roleGroups }: { roleGroups: RoleGroup[] }) {
  if (roleGroups.length === 0) {
    return <p className="text-sm text-mist">No signers configured yet.</p>;
  }

  return (
    <div className="space-y-4">
      {roleGroups.map((group, i) => (
        <div key={group.role}>
          {i > 0 && (
            <p className="py-2 text-center font-mono text-[10px] font-bold tracking-wide text-mist uppercase">
              or
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs tracking-[0.2em] text-mist uppercase">
              {ROLE_LABELS[group.role]} · {group.threshold} of {group.signers.length} required
            </h3>
            <KeyholeRow total={group.signers.length} required={group.threshold} size={16} />
          </div>
          <div className="mt-2">
            <SignerList signers={group.signers} threshold={group.threshold} />
          </div>
        </div>
      ))}
    </div>
  );
}
