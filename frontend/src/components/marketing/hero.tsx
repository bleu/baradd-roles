import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1240px] gap-14 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-stretch lg:px-10">
      <div className="flex flex-col justify-center gap-7">
        <StatusBadge />
        <h1 className="font-display text-[2.5rem] leading-[0.9] text-pale sm:text-6xl lg:text-7xl">
          Leave with <span className="bg-gold px-3 py-0.5 text-gold-ink">one key.</span> Enter with
          many.
        </h1>
        <p className="max-w-lg text-xl text-mist">
          Baradd is a chest wallet for Soroban smart accounts. Routine, low-risk actions need one
          signature. Anything that adds risk needs several, and the contract enforces it.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#demo"
            className="btn-primary border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
          >
            Try to move the chest
          </a>
          <Link
            href="/docs"
            className="flex items-center border-[3px] border-obsidian px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-pale transition hover:opacity-70"
          >
            Read the spec
          </Link>
        </div>
        <a
          href="https://github.com/bleu/baradd-roles"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-mist underline decoration-line underline-offset-4 transition hover:text-pale"
        >
          github.com/bleu/baradd-roles
        </a>
      </div>

      <div
        data-testid="hero-visual"
        className="card-shadow relative min-h-[420px] overflow-hidden border-[3px] border-obsidian bg-surface lg:min-h-[560px]"
        aria-hidden
      >
        <Image
          src="/brand/backgrounds/baradd-deposit-wall-hero.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </section>
  );
}
