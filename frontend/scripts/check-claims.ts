#!/usr/bin/env tsx
/**
 * Checks page copy for unsupported audit or endorsement claims and words
 * from the avoid list below.
 *
 * Scans the files that actually render as page copy — not
 * content/claims.ts itself, which is the rulebook (it legitimately contains
 * "audited" and "backed by" as examples of what never to say, and would
 * false-positive against its own rules).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const SCAN_DIRS = [
  "src/app/(marketing)",
  "src/app/(app)",
  "src/app/docs",
  "src/app/layout.tsx",
  "src/components/marketing",
  "src/components/ui",
  "src/components",
  "src/content",
];

const EXCLUDE_FILES = new Set(["src/content/claims.ts"]);

const AVOID_WORDS = [
  "revolutionary",
  "seamless",
  "next-generation",
  "cutting-edge",
  "military-grade",
  "bank-grade",
  "unhackable",
  "robust",
  "powerful",
  "empower",
  "unlock",
  "supercharge",
  "web3",
];

const NEVER_PHRASES = ["backed by", "trusted by", "official partner", "official stellar"];

interface Violation {
  file: string;
  line: number;
  rule: string;
  excerpt: string;
}

function collectFiles(root: string): string[] {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    const abs = join(root, dir);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isFile()) {
      files.push(abs);
      continue;
    }
    walk(abs, files);
  }
  return files;
}

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(abs, out);
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      out.push(abs);
    }
  }
}

function checkFile(absPath: string, root: string): Violation[] {
  const relPath = absPath.slice(root.length + 1);
  if (EXCLUDE_FILES.has(relPath)) return [];

  const text = readFileSync(absPath, "utf8");
  const lines = text.split("\n");
  const violations: Violation[] = [];

  lines.forEach((line, i) => {
    // Skip comment lines — dev notes aren't rendered page copy, and words
    // like "robust" are fine there even though they're on the avoid list
    // for user-facing text.
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;

    const lower = line.toLowerCase();

    // "audited" must have "not" or "planned" nearby — within a 2-line
    // window, since an FAQ question ("Is it audited?") and its answer
    // ("No. ... planned.") legitimately live on separate lines. A bare
    // question (ends in "?", asks rather than claims) is never itself a
    // violation.
    const isQuestion = line.includes("?");
    if (lower.includes("audited") && !isQuestion) {
      const window = lines.slice(Math.max(0, i - 1), i + 2).join(" ").toLowerCase();
      if (!window.includes("not") && !window.includes("planned")) {
        violations.push({
          file: relPath,
          line: i + 1,
          rule: "'audited' without 'not' or 'planned' nearby",
          excerpt: line.trim(),
        });
      }
    }
    if (lower.includes("audit-ready")) {
      violations.push({ file: relPath, line: i + 1, rule: "'audit-ready'", excerpt: line.trim() });
    }

    for (const phrase of NEVER_PHRASES) {
      if (lower.includes(phrase)) {
        violations.push({ file: relPath, line: i + 1, rule: `forbidden phrase '${phrase}'`, excerpt: line.trim() });
      }
    }

    for (const word of AVOID_WORDS) {
      if (lower.includes(word)) {
        violations.push({ file: relPath, line: i + 1, rule: `avoid-list word '${word}'`, excerpt: line.trim() });
      }
    }
  });

  return violations;
}

function main() {
  const files = collectFiles(ROOT);
  const violations = files.flatMap((f) => checkFile(f, ROOT));

  if (violations.length === 0) {
    console.log(`check-claims: scanned ${files.length} files, no violations.`);
    return;
  }

  console.error(`check-claims: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.rule}`);
    console.error(`    ${v.excerpt}\n`);
  }
  process.exitCode = 1;
}

main();
