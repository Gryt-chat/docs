// The retired periwinkle-circle owl (ear ellipses at rx="74.5603") must
// never come back. See src/lib/og.tsx for the current mark.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FINGERPRINT = /74\.5603/i;
const ROOTS = ["src", "public"];
const SKIP = new Set(["node_modules", "dist", "build", "out", "coverage", ".git"]);
const TEXT = /\.(ts|tsx|js|mjs|cjs|jsx|svg|css)$/;

function files(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full));
    else if (TEXT.test(name)) out.push(full);
  }
  return out;
}

const offenders = [];
for (const root of ROOTS) {
  let entries;
  try {
    entries = files(root);
  } catch {
    continue;
  }
  for (const file of entries) {
    if (FINGERPRINT.test(readFileSync(file, "utf8"))) offenders.push(file);
  }
}

if (offenders.length > 0) {
  console.error("retired owl mark found in:\n");
  for (const file of offenders) console.error(`  ${file}`);
  process.exit(1);
}

console.log("owl mark: no retired copies found");
