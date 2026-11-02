import Link from "next/link";
import { Logo } from "@/components/logo";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-xl font-semibold tracking-wide text-foreground">
            Barad
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <Link href="/accounts" className="transition hover:text-foreground">
            Treasuries
          </Link>
          <Link href="/#how-it-works" className="transition hover:text-foreground">
            How it works
          </Link>
        </nav>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
