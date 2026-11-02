import { z } from "zod";

const condValueType = z.enum(["u32", "i128", "address", "symbol"]);

export const condSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("eq_self"), arg: z.number().int().nonnegative() }),
  z.object({
    op: z.literal("eq"),
    arg: z.number().int().nonnegative(),
    type: condValueType,
    value: z.string().min(1),
  }),
  z.object({
    op: z.literal("one_of"),
    arg: z.number().int().nonnegative(),
    type: condValueType,
    values: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    op: z.literal("range"),
    arg: z.number().int().nonnegative(),
    min: z.string().min(1),
    max: z.string().min(1),
  }),
]);

export const fnRuleSchema = z.object({
  name: z.string().min(1).max(32),
  cond: z.array(condSchema).default([]),
});

export const targetSchema = z.object({
  contract: z.string().min(1),
  label: z.string().optional(),
  fn: z.array(fnRuleSchema).min(1),
});

export const ruleConfigSchema = z.object({
  name: z.string().min(1),
  mode: z.enum(["exit", "entry"]),
  threshold: z.number().int().positive(),
  signers: z.array(z.string().min(1)).min(1),
  target: z.array(targetSchema).min(1),
});

export const configFileSchema = z.object({
  account: z.object({ address: z.string().min(1) }),
  rule: z.array(ruleConfigSchema).min(1),
});
