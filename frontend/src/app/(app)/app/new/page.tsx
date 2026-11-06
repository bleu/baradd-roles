import Link from "next/link";
import { CreateAccountForm } from "@/components/wallet/create-account-form";

export default function NewAccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/app" className="text-xs text-mist transition hover:text-pale">
        ← Chests
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pale">Create a chest</h1>
      <p className="mt-2 text-mist">
        Set up the governance signers that can change rules and install policies later. This saves a
        draft in your browser — nothing is deployed.{" "}
        <Link href="/app/new/onchain" className="text-pale underline underline-offset-2">
          Deploy a real one on testnet instead →
        </Link>
      </p>
      <div className="mt-10">
        <CreateAccountForm />
      </div>
    </div>
  );
}
