import { statusRows, honestLimit } from "@/content/status";
import { HonestLimit } from "@/components/ui/honest-limit";

export function SecurityStatus() {
  return (
    <section id="security-and-status" className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-pale">Security and status</h2>

      <div className="mt-8 overflow-x-auto rounded-2xl border-[3px] border-line">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-surface text-mist">
              <th className="px-4 py-3 font-normal">Component</th>
              <th className="px-4 py-3 font-normal">State today</th>
            </tr>
          </thead>
          <tbody>
            {statusRows.map((row) => (
              <tr key={row.component} className="border-t-[3px] border-line align-top">
                <td className="px-4 py-3 font-mono text-xs text-pale">{row.component}</td>
                <td className="px-4 py-3 text-pale">{row.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <HonestLimit>{honestLimit}</HonestLimit>
      </div>

      <div className="mt-6 grid gap-2 text-sm text-mist sm:grid-cols-3">
        <p>
          <span className="text-pale">Audit: </span>planned, not started.
        </p>
        <p>
          <span className="text-pale">License: </span>MIT.
        </p>
        <p>
          <a
            href="https://github.com/bleu/baradd-roles/blob/master/docs/validations.md"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-2 hover:text-pale"
          >
            Specification and validations log
          </a>
        </p>
      </div>
    </section>
  );
}
