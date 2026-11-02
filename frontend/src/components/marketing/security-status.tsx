import { statusRows, honestLimit } from "@/content/status";
import { HonestLimit } from "@/components/ui/honest-limit";

export function SecurityStatus() {
  return (
    <section id="security-and-status" className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-ink">Security and status</h2>

      <div className="mt-8 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface text-stone">
              <th className="px-4 py-3 font-normal">Component</th>
              <th className="px-4 py-3 font-normal">State today</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map((row) => (
              <tr key={row.component} className="border-t border-line align-top">
                <td className="px-4 py-3 font-mono text-xs text-ink">{row.component}</td>
                <td className="px-4 py-3 text-ink">{row.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <HonestLimit>{honestLimit}</HonestLimit>
      </div>

      <div className="mt-6 grid gap-2 text-sm text-stone sm:grid-cols-3">
        <p>
          <span className="text-ink">Audit: </span>planned, not started.
        </p>
        <p>
          <span className="text-ink">License: </span>MIT.
        </p>
        <p>
          <a
            href="https://github.com/bleu/barad-stellar-wallet/blob/master/docs/validations.md"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            Specification and validations log
          </a>
        </p>
      </div>
    </section>
  );
}
