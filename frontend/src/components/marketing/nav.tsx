import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingNav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-pale">
          <Logo className="h-6 w-6 text-pale" />
          <span className="font-display text-xl font-semibold">Barad</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-mist sm:flex">
          <a href="#how-it-works" className="transition hover:text-pale">
            How it works
          </a>
          <a href="#demo" className="transition hover:text-pale">
            Demo
          </a>
          <a href="#security-and-status" className="transition hover:text-pale">
            Security and status
          </a>
          <Link href="/docs" className="transition hover:text-pale">
            Docs
          </Link>
          <a
            href="https://github.com/bleu/barad-stellar-wallet"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-pale"
          >
            GitHub
          </a>
        </nav>
        <Link
          href="/app"
          className="rounded-sm bg-gold px-4 py-2 text-sm font-medium text-gold-ink transition hover:opacity-90"
        >
          Open the prototype
        </Link>
      </div>
    </header>
  );
}
