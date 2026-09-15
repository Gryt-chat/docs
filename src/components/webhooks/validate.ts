// The server's webhook payload rules, mirrored without zod so the preview stays small.
// scripts/check-webhook-spec.mjs runs this and the server's own schema over the same payloads.

export const WEBHOOK_LIMITS = {
  text: 4000,
  displayName: 64,
  url: 2048,
  cards: 10,
  title: 256,
  description: 4000,
  authorName: 256,
  fields: 25,
  fieldName: 256,
  fieldValue: 1024,
  footerText: 2048,
  cardsTotal: 6000,
  problems: 20,
} as const;

export interface PayloadProblem {
  path: string;
  code: string;
  limit?: number;
  message: string;
}

export interface PayloadWarning {
  path: string;
  code: string;
  message: string;
}

export type RefusalBody =
  | { error: "empty_message"; message: string }
  | { error: "message_too_long"; message: string }
  | { error: "invalid_payload"; message: string; problems: PayloadProblem[] };

export type PayloadVerdict =
  | { ok: true; warnings: PayloadWarning[] }
  | { ok: false; body: RefusalBody };

type Path = (string | number)[];

interface Issue {
  path: Path;
  code: string;
  limit?: number;
  message: string;
  fatal: boolean;
}

const L = WEBHOOK_LIMITS;
const HEX = /^#[0-9a-fA-F]{6}$/;
const DATETIME =
  /^(?:(?:\d\d[2468][048]|\d\d[13579][26]|\d\d0[48]|[02468][048]00|[13579][26]00)-02-29|\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|(?:02)-(?:0[1-9]|1\d|2[0-8])))T(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|([+-](?:[01]\d|2[0-3]):[0-5]\d)))$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function formatPath(path: Path): string {
  let out = "";
  for (const part of path) {
    if (typeof part === "number") out += `[${part}]`;
    else out += out ? `.${part}` : part;
  }
  return out;
}

class Checker {
  issues: Issue[] = [];

  add(path: Path, code: string, message: string, fatal: boolean, limit?: number) {
    this.issues.push({ path, code, message, fatal, limit });
  }

  fatalSince(start: number): boolean {
    return this.issues.slice(start).some((issue) => issue.fatal);
  }

  wrongType(path: Path, value: unknown, expected: string, min?: number, max?: number) {
    const missing = value === undefined;
    this.add(path, missing ? "required" : "wrong_type", missing ? `Required.` : `Expected ${expected}.`, true);
    // zod still runs length checks on anything with a length, so a long string where an array belongs gets both.
    if (typeof value !== "string" && !Array.isArray(value)) return;
    if (min !== undefined && value.length < min) this.add(path, "required", "Can't be empty.", false);
    if (max !== undefined && value.length > max) {
      const code = Array.isArray(value) ? "too_many" : "too_long";
      this.add(path, code, `Longer than ${max}.`, false, max);
    }
  }

  /** A trimmed string with a length range. Returns the trimmed value, or undefined when it isn't a string. */
  text(path: Path, value: unknown, min: number, max: number): string | undefined {
    if (typeof value !== "string") {
      this.wrongType(path, value, "a string", min, max);
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed.length < min) this.add(path, "required", "Can't be empty.", false);
    if (trimmed.length > max) this.add(path, "too_long", `Longer than ${max} characters.`, false, max);
    return trimmed;
  }

  url(path: Path, value: unknown): string | undefined {
    if (typeof value !== "string") {
      this.wrongType(path, value, "a URL", undefined, L.url);
      return undefined;
    }
    const trimmed = value.trim();
    let out = value;
    if (!/^https?:\/\//i.test(trimmed) || !parses(trimmed)) {
      this.add(path, "invalid_url", "Use an http or https URL.", false);
    } else {
      out = trimmed.replace(/[\t\n\r]/g, "");
    }
    if (out.length > L.url) this.add(path, "too_long", `Longer than ${L.url} characters.`, false, L.url);
    return out;
  }

  color(path: Path, value: unknown) {
    const message = "Use #rrggbb or an integer from 0 to 16777215.";
    if (typeof value === "string") {
      if (!HEX.test(value)) this.add(path, "invalid_color", message, false);
    } else if (typeof value === "number" && Number.isSafeInteger(value)) {
      if (value < 0 || value > 0xffffff) this.add(path, "invalid_color", message, false);
    } else {
      this.add(path, "invalid_color", message, true);
    }
  }
}

function parses(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface CardText {
  title?: string;
  description?: string;
  authorName?: string;
  footerText?: string;
  fields: { name?: string; value?: string }[];
  hasContent: boolean;
}

function checkCard(c: Checker, card: unknown, at: Path): CardText | null {
  if (!isRecord(card)) {
    c.wrongType(at, card, "an object");
    return null;
  }
  const start = c.issues.length;
  const out: CardText = { fields: [], hasContent: false };

  if (card.title !== undefined) out.title = c.text([...at, "title"], card.title, 1, L.title);
  if (card.url !== undefined) c.url([...at, "url"], card.url);
  if (card.description !== undefined) out.description = c.text([...at, "description"], card.description, 1, L.description);
  if (card.color !== undefined) c.color([...at, "color"], card.color);

  let hasAuthor = false;
  if (card.author !== undefined) {
    const author = card.author;
    if (!isRecord(author)) {
      c.wrongType([...at, "author"], author, "an object");
    } else {
      hasAuthor = true;
      out.authorName = c.text([...at, "author", "name"], author.name, 1, L.authorName);
      if (author.url !== undefined) c.url([...at, "author", "url"], author.url);
      if (author.icon_url !== undefined) c.url([...at, "author", "icon_url"], author.icon_url);
    }
  }

  let fieldCount = 0;
  if (card.fields !== undefined) {
    if (!Array.isArray(card.fields)) {
      c.wrongType([...at, "fields"], card.fields, "an array", undefined, L.fields);
    } else {
      fieldCount = card.fields.length;
      card.fields.forEach((field, j) => {
        const fieldAt = [...at, "fields", j];
        if (!isRecord(field)) {
          c.wrongType(fieldAt, field, "an object");
          return;
        }
        const name = c.text([...fieldAt, "name"], field.name, 1, L.fieldName);
        const value = c.text([...fieldAt, "value"], field.value, 1, L.fieldValue);
        if (field.inline !== undefined && typeof field.inline !== "boolean") c.wrongType([...fieldAt, "inline"], field.inline, "true or false");
        out.fields.push({ name, value });
      });
      // Array limits run after the items, so they come last in the list.
      if (card.fields.length > L.fields) c.add([...at, "fields"], "too_many", `More than ${L.fields} fields.`, false, L.fields);
    }
  }

  let image = "";
  if (card.image_url !== undefined) image = c.url([...at, "image_url"], card.image_url) ?? "";
  if (card.thumbnail_url !== undefined) c.url([...at, "thumbnail_url"], card.thumbnail_url);

  if (card.footer !== undefined) {
    const footer = card.footer;
    if (!isRecord(footer)) {
      c.wrongType([...at, "footer"], footer, "an object");
    } else {
      out.footerText = c.text([...at, "footer", "text"], footer.text, 1, L.footerText);
      if (footer.icon_url !== undefined) c.url([...at, "footer", "icon_url"], footer.icon_url);
    }
  }

  if (card.timestamp !== undefined) {
    if (typeof card.timestamp !== "string") c.wrongType([...at, "timestamp"], card.timestamp, "a string");
    else if (!DATETIME.test(card.timestamp)) c.add([...at, "timestamp"], "invalid_timestamp", "Use ISO 8601 with a time zone, like 2026-09-15T07:42:00Z.", false);
  }

  if (c.fatalSince(start)) return out;
  out.hasContent = Boolean(out.title || out.description || fieldCount || image || hasAuthor);
  if (!out.hasContent) {
    c.add(at, "empty_card", "A card needs a title, description, fields, image_url or author.", false);
  }
  return out;
}

function cardLength(card: CardText): number {
  return (
    (card.title?.length ?? 0) +
    (card.description?.length ?? 0) +
    (card.authorName?.length ?? 0) +
    (card.footerText?.length ?? 0) +
    card.fields.reduce((sum, f) => sum + (f.name?.length ?? 0) + (f.value?.length ?? 0), 0)
  );
}

/** What POST /api/webhooks/:id/:token answers for this body, short of fetching pictures. */
export function checkWebhookPayload(body: unknown): PayloadVerdict {
  const c = new Checker();
  if (!isRecord(body)) {
    c.wrongType([], body, "an object");
    return refuse(c.issues);
  }

  let text = "";
  if (body.text !== undefined) {
    if (typeof body.text !== "string") c.wrongType(["text"], body.text, "a string", undefined, L.text);
    else {
      text = body.text.trim();
      if (text.length > L.text) c.add(["text"], "too_long", `Longer than ${L.text} characters.`, false, L.text);
    }
  }
  if (body.display_name !== undefined && typeof body.display_name !== "string") {
    c.wrongType(["display_name"], body.display_name, "a string");
  }
  if (body.avatar_url !== undefined) c.url(["avatar_url"], body.avatar_url);

  const cards: CardText[] = [];
  let cardCount = 0;
  if (body.cards !== undefined) {
    if (!Array.isArray(body.cards)) {
      c.wrongType(["cards"], body.cards, "an array", undefined, L.cards);
    } else {
      cardCount = body.cards.length;
      body.cards.forEach((card, i) => {
        const checked = checkCard(c, card, ["cards", i]);
        if (checked) cards.push(checked);
      });
      if (cardCount > L.cards) c.add(["cards"], "too_many", `More than ${L.cards} cards.`, false, L.cards);
    }
  }

  if (!c.fatalSince(0)) {
    if (!text && cardCount === 0) c.add([], "empty_message", "Send text, cards or both.", false);
    const total = cards.reduce((sum, card) => sum + cardLength(card), 0);
    if (total > L.cardsTotal) {
      c.add(["cards"], "total_too_long", `All cards together are limited to ${L.cardsTotal} characters.`, false, L.cardsTotal);
    }
  }

  if (c.issues.length > 0) return refuse(c.issues);
  return { ok: true, warnings: unknownKeys(body) };
}

function refuse(issues: Issue[]): PayloadVerdict {
  const problems = issues.slice(0, L.problems).map(({ path, code, limit, message }) => ({
    path: formatPath(path),
    code,
    ...(limit ? { limit } : {}),
    message,
  }));
  if (problems.length === 1 && problems[0].code === "empty_message") {
    return { ok: false, body: { error: "empty_message", message: "Send text, cards or both." } };
  }
  if (problems.length === 1 && problems[0].path === "text" && problems[0].code === "too_long") {
    return { ok: false, body: { error: "message_too_long", message: "Messages are limited to 4,000 characters." } };
  }
  const message = problems.length === 1 ? "The payload has 1 problem." : `The payload has ${problems.length} problems.`;
  return { ok: false, body: { error: "invalid_payload", message, problems } };
}

const KNOWN = {
  message: new Set(["text", "display_name", "avatar_url", "cards"]),
  card: new Set(["title", "url", "description", "color", "author", "fields", "image_url", "thumbnail_url", "footer", "timestamp"]),
  author: new Set(["name", "url", "icon_url"]),
  footer: new Set(["text", "icon_url"]),
  field: new Set(["name", "value", "inline"]),
};

/** Keys the server drops and reports under `warnings`, rather than refusing. */
export function unknownKeys(body: unknown): PayloadWarning[] {
  const out: PayloadWarning[] = [];
  const check = (value: unknown, known: Set<string>, prefix: string) => {
    if (!isRecord(value)) return;
    for (const key of Object.keys(value)) {
      if (known.has(key)) continue;
      const path = prefix ? `${prefix}.${key}` : key;
      out.push({ path, code: "unknown_key", message: `${path} isn't part of a webhook message and was ignored.` });
    }
  };
  check(body, KNOWN.message, "");
  if (isRecord(body) && Array.isArray(body.cards)) {
    body.cards.forEach((card, i) => {
      check(card, KNOWN.card, `cards[${i}]`);
      if (!isRecord(card)) return;
      check(card.author, KNOWN.author, `cards[${i}].author`);
      check(card.footer, KNOWN.footer, `cards[${i}].footer`);
      if (Array.isArray(card.fields)) card.fields.forEach((f, j) => check(f, KNOWN.field, `cards[${i}].fields[${j}]`));
    });
  }
  return out.slice(0, L.problems);
}
