"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PolicyBuilder } from "@/components/wallet/policy-builder";
import { RoleGroupsEditor } from "@/components/wallet/role-groups-editor";
import { ConnectedWalletsPanel } from "@/components/wallet/connected-wallets-panel";
import { HonestLimit } from "@/components/ui/honest-limit";
import { Tag } from "@/components/ui/tag";
import { buildAddRuleTransaction } from "@/lib/onchain/build-add-rule-tx";
import { signAndSubmitAdminCall, type AdminCallSigner } from "@/lib/onchain/sign-admin-call";
import { decodeNewRuleId } from "@/lib/onchain/decode-new-rule-id";
import { recordRuleGroup } from "@/lib/onchain/rule-groups-store";
import { getNetworkConfig } from "@/lib/onchain/config";
import { MAX_CONTEXT_RULE_NAME_SIZE } from "@/lib/onchain/account-spec";
import { useNetwork } from "@/hooks/use-network";
import type { ConnectedWallet } from "@/lib/wallets";
import type { RoleGroup, Target } from "@/lib/types";

export function CreateOnchainRuleForm({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { network } = useNetwork();
  const [name, setName] = useState("");
  const [target, setTarget] = useState<Target>({ contract: "", fns: [] });
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);

  const [authWallets, setAuthWallets] = useState<ConnectedWallet[]>([]);
  const [sourceWalletId, setSourceWalletId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onAuthWalletConnected(wallet: ConnectedWallet) {
    setAuthWallets((prev) => [...prev, wallet]);
    setSourceWalletId((prev) => prev ?? wallet.walletId);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Give the rule a name.");
    if (new TextEncoder().encode(name.trim()).length > MAX_CONTEXT_RULE_NAME_SIZE) {
      return setError(`The name is too long for the contract (max ${MAX_CONTEXT_RULE_NAME_SIZE} bytes).`);
    }
    if (!target.contract.trim()) return setError("The rule needs a contract address.");
    if (target.fns.length === 0) return setError("Add at least one function.");
    if (target.fns.some((fn) => !fn.name.trim())) return setError("Every function needs a name.");
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);
    if (withSigners.length === 0) return setError("Add at least one signer group.");
    if (!sourceWalletId) return setError("Connect one of this account's Governance signers to authorize this.");
    const sourceWallet = authWallets.find((w) => w.walletId === sourceWalletId);
    if (!sourceWallet) return setError("The authorizing wallet must be connected.");

    const contributingSigners: AdminCallSigner[] = authWallets.map((w) => ({
      address: w.address,
      walletId: w.walletId,
    }));

    setSubmitting(true);
    try {
      const config = getNetworkConfig(network);
      const trimmedName = name.trim();
      const createdRuleIds: Array<{ ruleId: number; role: RoleGroup["role"] }> = [];

      for (const group of withSigners) {
        setStatus(`Building the ${group.role} group's transaction…`);
        const { xdr } = await buildAddRuleTransaction({
          rpcUrl: config.rpcUrl,
          networkPassphrase: config.networkPassphrase,
          accountWasmHash: config.accountWasmHash,
          thresholdPolicyAddress: config.thresholdPolicyAddress,
          rolesPolicyAddress: config.rolesPolicyAddress,
          accountId,
          name: trimmedName,
          target,
          group,
          sourceAddress: sourceWallet.address,
        });

        setStatus(`Waiting for signatures (${group.role})…`);
        const result = await signAndSubmitAdminCall({
          rpcUrl: config.rpcUrl,
          networkPassphrase: config.networkPassphrase,
          accountId,
          contextRuleId: 0,
          preparedXdr: xdr,
          contributingSigners,
          sourceWalletId,
        });
        createdRuleIds.push({ ruleId: decodeNewRuleId(result.returnValue), role: group.role });
      }

      if (withSigners.length > 1) {
        recordRuleGroup(accountId, trimmedName, createdRuleIds);
      }

      setStatus("Rule added. Redirecting…");
      router.push(`/app/${accountId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add this rule on-chain.");
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-shadow-accent space-y-8 border-t-[12px] border-[3px] border-obsidian bg-surface p-6"
    >
      <Tag tone="gold">On-chain · real transactions</Tag>

      <HonestLimit>
        This installs a real RolesPolicy (and threshold policy, for any group whose threshold is
        below its signer count) on testnet. Adding a rule is an admin operation — it needs a
        signature from enough of this account&apos;s Governance signers (rule 0), connected below.
        This form always authorizes against rule 0 — if you&apos;ve also set up a separate Admin
        tier, use its signers from the chest page instead for now. Only Freighter and Hana can
        sign; see the chest creation page for why.
      </HonestLimit>

      <div>
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
          Governance signer — authorizes adding this rule
        </h2>
        <div className="mt-3">
          <ConnectedWalletsPanel connected={authWallets} onConnect={onAuthWalletConnected} />
        </div>
        {authWallets.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {authWallets.map((w) => (
              <button
                key={w.address}
                type="button"
                onClick={() => setSourceWalletId(w.walletId)}
                className={`rounded-2xl border px-3 py-1.5 text-sm transition ${
                  sourceWalletId === w.walletId
                    ? "border-pale text-pale"
                    : "border-line text-mist hover:border-mist"
                }`}
              >
                Pay fee with {w.walletName} ({w.address.slice(0, 4)}…{w.address.slice(-4)})
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs tracking-[0.2em] text-mist uppercase" htmlFor="onchain-rule-name">
          Name
        </label>
        <input
          id="onchain-rule-name"
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
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">This rule&apos;s signers</h2>
        <p className="mt-2 text-sm text-mist">
          Each group is an independent path — any one group alone, satisfying its own threshold,
          can authorize a call matching this rule.
        </p>
        <div className="mt-3">
          <RoleGroupsEditor
            roleGroups={roleGroups}
            onChange={setRoleGroups}
            allowedRoles={["governance", "admin", "operator"]}
          />
        </div>
      </div>

      {error && <p className="text-sm text-denied">{error}</p>}
      {status && !error && <p className="text-sm text-mist">{status}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Add rule on-chain"}
      </button>
    </form>
  );
}
