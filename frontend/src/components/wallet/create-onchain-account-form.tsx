"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGroupsEditor } from "@/components/wallet/role-groups-editor";
import { PolicyBuilder } from "@/components/wallet/policy-builder";
import { ConnectedWalletsPanel } from "@/components/wallet/connected-wallets-panel";
import { HonestLimit } from "@/components/ui/honest-limit";
import { Tag } from "@/components/ui/tag";
import { useOnchainAccountsStore } from "@/hooks/use-onchain-accounts-store";
import { useNetwork } from "@/hooks/use-network";
import { buildCreateAccountTransaction } from "@/lib/onchain/build-create-account-tx";
import { buildAddAdminRuleTransaction } from "@/lib/onchain/build-add-admin-rule-tx";
import { buildAddRuleTransaction } from "@/lib/onchain/build-add-rule-tx";
import {
  multiSignAndSubmit,
  type SignerWalletMap,
} from "@/lib/onchain/multi-sign-and-submit";
import {
  signAndSubmitAdminCall,
  type AdminCallSigner,
} from "@/lib/onchain/sign-admin-call";
import { decodeNewRuleId } from "@/lib/onchain/decode-new-rule-id";
import { recordRuleGroup } from "@/lib/onchain/rule-groups-store";
import { getNetworkConfig } from "@/lib/onchain/config";
import { MAX_CONTEXT_RULE_NAME_SIZE } from "@/lib/onchain/account-spec";
import { takeAccountPrefill } from "@/lib/onchain/account-prefill";
import type { ConnectedWallet } from "@/lib/wallets";
import type { RoleGroup, Target } from "@/lib/types";

type Step = 1 | 2 | 3;
type TxStepStatus = "pending" | "running" | "done" | "error";
interface TxStep {
  label: string;
  status: TxStepStatus;
}

export function CreateOnchainAccountForm() {
  const router = useRouter();
  const { addPointer } = useOnchainAccountsStore();
  const { network } = useNetwork();
  const [step, setStep] = useState<Step>(1);

  // Step 1 — Governance & Admin.
  const [label, setLabel] = useState("");
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>(
    [],
  );
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [sourceWalletId, setSourceWalletId] = useState<string | null>(null);

  // Step 2 — first rule (optional).
  const [ruleSkipped, setRuleSkipped] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleTarget, setRuleTarget] = useState<Target>({
    contract: "",
    fns: [],
  });
  const [ruleRoleGroups, setRuleRoleGroups] = useState<RoleGroup[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);

  // Step 3 — the on-chain transaction plan, known upfront from what was
  // configured in steps 1-2, then updated in place as each transaction runs.
  const [txSteps, setTxSteps] = useState<TxStep[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // Runs after hydration, not during initial render, so the prerendered
  // (empty) HTML and the first client render still match — only then does
  // a hand-off from a draft chest's "Deploy on testnet" button populate the
  // form. The microtask wrapper just satisfies the "no setState directly in
  // an effect body" lint rule; the read is still a one-time, post-mount read.
  useEffect(() => {
    queueMicrotask(() => {
      const prefill = takeAccountPrefill();
      if (!prefill) return;
      setLabel(prefill.label);
      setRoleGroups(prefill.roleGroups);
      setPrefilledFrom(prefill.label);
    });
  }, []);

  const signerWallets: SignerWalletMap = useMemo(() => {
    const map: SignerWalletMap = {};
    for (const w of connectedWallets) map[w.address] = w.walletId;
    return map;
  }, [connectedWallets]);

  const hasRule =
    !ruleSkipped &&
    (ruleName.trim() !== "" || ruleTarget.contract.trim() !== "");

  function onWalletConnected(wallet: ConnectedWallet) {
    setConnectedWallets((prev) => [...prev, wallet]);
    setSourceWalletId((prev) => prev ?? wallet.walletId);
  }

  function goToStep2() {
    setError(null);
    if (!label.trim()) return setError("Give the chest a label.");
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);
    if (withSigners.length === 0)
      return setError("Add at least one Governance or Admin signer.");
    setStep(2);
  }

  function buildTxPlan(includeRule: boolean): TxStep[] {
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);
    const steps: TxStep[] = [
      { label: "Deploy smart account", status: "pending" },
    ];
    for (const group of withSigners.slice(1)) {
      steps.push({ label: `Add the ${group.role} group`, status: "pending" });
    }
    if (includeRule) {
      for (const group of ruleRoleGroups.filter((g) => g.signers.length > 0)) {
        steps.push({
          label: `Add rule "${ruleName.trim()}" (${group.role})`,
          status: "pending",
        });
      }
    }
    return steps;
  }

  function goToStep3() {
    setError(null);
    if (hasRule) {
      if (!ruleName.trim())
        return setError("Give the rule a name, or skip this step.");
      if (
        new TextEncoder().encode(ruleName.trim()).length >
        MAX_CONTEXT_RULE_NAME_SIZE
      ) {
        return setError(
          `The name is too long for the contract (max ${MAX_CONTEXT_RULE_NAME_SIZE} bytes).`,
        );
      }
      if (!ruleTarget.contract.trim())
        return setError("The rule needs a contract address.");
      if (ruleTarget.fns.length === 0)
        return setError("Add at least one function.");
      if (ruleTarget.fns.some((fn) => !fn.name.trim()))
        return setError("Every function needs a name.");
      if (ruleRoleGroups.filter((g) => g.signers.length > 0).length === 0) {
        return setError(
          "Add at least one signer group for this rule, or skip this step.",
        );
      }
    }
    setTxSteps(buildTxPlan(hasRule));
    setConfirmed(false);
    setStep(3);
  }

  async function onDeploy() {
    setError(null);
    if (!sourceWalletId)
      return setError("Connect a wallet to pay the deploy fee.");
    const sourceWallet = connectedWallets.find(
      (w) => w.walletId === sourceWalletId,
    );
    if (!sourceWallet)
      return setError("The fee-paying wallet must be connected.");
    const withSigners = roleGroups.filter((g) => g.signers.length > 0);

    let stepIndex = -1;
    function startStep(label: string) {
      stepIndex++;
      setTxSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "running" } : s)),
      );
      setStatus(label);
    }
    function finishStep() {
      setTxSteps((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, status: "done" } : s)),
      );
    }
    function failStep() {
      setTxSteps((prev) =>
        prev.map((s, i) =>
          i === stepIndex && s.status === "running"
            ? { ...s, status: "error" }
            : s,
        ),
      );
    }
    function failRemaining() {
      setTxSteps((prev) =>
        prev.map((s) =>
          s.status === "pending" ? { ...s, status: "error" } : s,
        ),
      );
    }

    setSubmitting(true);
    try {
      const config = getNetworkConfig(network);

      startStep("Building transaction…");
      const { xdr, contractId, pendingGroups } =
        await buildCreateAccountTransaction({
          rpcUrl: config.rpcUrl,
          networkPassphrase: config.networkPassphrase,
          accountWasmHash: config.accountWasmHash,
          thresholdPolicyAddress: config.thresholdPolicyAddress,
          roleGroups: withSigners,
          sourceAddress: sourceWallet.address,
        });

      setStatus("Waiting for a signature to deploy…");
      await multiSignAndSubmit({
        rpcUrl: config.rpcUrl,
        networkPassphrase: config.networkPassphrase,
        preparedXdr: xdr,
        signerWallets,
        sourceWalletId,
      });
      finishStep();

      // Any role group beyond the first needs its own add_context_rule call,
      // authorized by the first group (already-installed rule 0) — the
      // constructor can only ever create one rule.
      const firstGroup = withSigners[0];
      const adminContributors: AdminCallSigner[] = firstGroup.signers
        .map((s) => ({
          address: s.address,
          walletId: signerWallets[s.address],
        }))
        .filter((s): s is AdminCallSigner => Boolean(s.walletId));

      if (
        (pendingGroups.length > 0 || hasRule) &&
        adminContributors.length === 0
      ) {
        throw new Error(
          "Deployed, but couldn't add the rest: none of the Governance signers are connected wallets in this browser. Add them later from the chest page once one of them is.",
        );
      }

      for (const group of pendingGroups) {
        startStep(`Adding the ${group.role} group…`);
        const { xdr: addXdr } = await buildAddAdminRuleTransaction({
          rpcUrl: config.rpcUrl,
          networkPassphrase: config.networkPassphrase,
          accountWasmHash: config.accountWasmHash,
          thresholdPolicyAddress: config.thresholdPolicyAddress,
          accountId: contractId,
          name: "Admin",
          group,
          sourceAddress: sourceWallet.address,
        });
        await signAndSubmitAdminCall({
          rpcUrl: config.rpcUrl,
          networkPassphrase: config.networkPassphrase,
          accountId: contractId,
          contextRuleId: 0,
          preparedXdr: addXdr,
          contributingSigners: adminContributors,
          sourceWalletId,
        });
        finishStep();
      }

      if (hasRule) {
        const ruleGroupsWithSigners = ruleRoleGroups.filter(
          (g) => g.signers.length > 0,
        );
        const createdRuleIds: Array<{
          ruleId: number;
          role: RoleGroup["role"];
        }> = [];
        for (const group of ruleGroupsWithSigners) {
          startStep(`Adding your first rule (${group.role})…`);
          const { xdr: ruleXdr } = await buildAddRuleTransaction({
            rpcUrl: config.rpcUrl,
            networkPassphrase: config.networkPassphrase,
            accountWasmHash: config.accountWasmHash,
            thresholdPolicyAddress: config.thresholdPolicyAddress,
            rolesPolicyAddress: config.rolesPolicyAddress,
            accountId: contractId,
            name: ruleName.trim(),
            target: ruleTarget,
            group,
            sourceAddress: sourceWallet.address,
          });
          const result = await signAndSubmitAdminCall({
            rpcUrl: config.rpcUrl,
            networkPassphrase: config.networkPassphrase,
            accountId: contractId,
            contextRuleId: 0,
            preparedXdr: ruleXdr,
            contributingSigners: adminContributors,
            sourceWalletId,
          });
          createdRuleIds.push({
            ruleId: decodeNewRuleId(result.returnValue),
            role: group.role,
          });
          finishStep();
        }
        if (ruleGroupsWithSigners.length > 1) {
          recordRuleGroup(contractId, ruleName.trim(), createdRuleIds);
        }
      }

      addPointer({ id: contractId, label: label.trim(), network });
      setStatus("Deployed. Redirecting…");
      router.push(`/app/${contractId}`);
    } catch (e) {
      failStep();
      failRemaining();
      setError(
        e instanceof Error
          ? e.message
          : "Could not create the on-chain account.",
      );
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`border-t-[12px] ${step === 3 ? "border-gold" : "border-transparent"}`}
    >
      <div className="space-y-8 pt-8">
        <HonestLimit>
          This deploys a real smart account on Stellar testnet — not a draft.
          Only Freighter and Hana can sign as rule signers today: they&apos;re
          the only wallets in this app&apos;s wallet connector that support
          signing an individual Soroban authorization entry (SEP-43), which a
          `Delegated` signer needs. Other wallets (xBull, Lobstr, Rabet, Albedo)
          can only sign whole transactions, so they can&apos;t be a signer here
          yet.
        </HonestLimit>

        {prefilledFrom && (
          <p className="text-sm text-mist">
            Brought over the label and Governance/Admin signers from &quot;
            {prefilledFrom}&quot; — you still need to connect wallets below.
          </p>
        )}

        <ol className="flex gap-2 font-mono text-xs uppercase">
          {(["Governance & Admin", "First rule", "Deploy"] as const).map(
            (stepLabel, i) => {
              const n = i + 1;
              const state =
                step === n ? "current" : step > n ? "done" : "upcoming";
              return (
                <li
                  key={stepLabel}
                  className={`border-[3px] px-3 py-1.5 font-bold tracking-wide ${
                    state === "done"
                      ? "border-obsidian bg-obsidian text-surface"
                      : state === "current"
                        ? "border-obsidian text-pale"
                        : "border-line text-mist"
                  }`}
                >
                  {n}. {stepLabel}
                </li>
              );
            },
          )}
        </ol>

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label
                className="text-xs tracking-[0.2em] text-mist uppercase"
                htmlFor="onchain-label"
              >
                Label
              </label>
              <input
                id="onchain-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Main chest"
                className="mt-2 w-full rounded-2xl border-[3px] border-line bg-surface px-3 py-2 text-sm text-pale placeholder:text-mist"
              />
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
                Connect wallets
              </h2>
              <p className="mt-2 text-sm text-mist">
                Connect any wallet you&apos;ll use as a signer, so you can copy
                its address into a group below, and pick one to pay the deploy
                fee.
              </p>
              <div className="mt-3">
                <ConnectedWalletsPanel
                  connected={connectedWallets}
                  onConnect={onWalletConnected}
                />
              </div>
            </div>

            {connectedWallets.length > 0 && (
              <div>
                <span className="text-xs tracking-[0.2em] text-mist uppercase">
                  Pays the deploy fee
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {connectedWallets.map((w) => (
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
                      {w.walletName} ({w.address.slice(0, 4)}…
                      {w.address.slice(-4)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
                Who can create, edit, or delete rules
              </h2>
              <p className="mt-2 text-sm text-mist">
                Governance and Admin are independent paths — either one alone,
                satisfying its own threshold, is enough.
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
              type="button"
              onClick={goToStep2}
              className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
            >
              Next: First rule →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <p className="text-sm text-mist">
              Optional — you can add this later from the chest page instead.
            </p>

            <div>
              <label
                className="text-xs tracking-[0.2em] text-mist uppercase"
                htmlFor="onchain-rule-name"
              >
                Name
              </label>
              <input
                id="onchain-rule-name"
                value={ruleName}
                onChange={(e) => {
                  setRuleSkipped(false);
                  setRuleName(e.target.value);
                }}
                placeholder="Example Vault withdraw"
                className="mt-2 w-full rounded-2xl border-[3px] border-line bg-surface px-3 py-2 text-sm text-pale placeholder:text-mist"
              />
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
                Contract and functions — deny-by-default, only what&apos;s
                listed is allowed
              </h2>
              <div className="mt-3">
                <PolicyBuilder
                  target={ruleTarget}
                  onChange={(t) => {
                    setRuleSkipped(false);
                    setRuleTarget(t);
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xs tracking-[0.2em] text-mist uppercase">
                This rule&apos;s signers
              </h2>
              <p className="mt-2 text-sm text-mist">
                Each group is an independent path — any one group alone,
                satisfying its own threshold, can authorize a call matching this
                rule.
              </p>
              <div className="mt-3">
                <RoleGroupsEditor
                  roleGroups={ruleRoleGroups}
                  onChange={(groups) => {
                    setRuleSkipped(false);
                    setRuleRoleGroups(groups);
                  }}
                  allowedRoles={["governance", "admin", "operator"]}
                />
              </div>
            </div>

            {error && <p className="text-sm text-denied">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl border-[3px] border-line px-4 py-2 text-sm text-pale transition hover:border-mist"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setRuleSkipped(true);
                  setTxSteps(buildTxPlan(false));
                  setConfirmed(false);
                  setStep(3);
                }}
                className="rounded-2xl border-[3px] border-line px-4 py-2 text-sm text-mist transition hover:border-mist hover:text-pale"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={goToStep3}
                className="ml-auto btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
              >
                Next: Deploy →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card-shadow-accent space-y-6 border-[6px] border-obsidian bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <Tag tone="gold">On-chain · real transactions</Tag>
              <span className="font-mono text-xs text-mist">{network}</span>
            </div>

            <div className="border-[3px] border-line p-4 text-sm text-pale">
              <p className="font-medium">{label}</p>
              <p className="mt-1 text-mist">
                {roleGroups.filter((g) => g.signers.length > 0).length}{" "}
                admin-authority group
                {roleGroups.filter((g) => g.signers.length > 0).length === 1
                  ? ""
                  : "s"}
              </p>
              <p className="mt-1 text-mist">
                {hasRule
                  ? `First rule: ${ruleName.trim()}`
                  : "No rule yet — add one later from the chest page."}
              </p>
            </div>

            <ol className="divide-y-[3px] divide-line border-[3px] border-line">
              {txSteps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span
                    className={`inline-flex h-5 w-5 flex-none items-center justify-center font-mono text-xs font-bold ${
                      s.status === "done"
                        ? "bg-approved text-surface"
                        : s.status === "error"
                          ? "bg-denied text-surface"
                          : s.status === "running"
                            ? "bg-gold text-obsidian"
                            : "border-2 border-line text-mist"
                    }`}
                    aria-hidden
                  >
                    {s.status === "done"
                      ? "✓"
                      : s.status === "error"
                        ? "✕"
                        : i + 1}
                  </span>
                  <span
                    className={
                      s.status === "error" ? "text-denied" : "text-pale"
                    }
                  >
                    {s.label}
                  </span>
                  {s.status === "running" && (
                    <span className="ml-auto text-xs text-mist">running…</span>
                  )}
                </li>
              ))}
            </ol>

            {error && <p className="text-sm text-denied">{error}</p>}
            {status && !error && <p className="text-sm text-mist">{status}</p>}

            <label className="flex items-start gap-2 text-sm text-pale">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={submitting}
                className="mt-0.5"
              />
              I understand this submits real transactions on Stellar testnet.
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="border-[3px] border-line px-4 py-2 text-sm text-pale transition hover:border-mist disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={onDeploy}
                disabled={submitting || !confirmed}
                className="btn-primary ml-auto border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition disabled:opacity-50"
              >
                {submitting ? "Deploying…" : "Deploy on testnet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
