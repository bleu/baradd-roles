import Link from "next/link";
import { Logo } from "@/components/logo";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

export function AppHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/app" className="flex items-center gap-2.5 text-ink">
          <Logo className="h-6 w-6 text-ink" />
          <span className="font-display text-xl font-semibold">Barad</span>
        </Link>
        <Link href="/" className="hidden text-sm text-stone transition hover:text-ink sm:block">
          ← Back to the site
        </Link>
        <ConnectWalletButton />
      </div>
    </header>
  );
}
