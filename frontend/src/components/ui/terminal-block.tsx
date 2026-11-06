export function TerminalBlock({ command, output }: { command: string; output: string }) {
  return (
    <pre
      className="card-shadow-accent overflow-x-auto border-[3px] border-obsidian p-4 font-mono text-xs leading-relaxed"
      style={{ background: "var(--obsidian)", color: "var(--surface)" }}
    >
      <code>
        <span style={{ color: "#c9c6be" }}>$ </span>
        {command}
        {"\n"}
        {output}
      </code>
    </pre>
  );
}
