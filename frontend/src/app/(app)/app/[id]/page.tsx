import { notFound } from "next/navigation";
import Link from "next/link";
import { StrKey } from "@stellar/stellar-sdk";
import { findAccount } from "@/lib/mock-data";
import { isDraftId } from "@/lib/accounts-store";
import { shortAddr } from "@/lib/format";
import { RuleCard } from "@/components/rule-card";
import { Tag } from "@/components/ui/tag";
import { GovernanceCard } from "@/components/wallet/governance-card";
import { DraftAccountPage } from "@/components/wallet/draft-account-page";
import { OnchainAccountPage } from "@/components/wallet/onchain-account-page";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Draft accounts only exist in the browser's localStorage, not on the
  // server, so they're resolved client-side instead of via findAccount().
  if (isDraftId(id)) return <DraftAccountPage id={id} />;

  const account = findAccount(id);
  // Not a mock account, but a real contract address: a genuine, already
  // deployed on-chain chest — read it from chain instead of 404ing.
  if (!account && StrKey.isValidContract(id)) return <OnchainAccountPage key={id} id={id} />;
  if (!account) notFound();

  const adminRule = account.rules.find((r) => r.kind === "Admin");
  const policyRules = account.rules.filter((r) => r.kind === "Rule");

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-pale">{account.label}</h1>
          <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 8, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tag tone="dashed">Example</Tag>
          <Tag tone="dashed">{account.network}</Tag>
        </div>
      </div>

      <div className="mt-10">
        <GovernanceCard adminRule={adminRule} />
      </div>

      <div className="mt-10">
        <h2 className="text-xs tracking-[0.2em] text-mist uppercase">Rules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policyRules.map((rule) => (
            <RuleCard key={rule.id} accountId={account.id} rule={rule} />
          ))}
        </div>
      </div>
    </div>
  );
}
