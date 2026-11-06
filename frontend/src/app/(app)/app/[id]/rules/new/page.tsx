import Link from "next/link";
import { StrKey } from "@stellar/stellar-sdk";
import { isDraftId } from "@/lib/accounts-store";
import { CreateRuleForm } from "@/components/wallet/create-rule-form";
import { CreateOnchainRuleForm } from "@/components/wallet/create-onchain-rule-form";

export default async function NewRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isDraftId(id) && !StrKey.isValidContract(id)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link href={`/app/${id}`} className="text-xs text-mist transition hover:text-pale">
          ← Chest
        </Link>
        <p className="mt-6 text-sm text-mist">
          This is the example chest — it&apos;s read-only. Create your own chest from the
          Chests page to add rules.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={`/app/${id}`} className="text-xs text-mist transition hover:text-pale">
        ← Chest
      </Link>
      <h1 className="mt-4 font-display text-3xl text-pale">Add a rule</h1>
      <div className="mt-10">
        {isDraftId(id) ? <CreateRuleForm accountId={id} /> : <CreateOnchainRuleForm accountId={id} />}
      </div>
    </div>
  );
}
