"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ACTIONS,
  ALL_KEYS,
  KEY_INFO,
  evaluate,
  type ActionId,
  type KeyId,
} from "@/lib/evaluate";
import { SignatureMeter } from "@/components/ui/signature-meter";

const SHORTCUTS: Record<string, { signed: KeyId[]; action: ActionId; classic: boolean }> = {
  "3am-exit": { signed: ["O1"], action: "exit-to-treasury", classic: false },
  "stolen-key": { signed: ["O1"], action: "exit-outside", classic: false },
};

function readFromUrl(): { signed: KeyId[]; action: ActionId; classic: boolean } {
  if (typeof window === "undefined") return { signed: [], action: "exit-to-treasury", classic: false };
  const params = new URLSearchParams(window.location.search);
  const signedParam = params.get("signed");
  const signed = signedParam
    ? (signedParam.split(",").filter((k) => ALL_KEYS.includes(k as KeyId)) as KeyId[])
    : [];
  const actionParam = params.get("action");
  const action: ActionId = actionParam && actionParam in ACTIONS ? (actionParam as ActionId) : "exit-to-treasury";
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
  const [whyOpen, setWhyOpen] = useState(false);

  function setSigned(next: KeyId[] | ((prev: KeyId[]) => KeyId[])) {
    setScenario((prev) => ({
      ...prev,
      signed: typeof next === "function" ? next(prev.signed) : next,
    }));
  }
  function setAction(next: ActionId) {
    setScenario((prev) => ({ ...prev, action: next }));
  }
  function setClassic(next: boolean) {
    setScenario((prev) => ({ ...prev, classic: next }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (signed.length > 0) params.set("signed", signed.join(","));
    params.set("action", action);
    if (classic) params.set("classic", "1");
    const query = params.toString();
    const url = query ? `${window.location.pathname}?${query}#demo` : `${window.location.pathname}#demo`;
    window.history.replaceState(null, "", url);
  }, [signed, action, classic]);

  const result = useMemo(() => evaluate(signed, action, classic), [signed, action, classic]);

  function toggleKey(key: KeyId) {
    setSigned((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function applyShortcut(name: keyof typeof SHORTCUTS) {
    setScenario(SHORTCUTS[name]);
  }

  return (
    <section id="demo" className="mx-auto max-w-[1120px] px-6 py-16">
      <h2 className="font-display text-3xl text-ink">Try to move the treasury</h2>
      <p className="mt-2 max-w-2xl text-stone">
        Simulated in your browser. Not a live treasury. A testnet version is coming.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => applyShortcut("3am-exit")}
          className="rounded-sm border border-line px-3 py-1.5 text-sm text-ink transition hover:border-stone"
        >
          A 3 a.m. exit
        </button>
        <button
          type="button"
          onClick={() => applyShortcut("stolen-key")}
          className="rounded-sm border border-line px-3 py-1.5 text-sm text-ink transition hover:border-stone"
        >
          A stolen operator key
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-stone">
          <input
            type="checkbox"
            checked={classic}
            onChange={(e) => setClassic(e.target.checked)}
            className="h-4 w-4 accent-lamp"
          />
          Classic multisig (2-of-3, any key, ignores destination)
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr_1fr]">
        <div>
          <h3 className="text-xs tracking-[0.15em] text-stone uppercase">Who signs</h3>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Keys that have signed">
            {ALL_KEYS.map((key) => {
              const active = signed.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleKey(key)}
                  className={`rounded-sm border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink hover:border-stone"
                  }`}
                >
                  {KEY_INFO[key].label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-xs tracking-[0.15em] text-stone uppercase">What they try to do</h3>
          <div className="mt-3 flex flex-col gap-2">
            {(Object.values(ACTIONS)).map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={action === a.id}
                onClick={() => setAction(a.id)}
                className={`rounded-sm border px-3 py-2 text-left text-sm transition ${
                  action === a.id ? "border-ink bg-surface text-ink" : "border-line text-ink hover:border-stone"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          <h3 className="text-xs tracking-[0.15em] text-stone uppercase">Result</h3>
          <div className="mt-3 rounded-sm border border-line p-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-paper ${
                  result.approved ? "bg-approved" : "bg-denied"
                }`}
              >
                {result.approved ? "✓" : "✕"}
              </span>
              <span className="font-display text-2xl text-ink">
                {result.approved ? "Approved" : "Denied"}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink">{result.reason}</p>
            <div className="mt-4">
              <SignatureMeter counted={result.counted} required={result.required} approved={result.approved} />
            </div>
            <p className="mt-2 text-xs text-stone">{result.ruleId} rule</p>

            <button
              type="button"
              onClick={() => setWhyOpen((v) => !v)}
              aria-expanded={whyOpen}
              className="mt-4 text-sm text-stone underline decoration-line underline-offset-4 hover:text-ink"
            >
              {whyOpen ? "Hide why" : "Why?"}
            </button>
            {whyOpen && (
              <ol className="mt-3 space-y-2 border-t border-line pt-3">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-xs">
                    <span className={step.passed ? "text-approved" : "text-denied"}>
                      {step.passed ? "✓" : "✕"}
                    </span>{" "}
                    <span className="text-ink">{step.label}.</span>{" "}
                    <span className="text-stone">{step.detail}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
