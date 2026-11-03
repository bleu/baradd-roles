export function TerminalBlock({ command, output }: { command: string; output: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl border border-line bg-obsidian p-4 font-mono text-xs leading-relaxed text-pale">
      <code>
        <span className="text-gold">$ </span>
        {command}
        {"\n"}
        {output}
      </code>
    </pre>
  );
}
