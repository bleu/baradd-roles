import Link from "next/link";
import { Logo } from "@/components/logo";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { NetworkSelector } from "@/components/app-shell/network-selector";

export function AppHeader() {
  return (
    <header className="border-b-[3px] border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/app" className="flex items-center gap-2.5 text-pale">
          <Logo className="h-6 w-6 text-pale" />
          <span className="font-display text-xl font-semibold">Baradd</span>
        </Link>
        <Link
          href="/"
          className="hidden text-sm text-mist transition hover:text-pale sm:block sm:mr-auto"
        >
          ← Back to the site
        </Link>
        <NetworkSelector />
        <ConnectWalletButton />
      </div>
    </header>
  );
}
