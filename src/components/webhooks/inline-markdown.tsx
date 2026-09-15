import { Fragment, type ReactNode } from 'react';

// Bold, italics, strikethrough, inline code and links. The app's chat markdown does more; this covers what cards mostly use.

const TOKEN = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(__[^_\n]+__)|(~~[^~\n]+~~)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]\n]+\]\((https?:\/\/[^)\s]+)\))/;

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest) {
    const m = TOKEN.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const [whole] = m;
    const k = `${key}-${n++}`;
    if (m[1]) out.push(<code key={k}>{whole.slice(1, -1)}</code>);
    else if (m[2] || m[3]) out.push(<strong key={k}>{inline(whole.slice(2, -2), k)}</strong>);
    else if (m[4]) out.push(<del key={k}>{inline(whole.slice(2, -2), k)}</del>);
    else if (m[5] || m[6]) out.push(<em key={k}>{inline(whole.slice(1, -1), k)}</em>);
    else if (m[7]) {
      const label = whole.slice(1, whole.indexOf(']('));
      out.push(
        <a key={k} href={m[8]} target="_blank" rel="noopener noreferrer nofollow ugc" className="text-gryt-accent-11 underline-offset-2 hover:underline">
          {label}
        </a>,
      );
    }
    rest = rest.slice(m.index + whole.length);
  }
  return out;
}

export function renderInlineMarkdown(text: string): ReactNode {
  return (
    <span className="whitespace-pre-line">
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? '\n' : null}
          {inline(line, String(i))}
        </Fragment>
      ))}
    </span>
  );
}
