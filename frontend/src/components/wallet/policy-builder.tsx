"use client";

import { MAX_CONDS_PER_FN, MAX_FNS_PER_TARGET } from "@baradd/sdk";
import type { Cond, CondValue, FnRule, Target } from "@/lib/types";

const CONDVALUE_KINDS: CondValue["kind"][] = ["address", "symbol", "u32", "i128"];

function emptyCond(): Cond {
  return { kind: "EqSelf", arg: 0 };
}

/** `u32` is the only CondValue variant with a numeric `value`; the rest are strings. */
function makeCondValue(kind: CondValue["kind"], raw: string): CondValue {
  if (kind === "u32") return { kind, value: Number(raw) || 0 };
  return { kind, value: raw };
}

function CondEditor({
  cond,
  onChange,
  onRemove,
}: {
  cond: Cond;
  onChange: (cond: Cond) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border-[3px] border-line bg-surface p-2">
      <select
        value={cond.kind}
        onChange={(e) => {
          const kind = e.target.value as Cond["kind"];
          if (kind === "EqSelf") onChange({ kind: "EqSelf", arg: cond.arg });
          else if (kind === "Eq") onChange({ kind: "Eq", arg: cond.arg, value: { kind: "address", value: "" } });
          else if (kind === "OneOf")
            onChange({ kind: "OneOf", arg: cond.arg, values: [{ kind: "address", value: "" }] });
          else if (kind === "Range") onChange({ kind: "Range", arg: cond.arg, min: "0", max: "0" });
        }}
        className="rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 text-xs text-pale"
      >
        <option value="EqSelf">EqSelf</option>
        <option value="Eq">Eq</option>
        <option value="OneOf">OneOf</option>
        <option value="Range">Range</option>
      </select>

      <label className="flex items-center gap-1 text-xs text-mist">
        arg
        <input
          type="number"
          min={0}
          value={cond.arg}
          onChange={(e) => onChange({ ...cond, arg: Number(e.target.value) })}
          className="w-14 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 text-xs text-pale"
        />
      </label>

      {cond.kind === "Eq" && (
        <>
          <select
            value={cond.value.kind}
            onChange={(e) =>
              onChange({ ...cond, value: makeCondValue(e.target.value as CondValue["kind"], String(cond.value.value)) })
            }
            className="rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 text-xs text-pale"
          >
            {CONDVALUE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            value={String(cond.value.value)}
            onChange={(e) => onChange({ ...cond, value: makeCondValue(cond.value.kind, e.target.value) })}
            placeholder="value"
            className="w-40 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 font-mono text-xs text-pale placeholder:text-mist"
          />
        </>
      )}

      {cond.kind === "OneOf" && (
        <>
          <select
            value={cond.values[0]?.kind ?? "address"}
            onChange={(e) => {
              const kind = e.target.value as CondValue["kind"];
              onChange({ ...cond, values: cond.values.map((v) => makeCondValue(kind, String(v.value))) });
            }}
            className="rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 text-xs text-pale"
          >
            {CONDVALUE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            value={cond.values.map((v) => v.value).join(", ")}
            onChange={(e) => {
              const kind = cond.values[0]?.kind ?? "address";
              const values = e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
                .map((value) => makeCondValue(kind, value));
              onChange({ ...cond, values });
            }}
            placeholder="comma-separated values"
            className="w-56 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 font-mono text-xs text-pale placeholder:text-mist"
          />
        </>
      )}

      {cond.kind === "Range" && (
        <>
          <input
            value={cond.min}
            onChange={(e) => onChange({ ...cond, min: e.target.value })}
            placeholder="min"
            className="w-28 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 font-mono text-xs text-pale placeholder:text-mist"
          />
          <input
            value={cond.max}
            onChange={(e) => onChange({ ...cond, max: e.target.value })}
            placeholder="max"
            className="w-28 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1 font-mono text-xs text-pale placeholder:text-mist"
          />
        </>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="ml-auto rounded-xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-denied hover:text-denied"
      >
        Remove
      </button>
    </div>
  );
}

function FnEditor({
  fn,
  onChange,
  onRemove,
}: {
  fn: FnRule;
  onChange: (fn: FnRule) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-line p-3">
      <div className="flex items-center gap-2">
        <input
          value={fn.name}
          onChange={(e) => onChange({ ...fn, name: e.target.value })}
          placeholder="function name, e.g. withdraw"
          className="flex-1 rounded-xl border-[3px] border-line bg-surface px-2 py-1.5 font-mono text-sm text-pale placeholder:text-mist"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-denied hover:text-denied"
        >
          Remove function
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {fn.conds.map((cond, i) => (
          <CondEditor
            key={i}
            cond={cond}
            onChange={(next) => {
              const conds = [...fn.conds];
              conds[i] = next;
              onChange({ ...fn, conds });
            }}
            onRemove={() => onChange({ ...fn, conds: fn.conds.filter((_, j) => j !== i) })}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={fn.conds.length >= MAX_CONDS_PER_FN}
        onClick={() => onChange({ ...fn, conds: [...fn.conds, emptyCond()] })}
        className="mt-2 rounded-xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-mist hover:text-pale disabled:opacity-40"
      >
        Add condition ({fn.conds.length}/{MAX_CONDS_PER_FN})
      </button>
    </div>
  );
}

/** One rule, one target contract — deliberately not multi-target: a rule is "this contract, these functions, these signers," nothing bundled. */
export function PolicyBuilder({
  target,
  onChange,
}: {
  target: Target;
  onChange: (target: Target) => void;
}) {
  return (
    <div className="rounded-2xl border-[3px] border-line">
      <div className="flex items-center gap-2 border-b-[3px] border-line bg-surface p-3">
        <input
          value={target.contract}
          onChange={(e) => onChange({ ...target, contract: e.target.value })}
          placeholder="Contract address (C...)"
          className="flex-1 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1.5 font-mono text-xs text-pale placeholder:text-mist"
        />
        <input
          value={target.label ?? ""}
          onChange={(e) => onChange({ ...target, label: e.target.value || undefined })}
          placeholder="Label (optional)"
          className="w-40 rounded-xl border-[3px] border-line bg-surface-raised px-2 py-1.5 text-sm text-pale placeholder:text-mist"
        />
      </div>

      <div className="space-y-2 p-3">
        {target.fns.map((fn, i) => (
          <FnEditor
            key={i}
            fn={fn}
            onChange={(next) => {
              const fns = [...target.fns];
              fns[i] = next;
              onChange({ ...target, fns });
            }}
            onRemove={() => onChange({ ...target, fns: target.fns.filter((_, j) => j !== i) })}
          />
        ))}
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={target.fns.length >= MAX_FNS_PER_TARGET}
          onClick={() => onChange({ ...target, fns: [...target.fns, { name: "", conds: [] }] })}
          className="rounded-xl border-[3px] border-line px-2 py-1 text-xs text-mist transition hover:border-mist hover:text-pale disabled:opacity-40"
        >
          Add function ({target.fns.length}/{MAX_FNS_PER_TARGET})
        </button>
      </div>
    </div>
  );
}
