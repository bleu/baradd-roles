import Link from "next/link";
import { CreateOnchainAccountForm } from "@/components/wallet/create-onchain-account-form";

export default function NewOnchainAccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pale">Deploy a chest on testnet</h1>
      <p className="mt-2 text-mist">
        Connects real wallets and deploys a real smart account — not a draft.
      </p>
      <div className="mt-10">
        <CreateOnchainAccountForm />
      </div>
    </div>
  );
}
