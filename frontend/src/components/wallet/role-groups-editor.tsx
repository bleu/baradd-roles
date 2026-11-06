"use client";

import { SignerEditor } from "@/components/wallet/signer-editor";
import { ROLE_LABELS } from "@/lib/role-labels";
import type { RoleGroup, Signer, SignerRole } from "@/lib/types";

/**
 * Each enabled role is its own independent signer list + threshold —
 * satisfying any ONE role group authorizes the rule, they're not pooled
 * together. A signer can appear in more than one group (e.g. the same
 * address as both Governance and Operator).
 */
export function RoleGroupsEditor({
  roleGroups,
  onChange,
  allowedRoles,
}: {
  roleGroups: RoleGroup[];
  onChange: (groups: RoleGroup[]) => void;
  allowedRoles: SignerRole[];
}) {
  function addGroup(role: SignerRole) {
    onChange([...roleGroups, { role, signers: [], threshold: 1 }]);
  }

  function removeGroup(role: SignerRole) {
    onChange(roleGroups.filter((g) => g.role !== role));
  }

  function updateSigners(role: SignerRole, signers: Signer[]) {
    onChange(
      roleGroups.map((g) =>
        g.role === role ? { ...g, signers, threshold: Math.min(g.threshold, Math.max(signers.length, 1)) } : g,
      ),
    );
  }

  function updateThreshold(role: SignerRole, threshold: number) {
    onChange(roleGroups.map((g) => (g.role === role ? { ...g, threshold } : g)));
  }

  const activeRoles = new Set(roleGroups.map((g) => g.role));
  const inactiveRoles = allowedRoles.filter((r) => !activeRoles.has(r));

  return (
    <div className="space-y-4">
      {roleGroups.map((group) => (
        <div key={group.role} className="rounded-2xl border-[3px] border-line p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-pale">{ROLE_LABELS[group.role]}</h3>
            <button
              type="button"
              onClick={() => removeGroup(group.role)}
              className="rounded-xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-denied hover:text-denied"
            >
              Remove
            </button>
          </div>
          <div className="mt-3">
            <SignerEditor signers={group.signers} onChange={(s) => updateSigners(group.role, s)} />
          </div>
          {group.signers.length > 0 && (
            <label className="mt-3 block text-xs text-mist">
              Threshold: {group.threshold} of {group.signers.length}
              <input
                type="range"
                min={1}
                max={group.signers.length}
                value={Math.min(group.threshold, group.signers.length)}
                onChange={(e) => updateThreshold(group.role, Number(e.target.value))}
                className="mt-2 block w-full"
              />
            </label>
          )}
        </div>
      ))}

      {inactiveRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {inactiveRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => addGroup(role)}
              className="rounded-2xl border-[3px] border-line px-3 py-1.5 text-sm text-pale transition hover:border-mist"
            >
              + {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
