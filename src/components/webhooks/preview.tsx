'use client';

import { WebhookCard, type WebhookCardData } from '@gryt/ui/webhook-card';
import { useEffect, useId, useMemo, useState } from 'react';
import { renderInlineMarkdown } from './inline-markdown';
import { PLACEHOLDER_WEBHOOK_URL, WEBHOOK_PRESETS } from './presets';
import { checkWebhookPayload, WEBHOOK_LIMITS, type PayloadVerdict } from './validate';

type Parsed = { json: unknown; error?: undefined } | { json?: undefined; error: string };

function parse(source: string): Parsed {
  try {
    return { json: JSON.parse(source) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const record = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;

function hexColor(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffff) {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
  return typeof value === 'string' ? value : undefined;
}

/** A payload card in the shape the component takes. Loose on purpose, so a half-typed card still draws. */
function toCardData(raw: unknown): WebhookCardData | null {
  const card = record(raw);
  if (!card) return null;
  const author = record(card.author);
  const footer = record(card.footer);
  const fields = Array.isArray(card.fields)
    ? card.fields.flatMap((f) => {
        const field = record(f);
        const name = str(field?.name);
        const value = str(field?.value);
        return field && name && value ? [{ name, value, inline: field.inline === true }] : [];
      })
    : undefined;
  return {
    title: str(card.title),
    url: str(card.url),
    description: str(card.description),
    color: hexColor(card.color),
    author: author && str(author.name) ? { name: str(author.name)!, url: str(author.url), iconUrl: str(author.icon_url) } : undefined,
    fields: fields?.length ? fields : undefined,
    imageUrl: str(card.image_url),
    thumbnailUrl: str(card.thumbnail_url),
    footer: footer && str(footer.text) ? { text: str(footer.text)!, iconUrl: str(footer.icon_url) } : undefined,
    timestamp: str(card.timestamp),
  };
}

function curlFor(json: unknown): string {
  const body = JSON.stringify(json, null, 2).replace(/'/g, `'\\''`);
  return `curl -X POST '${PLACEHOLDER_WEBHOOK_URL}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`;
}

function Status({ parsed, verdict }: { parsed: Parsed; verdict: PayloadVerdict | null }) {
  if (parsed.error !== undefined) {
    return (
      <p className="text-fd-error">
        <strong>Not valid JSON.</strong> {parsed.error}
      </p>
    );
  }
  if (!verdict) return null;
  if (verdict.ok) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-fd-success">
          <strong>200.</strong> Gryt would post this.
        </p>
        {verdict.warnings.map((w) => (
          <p key={w.path} className="text-fd-warning">
            <code>{w.code}</code> at <code>{w.path}</code>: {w.message}
          </p>
        ))}
      </div>
    );
  }
  const { body } = verdict;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-fd-error">
        <strong>400 {body.error}.</strong> {body.message} Nothing would be posted.
      </p>
      {body.error === 'invalid_payload' ? (
        <ul className="flex list-none flex-col gap-1 p-0">
          {body.problems.map((p, i) => (
            <li key={`${p.path}-${p.code}-${i}`}>
              <code>{p.path || "(the body)"}</code> <code className="text-fd-muted-foreground">{p.code}</code>
              {p.limit ? ` (limit ${p.limit})` : ''}: {p.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function WebhookPreview() {
  const [presetId, setPresetId] = useState(WEBHOOK_PRESETS[1].id);
  const [source, setSource] = useState(() => JSON.stringify(WEBHOOK_PRESETS[1].payload, null, 2));
  const [lastGood, setLastGood] = useState<unknown>(WEBHOOK_PRESETS[1].payload);
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const [avatarFailed, setAvatarFailed] = useState(false);
  // Timestamps are drawn in the reader's time zone, which the server rendering this page doesn't know.
  const [mounted, setMounted] = useState(false);
  const editorId = useId();
  const statusId = useId();

  useEffect(() => setMounted(true), []);

  const parsed = useMemo(() => parse(source), [source]);
  const verdict = useMemo(() => (parsed.error === undefined ? checkWebhookPayload(parsed.json) : null), [parsed]);

  useEffect(() => {
    if (parsed.error === undefined) setLastGood(parsed.json);
  }, [parsed]);

  const message = record(lastGood) ?? {};
  const avatarUrl = str(message.avatar_url);
  useEffect(() => setAvatarFailed(false), [avatarUrl]);

  const name = str(message.display_name)?.slice(0, WEBHOOK_LIMITS.displayName) ?? 'Webhook';
  const text = str(message.text);
  const cards = (Array.isArray(message.cards) ? message.cards : []).slice(0, WEBHOOK_LIMITS.cards).map(toCardData);

  const choose = (id: string) => {
    const preset = WEBHOOK_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setSource(JSON.stringify(preset.payload, null, 2));
  };

  const copy = async () => {
    if (parsed.error !== undefined) return;
    try {
      await navigator.clipboard.writeText(curlFor(parsed.json));
      setCopied('done');
    } catch {
      setCopied('failed');
    }
    setTimeout(() => setCopied('idle'), 2000);
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border bg-fd-card text-sm text-fd-card-foreground">
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        <div role="group" aria-label="Example payloads" className="flex flex-wrap gap-1">
          {WEBHOOK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={presetId === preset.id}
              onClick={() => choose(preset.id)}
              className="rounded-md px-2.5 py-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground aria-pressed:bg-fd-accent aria-pressed:text-fd-accent-foreground focus-visible:outline-2 focus-visible:outline-fd-ring"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={parsed.error !== undefined}
          className="ms-auto rounded-md border px-2.5 py-1 transition-colors hover:bg-fd-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-fd-ring"
        >
          {copied === 'done' ? 'Copied' : copied === 'failed' ? "Couldn't copy" : 'Copy as curl'}
        </button>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="flex min-w-0 flex-col border-b md:border-e md:border-b-0">
          <label htmlFor={editorId} className="sr-only">
            Payload JSON
          </label>
          <textarea
            id={editorId}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPresetId('');
            }}
            aria-describedby={statusId}
            aria-invalid={parsed.error !== undefined || (verdict !== null && !verdict.ok)}
            spellCheck={false}
            wrap="off"
            autoCapitalize="off"
            autoCorrect="off"
            className="min-h-80 flex-1 resize-y bg-fd-background p-3 font-mono text-[13px] leading-5 text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset md:min-h-[32rem]"
          />
          <div id={statusId} aria-live="polite" className="border-t p-3 text-[13px] leading-5 break-words">
            <Status parsed={parsed} verdict={verdict} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 bg-fd-background p-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-fd-muted">
              {avatarUrl && !avatarFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={() => setAvatarFailed(true)} />
              ) : (
                <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-semibold text-fd-muted-foreground">
                  {name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold text-gryt-neutral-12">{name}</span>
                <span className="inline-flex h-4 shrink-0 items-center rounded-(--gryt-radius-sm) bg-gryt-accent-9 px-1.5 text-[10px] leading-none font-semibold tracking-[0.02em] text-gryt-neutral-1 select-none">
                  BOT
                </span>
              </div>
              {text ? <div className="break-words">{renderInlineMarkdown(text)}</div> : null}
              <div className="flex flex-col gap-2">
                {cards.map((card, i) =>
                  card ? (
                    <WebhookCard
                      key={i}
                      card={card}
                      renderMarkdown={renderInlineMarkdown}
                      formatTimestamp={mounted ? undefined : () => ''}
                    />
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
