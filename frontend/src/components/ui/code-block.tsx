"use client";

import { useState } from "react";

export function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="border-[3px] border-obsidian card-shadow-accent" style={{ background: "var(--obsidian)" }}>
      <div className="flex items-center justify-between border-b-2 px-4 py-2" style={{ borderColor: "#3a3835" }}>
        <span className="font-mono text-xs" style={{ color: "#c9c6be" }}>
          {filename ?? "config.toml"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="border-2 px-2 py-1 font-mono text-xs transition hover:opacity-80"
          style={{ borderColor: "#3a3835", color: "#c9c6be" }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed" style={{ color: "var(--surface)" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
