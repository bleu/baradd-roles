import { timeline, thresholdComparison } from "@/content/problem";

export function Problem() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 py-16">
      <p className="text-xs tracking-[0.15em] text-mist uppercase">Illustrative scenario</p>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3">
        {timeline.map((step) => (
          <li key={step.time} className="border-t-2 border-pale pt-4">
            <span className="font-mono text-sm text-gold">{step.time}</span>
            <p className="mt-2 text-pale">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface text-mist">
              <th className="px-4 py-3 font-normal">Setup</th>
              <th className="px-4 py-3 font-normal">Signatures to exit</th>
              <th className="px-4 py-3 font-normal">Signatures to enter</th>
            </tr>
          </thead>
          <tbody>
            {thresholdComparison.map((row) => (
              <tr key={row.setup} className="border-t border-line">
                <td className="px-4 py-3 text-pale">{row.setup}</td>
                <td className="px-4 py-3 text-pale">{row.exit}</td>
                <td className="px-4 py-3 text-pale">{row.enter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-mist">
        Source:{" "}
        <a
          href="https://developers.stellar.org/docs/glossary/multisig/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-line underline-offset-2 hover:text-pale"
        >
          Stellar docs, multisig
        </a>
        .
      </p>
    </section>
  );
}
