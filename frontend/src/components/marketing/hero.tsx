import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1120px] gap-10 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col items-start gap-6">
        <StatusBadge />
        <h1 className="max-w-xl font-display text-[2.25rem] font-semibold leading-tight text-pale sm:text-5xl lg:text-[3.5rem]">
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
      <figure className="gold-glow">
        <div className="card-shadow relative aspect-[11/10] overflow-hidden rounded-2xl border border-line">
          <Image
            src="/brand/backgrounds/barad-citadel-hero.jpg"
            alt="A fortress keep at night, lit by a single beam rising from its gate, in dark mountains."
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-3 flex justify-between text-sm font-medium text-pale">
          <span>Exit: 1 signature</span>
          <span>Enter: 3 signatures</span>
        </figcaption>
      </figure>
    </section>
  );
}
