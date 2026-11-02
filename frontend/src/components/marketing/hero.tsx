import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import { TreasuryDiagram } from "./treasury-diagram";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1120px] gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col items-start gap-6">
        <StatusBadge />
        <h1 className="max-w-xl font-display text-[2.25rem] font-semibold leading-tight text-ink sm:text-5xl lg:text-[3.5rem]">
          Leave with one key. Enter with many.
        </h1>
        <p className="max-w-lg text-lg text-stone">
          Barad is a treasury wallet for Soroban smart accounts. One operator can pull funds out
          of a DeFi position and back to the treasury; adding risk takes more signatures. The rule
          is enforced on-chain.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#demo"
            className="rounded-sm bg-lamp px-5 py-2.5 text-sm font-medium text-lamp-ink transition hover:opacity-90"
          >
            Try to move the treasury
          </a>
          <Link
            href="/docs"
            className="rounded-sm border border-line px-5 py-2.5 text-sm text-ink transition hover:border-stone"
          >
            Read the spec
          </Link>
        </div>
        <a
          href="https://github.com/bleu/barad-stellar-wallet"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-stone underline decoration-line underline-offset-4 transition hover:text-ink"
        >
          github.com/bleu/barad-stellar-wallet
        </a>
      </div>
      <div className="flex justify-center lg:justify-end">
        <TreasuryDiagram />
      </div>
    </section>
  );
}
