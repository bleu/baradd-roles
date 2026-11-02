import { parse } from "smol-toml";
import { configFileSchema } from "./schema.js";
import type { ConfigFile } from "./types.js";

export class ConfigValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid roles config:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "ConfigValidationError";
  }
}

/** Parses and structurally validates a roles config TOML document. */
export function parseConfigFile(toml: string): ConfigFile {
  const raw = parse(toml);
  const result = configFileSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new ConfigValidationError(issues);
  }
  return result.data;
}
