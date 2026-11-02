import { shortAddr } from "./format";
import type { Cond, CondValue } from "./types";

function describeValue(v: CondValue): string {
  switch (v.kind) {
    case "address":
      return shortAddr(v.value);
    case "symbol":
      return `"${v.value}"`;
    case "u32":
    case "i128":
      return String(v.value);
  }
}

export function describeCond(c: Cond): string {
  switch (c.kind) {
    case "Eq":
      return `arg[${c.arg}] = ${describeValue(c.value)}`;
    case "OneOf":
      return `arg[${c.arg}] ∈ {${c.values.map(describeValue).join(", ")}}`;
    case "EqSelf":
      return `arg[${c.arg}] = this account`;
    case "Range":
      return `arg[${c.arg}] ∈ [${c.min}, ${c.max}]`;
  }
}
