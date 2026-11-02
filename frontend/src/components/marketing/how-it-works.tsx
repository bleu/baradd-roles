const EVAL_STEPS = [
  "Read the call: which contract, which function, which arguments.",
  "Find the contract on the rule's list — if it isn't there, deny.",
  "Find the function on that contract's list — if it isn't there, deny.",
  "Check every condition on the arguments — if one fails, deny.",
  "Allow, and nothing else.",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-ink">How it works</h2>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-sm border border-line">
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line bg-surface text-center text-xs text-stone">
            <div className="p-3">Operators</div>
            <div className="p-3">Approvers</div>
            <div className="p-3">Governance</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center text-sm">
            <div className="p-3 text-ink">EXIT rule<br /><span className="text-xs text-stone">1 signature</span></div>
            <div className="p-3 text-ink">ENTRY rule<br /><span className="text-xs text-stone">M signatures</span></div>
            <div className="p-3 text-ink">ADMIN rule<br /><span className="text-xs text-stone">N of M</span></div>
          </div>
          <div className="bg-ink p-4 text-center text-sm text-paper">
            Policy contract — checks every call against the rule
          </div>
          <div className="p-4 text-center text-xs text-stone">
            CLI prepares and verifies configurations before anyone signs
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.15em] text-stone uppercase">Evaluation, in order</h3>
          <ol className="mt-4 space-y-3">
            {EVAL_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink">
                <span className="font-mono text-stone">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-stone">
            A failure at any step denies the whole call. There is no other path to approval.
          </p>
        </div>
      </div>
    </section>
  );
}
