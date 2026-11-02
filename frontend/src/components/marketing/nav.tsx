import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingNav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <Logo className="h-6 w-6 text-ink" />
          <span className="font-display text-xl font-semibold">Barad</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-stone sm:flex">
          <a href="#how-it-works" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#demo" className="transition hover:text-ink">
            Demo
          </a>
          <a href="#security-and-status" className="transition hover:text-ink">
            Security and status
          </a>
          <Link href="/docs" className="transition hover:text-ink">
            Docs
          </Link>
          <a
            href="https://github.com/bleu/barad-stellar-wallet"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink"
          >
            GitHub
          </a>
        </nav>
        <Link
          href="/app"
          className="rounded-sm bg-lamp px-4 py-2 text-sm font-medium text-lamp-ink transition hover:opacity-90"
        >
          Open the prototype
        </Link>
      </div>
    </header>
  );
}
