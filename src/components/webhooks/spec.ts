import spec from './openapi.json';
import { PROBLEM_CODES, WARNING_CODES } from './codes';

// Reads the tables on the Webhooks page out of the server's OpenAPI document, for the page and its markdown copy.

interface Schema {
  type?: string | string[];
  description?: string;
  format?: string;
  minLength?: number;
  maxLength?: number;
  maxItems?: number;
  default?: unknown;
  anyOf?: Schema[];
  items?: Schema;
  properties?: Record<string, Schema>;
  required?: string[];
  enum?: string[];
}

export interface PayloadRow {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
  link?: string;
}

const schemas = spec.components.schemas as unknown as Record<string, Schema>;
const message = schemas.WebhookMessage;
const card = message.properties!.cards.items!;

const OBJECTS = {
  message,
  card,
  author: card.properties!.author,
  field: card.properties!.fields.items!,
  footer: card.properties!.footer,
};

export type PayloadObject = keyof typeof OBJECTS;

const NAMES: Record<string, string> = { cards: 'Card', author: 'Author', fields: 'Field', footer: 'Footer' };
const LINKS: Record<string, string> = { cards: '#card', author: '#author', fields: '#field', footer: '#footer' };

function typeOf(name: string, s: Schema): string {
  if (s.anyOf) return s.anyOf.map((option) => typeOf(name, option)).join(' | ');
  if (s.type === 'array') return `${NAMES[name] ?? 'item'}[]`;
  if (s.type === 'object') return NAMES[name] ?? 'object';
  if (s.format === 'uri') return 'URL';
  if (s.format === 'date-time') return 'timestamp';
  return Array.isArray(s.type) ? s.type.join(' | ') : (s.type ?? 'any');
}

function limitsOf(s: Schema): string[] {
  const out: string[] = [];
  if (s.maxLength !== undefined) out.push(`Up to ${s.maxLength.toLocaleString('en')} characters.`);
  if (s.maxItems !== undefined) out.push(`Up to ${s.maxItems}.`);
  if (s.minLength) out.push("Can't be empty.");
  return out;
}

export function payloadRows(object: PayloadObject): PayloadRow[] {
  const schema = OBJECTS[object];
  return Object.entries(schema.properties ?? {}).map(([name, s]) => ({
    name,
    type: typeOf(name, s),
    description: [s.description, ...limitsOf(s)].filter(Boolean).join(' '),
    required: schema.required?.includes(name) ?? false,
    default: s.default === undefined ? undefined : JSON.stringify(s.default),
    link: LINKS[name],
  }));
}

export type CodeList = 'problems' | 'warnings';

export function codeRows(list: CodeList): { code: string; meaning: string }[] {
  const codes =
    list === 'problems'
      ? schemas.InvalidPayload.properties!.problems.items!.properties!.code.enum!
      : schemas.WebhookMessageSent.properties!.warnings.items!.properties!.code.enum!;
  const words = list === 'problems' ? PROBLEM_CODES : WARNING_CODES;
  return codes.map((code) => ({ code, meaning: words[code] ?? '' }));
}

/** The same tables as markdown, for the page's .md copy and llms-full.txt. */
export function markdownTable(name: string, props: Record<string, string>): string | undefined {
  const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  if (name === 'PayloadTable' && props.object in OBJECTS) {
    const rows = payloadRows(props.object as PayloadObject);
    return [
      '| Key | Type | Required | Description |',
      '|---|---|---|---|',
      ...rows.map((r) => `| \`${r.name}\` | ${cell(r.type)} | ${r.required ? 'yes' : 'no'} | ${cell(r.description)}${r.default ? ` Default \`${r.default}\`.` : ''} |`),
    ].join('\n');
  }
  if (name === 'CodeTable' && (props.list === 'problems' || props.list === 'warnings')) {
    return ['| Code | Meaning |', '|---|---|', ...codeRows(props.list).map((r) => `| \`${r.code}\` | ${cell(r.meaning)} |`)].join('\n');
  }
  return undefined;
}
