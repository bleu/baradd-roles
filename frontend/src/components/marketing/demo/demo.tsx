"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACTIONS,
  ALL_KEYS,
  CLASSIC_THRESHOLD,
  KEY_INFO,
  ROLE_KEYS,
  ROLE_LABEL,
  evaluate,
  type ActionId,
  type KeyId,
  type Role,
} from "@/lib/evaluate";
import { KeyholeSignedRow } from "@/components/ui/keyhole";
import { Tag } from "@/components/ui/tag";

const ROLES: Role[] = ["governance", "admin", "operator"];

const SHORTCUTS: Record<string, { signed: KeyId[]; action: ActionId; classic: boolean }> = {
  "3 a.m.: one operator exits": { signed: ["O1"], action: "exit", classic: false },
  "Same key tries to enter": { signed: ["O1"], action: "enter", classic: false },
  "Exit to a stranger": { signed: ["O1"], action: "exit-outside", classic: false },
  "Two admins enter": { signed: ["A1", "A2"], action: "enter", classic: false },
  "Same exit, classic multisig": { signed: ["O1"], action: "exit", classic: true },
};

function readFromUrl(): { signed: KeyId[]; action: ActionId; classic: boolean } {
  if (typeof window === "undefined") return { signed: [], action: "exit", classic: false };
  const params = new URLSearchParams(window.location.search);
  const signedParam = params.get("signed");
  const signed = signedParam
    ? (signedParam.split(",").filter((k) => ALL_KEYS.includes(k as KeyId)) as KeyId[])
    : [];
  const actionParam = params.get("action");
  const action: ActionId = actionParam && actionParam in ACTIONS ? (actionParam as ActionId) : "exit";
  const classic = params.get("classic") === "1";
  return { signed, action, classic };
}

export function Demo() {
  // Lazy initializer, not an effect: it needs to run once, synchronously,
  // before first paint, to read a shared link's state. readFromUrl() is
  // SSR-safe (returns the same defaults server-side), so the only cost is a
  // one-time hydration mismatch warning when a link carries query params —
  // acceptable for a below-the-fold demo widget, not worth an extra effect
  // + cascading render for the common case of no query string.
  const [scenario, setScenario] = useState(readFromUrl);
  const { signed, action, classic } = scenario;
  const [copied, setCopied] = useState(false);

  function toggleKey(key: KeyId) {
    setScenario((prev) => ({
      ...prev,
      signed: prev.signed.includes(key) ? prev.signed.filter((k) => k !== key) : [...prev.signed, key],
    }));
  }
  function setAction(next: ActionId) {
    setScenario((prev) => ({ ...prev, action: next }));
  }
  function toggleClassic() {
    setScenario((prev) => ({ ...prev, classic: !prev.classic }));
  }
  function reset() {
    setScenario({ signed: [], action: "exit", classic: false });
  }
  function applyShortcut(name: keyof typeof SHORTCUTS) {
    setScenario(SHORTCUTS[name]);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDefault = signed.length === 0 && action === "exit" && !classic;
    if (isDefault) return;
    const params = new URLSearchParams();
    if (signed.length > 0) params.set("signed", signed.join(","));
    params.set("action", action);
    if (classic) params.set("classic", "1");
    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}#demo` : `${window.location.pathname}#demo`;
    window.history.replaceState(null, "", url);
  }, [signed, action, classic]);

  const result = useMemo(() => evaluate(signed, action, classic), [signed, action, classic]);
  const signedSet = useMemo(() => new Set(signed), [signed]);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section id="demo" className="on-ink">
      <div className="mx-auto max-w-[1240px] px-6 py-16 sm:py-24 lg:px-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="font-mono text-xs font-bold tracking-wide text-gold uppercase">Interactive demo</span>
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,4rem)] leading-[0.95] text-surface">
            Try to move the chest.
          </h2>
          <p className="m-0 text-xl text-[#c9c6be]">
            Eight fictional keys. Pick who has signed, pick an action, and see exactly why it passes or fails.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="mr-2 font-mono text-xs font-bold tracking-wide text-[#c9c6be] uppercase">Shortcuts</span>
          {(Object.keys(SHORTCUTS) as Array<keyof typeof SHORTCUTS>).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => applyShortcut(name)}
              className="border-[3px] border-surface px-4 py-2.5 text-sm font-bold text-surface transition hover:opacity-70"
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 text-sm font-bold text-gold underline decoration-[#45423c] underline-offset-4 transition hover:opacity-70"
          >
            Reset
          </button>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          <div className="card-shadow-accent flex flex-col gap-8 border-[3px] border-surface bg-surface p-7">
            <div className="flex flex-col gap-5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">1 · Who has signed</span>
                <span className="font-mono text-sm font-bold text-pale">{signed.length} of {ALL_KEYS.length} keys</span>
              </div>
              {ROLES.map((role) => (
                <div key={role} className="flex items-center gap-4">
                  <span className="w-[108px] shrink-0 font-mono text-xs font-bold text-mist uppercase">
                    {ROLE_LABEL[role]}
                  </span>
                  <div className="flex gap-2.5">
                    {ROLE_KEYS[role].map((key) => {
                      const active = signedSet.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={active}
                          aria-label={KEY_INFO[key].label}
                          onClick={() => toggleKey(key)}
                          className={`h-[52px] w-[52px] border-[3px] border-obsidian font-mono text-sm font-bold transition ${
                            active ? "card-shadow bg-gold text-obsidian" : "bg-surface-raised text-pale"
                          }`}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3.5">
              <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">
                2 · What it tries to do
              </span>
              <div className="flex flex-col gap-2.5">
                {(Object.values(ACTIONS)).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={action === a.id}
                    onClick={() => setAction(a.id)}
                    className={`flex min-h-[56px] items-center justify-between gap-3 border-[3px] border-obsidian px-4 py-2 text-left transition ${
                      action === a.id ? "bg-obsidian text-surface" : "bg-surface-raised text-pale"
                    }`}
                  >
                    <span className="font-display text-sm leading-none">{a.label}</span>
                    <span className="font-mono text-xs">{a.fnCall}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t-[3px] border-line pt-6">
              <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">3 · For contrast</span>
              <button
                type="button"
                aria-pressed={classic}
                onClick={toggleClassic}
                className={`flex min-h-[56px] items-center justify-between gap-3 border-[3px] border-obsidian px-4 py-2 text-left transition ${
                  classic ? "bg-obsidian text-surface" : "border-dashed bg-surface-raised text-pale"
                }`}
              >
                <span className="font-display text-sm leading-none">
                  Classic multisig, {CLASSIC_THRESHOLD} of {ALL_KEYS.length} for everything
                </span>
                <span className="font-mono text-xs font-bold">{classic ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          <div className="card-shadow-accent flex flex-col gap-5 border-[3px] border-surface bg-surface p-7" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs font-bold tracking-wide text-mist uppercase">Result</span>
              <Tag tone={result.approved ? "ok" : "bad"}>{result.approved ? "✓ Approved" : "✕ Denied"}</Tag>
            </div>
            <p className="m-0 font-display text-2xl leading-tight text-pale">{result.headline}</p>
            <ol className="m-0 flex list-none flex-col p-0">
              {result.steps.map((step, i) => (
                <li key={i} className="flex gap-4 border-t-[3px] border-line py-4">
                  <span
                    className={`flex h-[30px] w-[30px] flex-none items-center justify-center border-[3px] font-mono text-sm font-bold ${
                      step.tone === "ok"
                        ? "border-approved text-approved"
                        : step.tone === "bad"
                          ? "border-denied text-denied"
                          : "border-mist text-mist"
                    }`}
                  >
                    {step.mark}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="font-display text-sm leading-none text-pale">{step.title}</span>
                    <span className="text-sm text-mist">{step.detail}</span>
                    {step.pins && (
                      <KeyholeSignedRow
                        className="mt-1"
                        size={18}
                        states={step.pins.map((k) => (signedSet.has(k) ? "signed" : "spare"))}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-line pt-5">
              <span className="font-mono text-xs text-mist">State is saved in the link</span>
              <button
                type="button"
                onClick={copyLink}
                className="border-[3px] border-obsidian px-4 py-2 text-sm font-bold text-pale transition hover:opacity-70"
              >
                {copied ? "Copied" : "Copy link to this scenario"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
