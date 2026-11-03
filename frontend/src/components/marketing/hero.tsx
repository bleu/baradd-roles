import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16 sm:py-24">
      <div className="flex max-w-xl flex-col items-start gap-6">
        <StatusBadge />
        <h1 className="font-display text-[2.25rem] font-semibold leading-tight text-pale sm:text-5xl lg:text-[3.5rem]">
          Leave with one key. Enter with many.
        </h1>
        <p className="max-w-lg text-lg text-mist">
          Barad is a treasury wallet for Soroban smart accounts. One operator can pull funds out
          of a DeFi position and back to the treasury; adding risk takes more signatures. The rule
          is enforced on-chain.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#demo"
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-gold-ink transition hover:opacity-90"
          >
            Try to move the treasury
          </a>
          <Link
            href="/docs"
            className="rounded-full border border-line px-5 py-2.5 text-sm text-pale transition hover:border-mist"
          >
            Read the spec
          </Link>
        </div>
        <a
          href="https://github.com/bleu/barad-stellar-wallet"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-mist underline decoration-line underline-offset-4 transition hover:text-pale"
        >
          github.com/bleu/barad-stellar-wallet
        </a>
      </div>
    </section>
  );
}
