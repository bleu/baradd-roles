#!/usr/bin/env node
import { Command } from "commander";
import { registerLint } from "./commands/lint.js";
import { registerDiff } from "./commands/diff.js";
import { registerSimulate } from "./commands/simulate.js";
import { registerApply } from "./commands/apply.js";

const program = new Command();

program
  .name("roles")
  .description("Define, validate, simulate, compare, and install Stellar Roles configurations.");

registerLint(program);
registerDiff(program);
registerSimulate(program);
registerApply(program);

program.parseAsync(process.argv);
