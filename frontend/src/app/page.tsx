import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="flex flex-col items-start gap-6 py-24">
        <div className="flex items-center gap-2 text-xs tracking-[0.2em] text-muted uppercase">
          <Logo className="h-4 w-4" />
          Barad — a keep for Stellar treasuries
        </div>
        <h1 className="max-w-2xl font-display text-5xl font-semibold leading-tight text-foreground">
          Leave a position with one signature. Enter one with more.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Barad is a wallet for Soroban smart accounts built on{" "}
          <span className="text-foreground">Stellar Roles</span>: audited policies that scope
          permission by contract, function, and argument, so an operator can always reduce risk
          and never add it alone.
        </p>
        <div className="flex gap-3">
          <Link
            href="/accounts"
            className="rounded-sm border border-gold bg-gold/10 px-5 py-2.5 text-sm text-gold transition hover:bg-gold/20"
          >
            Open a treasury
          </Link>
          <a
            href="https://github.com/bleu/barad-stellar-wallet"
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-border px-5 py-2.5 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
          >
            Read the spec
          </a>
        </div>
      </section>

      <section id="how-it-works" className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
        <HowItWorksCard
          title="Exit"
          threshold="1 signature"
          accent="text-sage"
          description="A single operator key can always leave a position — withdraw, remove liquidity, repay — but only along functions the policy lists, and only back to the account itself."
        />
        <HowItWorksCard
          title="Entry"
          threshold="M signatures"
          accent="text-gold"
          description="Adding risk — deposit, approve, swap into a new position — needs more approvers, scoped to the exact contracts and arguments the treasury has reviewed."
        />
        <HowItWorksCard
          title="Admin"
          threshold="N of M, rare"
          accent="text-rust"
          description="Only governance can change the rules themselves: add signers, install a new policy, or retire a protocol. Deny-by-default underneath all three."
        />
      </section>

      <section className="py-20">
        <h2 className="font-display text-2xl text-foreground">Status</h2>
        <p className="mt-3 max-w-2xl text-muted">
          This is an early, open-source prototype. The policy contract (
          <code className="text-foreground">roles-policy</code>) is implemented against
          OpenZeppelin&apos;s <code className="text-foreground">stellar-accounts</code> 0.8.0 and
          passes its unit tests; the accounts and rules shown here are illustrative data until a
          preset is deployed and verified against a real protocol on testnet.
        </p>
      </section>
    </div>
  );
}

function HowItWorksCard({
  title,
  threshold,
  accent,
  description,
}: {
  title: string;
  threshold: string;
  accent: string;
  description: string;
}) {
  return (
    <div className="bg-background p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-xl text-foreground">{title}</h3>
        <span className={`text-xs tracking-wide ${accent}`}>{threshold}</span>
      </div>
      <p className="mt-3 text-sm text-muted">{description}</p>
    </div>
  );
}
