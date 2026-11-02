export function TerminalBlock({ command, output }: { command: string; output: string }) {
  return (
    <pre className="overflow-x-auto rounded-sm border border-line bg-ink p-4 font-mono text-xs leading-relaxed text-paper">
      <code>
        <span className="text-lamp">$ </span>
        {command}
        {"\n"}
        {output}
      </code>
    </pre>
  );
}
