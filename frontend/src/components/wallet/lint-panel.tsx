import { lintConfig, type ConfigFile } from "@baradd/sdk";

/** Runs the same `lintConfig` the CLI's `roles lint` uses, live, against a config built in the browser. */
export function LintPanel({ config }: { config: ConfigFile }) {
  const findings = lintConfig(config);
  if (findings.length === 0) {
    return <p className="text-xs text-approved">roles lint: no findings.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {findings.map((f, i) => (
        <li
          key={i}
          className={`rounded-2xl border px-3 py-2 text-xs ${
            f.severity === "error" ? "border-denied text-denied" : "border-gold text-mist"
          }`}
        >
          <span className="font-mono">{f.path}</span> — {f.message}
        </li>
      ))}
    </ul>
  );
}
