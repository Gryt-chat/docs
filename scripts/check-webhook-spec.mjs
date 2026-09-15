// Fails when the Webhooks page drifts from Gryt-chat/server: the vendored spec, the limits, or the preview's validation.
// Reads server main over HTTPS, or a local checkout from GRYT_SERVER_DIR.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPEC = "src/components/webhooks/openapi.json";
const RAW = "https://raw.githubusercontent.com/Gryt-chat/server/main";

async function serverFile(path) {
  if (process.env.GRYT_SERVER_DIR) return readFileSync(join(process.env.GRYT_SERVER_DIR, path), "utf8");
  const res = await fetch(`${RAW}/${path}`);
  if (!res.ok) throw new Error(`${RAW}/${path} answered ${res.status}`);
  return res.text();
}

const failures = [];
const fail = (msg) => failures.push(msg);

const [specText, schemasTs, limitsTs] = await Promise.all([
  serverFile("openapi/webhooks.json"),
  serverFile("src/routes/webhookSchemas.ts"),
  serverFile("src/utils/messageLimits.ts"),
]);

if (!isDeepStrictEqual(JSON.parse(specText), JSON.parse(readFileSync(join(root, SPEC), "utf8")))) {
  fail(`${SPEC} differs from openapi/webhooks.json on server main. Copy it over and check the page still says the same.`);
}

// Node won't strip types under node_modules, so the server source sits in a temp dir, pointed at our zod.
const work = mkdtempSync(join(tmpdir(), "gryt-webhook-check-"));
process.on("exit", () => rmSync(work, { recursive: true, force: true }));
writeFileSync(join(work, "messageLimits.ts"), limitsTs);
writeFileSync(
  join(work, "webhookSchemas.ts"),
  schemasTs
    .replace(/from "\.\.\/utils\/messageLimits"/, 'from "./messageLimits.ts"')
    .replace(/from "zod"/, `from ${JSON.stringify(import.meta.resolve("zod"))}`),
);

const server = await import(pathToFileURL(join(work, "webhookSchemas.ts")).href);
const { MESSAGE_MAX_LENGTH } = await import(pathToFileURL(join(work, "messageLimits.ts")).href);
const docs = await import(pathToFileURL(join(root, "src/components/webhooks/validate.ts")).href);
const { WEBHOOK_PRESETS } = await import(pathToFileURL(join(root, "src/components/webhooks/presets.ts")).href);
const { PROBLEM_CODES, WARNING_CODES } = await import(pathToFileURL(join(root, "src/components/webhooks/codes.ts")).href);

const spec = JSON.parse(specText).components.schemas;
const listed = {
  problem: [spec.InvalidPayload.properties.problems.items.properties.code.enum, PROBLEM_CODES],
  warning: [spec.WebhookMessageSent.properties.warnings.items.properties.code.enum, WARNING_CODES],
};
for (const [kind, [codes, words]] of Object.entries(listed)) {
  const missing = codes.filter((code) => !words[code]);
  const extra = Object.keys(words).filter((code) => !codes.includes(code));
  if (missing.length) fail(`codes.ts has no words for the ${kind} code(s) ${missing.join(", ")}.`);
  if (extra.length) fail(`codes.ts explains ${kind} code(s) the spec doesn't have: ${extra.join(", ")}.`);
}

if (!isDeepStrictEqual({ ...server.WEBHOOK_LIMITS, text: MESSAGE_MAX_LENGTH }, { ...docs.WEBHOOK_LIMITS })) {
  fail(`WEBHOOK_LIMITS in validate.ts don't match the server's: ${JSON.stringify(server.WEBHOOK_LIMITS)}, text ${MESSAGE_MAX_LENGTH}`);
}

/** The route's answer, as src/routes/webhooks.ts builds it. */
function serverVerdict(body) {
  const parsed = server.webhookMessageSchema.safeParse(body ?? {}, { reportInput: true });
  if (parsed.success) return { ok: true, warnings: server.unknownKeys(body).map(({ path, code }) => ({ path, code })) };
  const problems = server.problemsFrom(parsed.error);
  if (problems.length === 1 && problems[0].code === "empty_message") return { ok: false, error: "empty_message" };
  if (problems.length === 1 && problems[0].path === "text" && problems[0].code === "too_long") return { ok: false, error: "message_too_long" };
  return { ok: false, error: "invalid_payload", problems: problems.map(({ path, code, limit }) => ({ path, code, limit })) };
}

function docsVerdict(body) {
  const v = docs.checkWebhookPayload(body);
  if (v.ok) return { ok: true, warnings: v.warnings.map(({ path, code }) => ({ path, code })) };
  if (v.body.error !== "invalid_payload") return { ok: false, error: v.body.error };
  return { ok: false, error: "invalid_payload", problems: v.body.problems.map(({ path, code, limit }) => ({ path, code, limit })) };
}

// Seeded, so a failure names a case that reproduces.
let seed = 1187;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (list) => list[Math.floor(rand() * list.length)];

const ODD_VALUES = [
  undefined, null, true, 0, 1.5, -1, 16777215, 16777216, "", " ", "x", "  padded  ", "#3fb27f", "#3FB27G", "red",
  "https://example.com/a.png", " https://example.com/b.png ", "http:example.com", "ftp://example.com", "https://",
  `https://example.com/${"a".repeat(2048)}`, "2026-09-15T07:42:00Z", "2026-09-15T07:42:00+02:00", "2026-09-15",
  "2026-02-30T00:00:00Z", "a".repeat(257), "b".repeat(1025), "c".repeat(4001), [], {}, [{}], { name: "n" },
  { name: "n", value: "v" }, { name: " ", value: "v", inline: "yes" }, { text: "footer", icon_url: "nope" },
];

function mutate(value, depth = 0) {
  if (Array.isArray(value)) {
    const copy = value.map((v) => (rand() < 0.3 ? mutate(v, depth + 1) : v));
    if (rand() < 0.15) copy.push(copy.length ? structuredClone(pick(copy)) : pick(ODD_VALUES));
    if (rand() < 0.1 && copy.length) copy.splice(Math.floor(rand() * copy.length), 1);
    if (rand() < 0.05) while (copy.length && copy.length < 30) copy.push(structuredClone(copy[0]));
    return copy;
  }
  if (value && typeof value === "object") {
    const copy = { ...value };
    for (const key of Object.keys(copy)) {
      const r = rand();
      if (r < 0.1) delete copy[key];
      else if (r < 0.25) copy[key] = pick(ODD_VALUES);
      else if (r < 0.5) copy[key] = mutate(copy[key], depth + 1);
    }
    if (rand() < 0.1) copy[pick(["extra", "embeds", "username", "inline", "name", "text"])] = pick(ODD_VALUES);
    return copy;
  }
  return rand() < 0.3 ? pick(ODD_VALUES) : value;
}

const cases = [
  ...WEBHOOK_PRESETS.map((p) => p.payload),
  {}, [], { text: "   " }, { text: "c".repeat(4001) }, { text: "c".repeat(4001), cards: [{}] },
  { cards: [] }, { cards: Array.from({ length: 11 }, () => ({ title: "t" })) },
  { cards: Array.from({ length: 2 }, () => ({ description: "d".repeat(3001) })) },
  { cards: [{ description: "d".repeat(4000), fields: [{ name: "n".repeat(256), value: "v".repeat(1024) }, { name: "n".repeat(256), value: "v".repeat(1000) }] }] },
];
for (let i = 0; i < 3000; i++) cases.push(mutate(structuredClone(pick(WEBHOOK_PRESETS).payload)));

for (const preset of WEBHOOK_PRESETS) {
  if (!docsVerdict(preset.payload).ok) fail(`The "${preset.id}" preset doesn't pass validation.`);
}

let mismatches = 0;
for (const body of cases) {
  const want = serverVerdict(body);
  const got = docsVerdict(body);
  if (isDeepStrictEqual(want, got)) continue;
  if (++mismatches <= 5) {
    fail(`Validation differs for ${JSON.stringify(body).slice(0, 300)}\n  server: ${JSON.stringify(want).slice(0, 600)}\n  docs:   ${JSON.stringify(got).slice(0, 600)}`);
  }
}
if (mismatches > 5) fail(`...and ${mismatches - 5} more payloads where validation differs.`);

if (failures.length) {
  console.error(`check-webhook-spec: ${failures.length} problem(s)\n\n${failures.join("\n\n")}`);
  process.exit(1);
}
console.log(`check-webhook-spec: spec and limits match server main, and ${cases.length} payloads validate the same way.`);
