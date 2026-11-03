import { notFound } from "next/navigation";
import Link from "next/link";
import { findAccount } from "@/lib/mock-data";
import { shortAddr } from "@/lib/format";
import { RuleCard } from "@/components/rule-card";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = findAccount(id);
  if (!account) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Treasuries
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-pale">{account.label}</h1>
          <p className="mt-1 font-mono text-xs text-mist">{shortAddr(account.id, 8, 8)}</p>
        </div>
        <span className="rounded-sm border border-line px-2 py-0.5 text-xs text-mist">
          {account.network}
        </span>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {account.rules.map((rule) => (
          <RuleCard key={rule.id} accountId={account.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}
