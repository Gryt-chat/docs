import { TypeTable, type TypeNode } from 'fumadocs-ui/components/type-table';
import type { ReactNode } from 'react';
import { codeRows, payloadRows, type CodeList, type PayloadObject } from './spec';

/** Backticks in the spec's descriptions become code, the way they read in markdown. */
function prose(text: string): ReactNode {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.length > 1 && part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}

export function PayloadTable({ object }: { object: PayloadObject }) {
  const type: Record<string, TypeNode> = {};
  for (const row of payloadRows(object)) {
    type[row.name] = {
      type: row.type,
      description: row.description ? prose(row.description) : undefined,
      required: row.required,
      default: row.default,
      typeDescriptionLink: row.link,
    };
  }
  return <TypeTable type={type} />;
}

export function CodeTable({ list }: { list: CodeList }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {codeRows(list).map((row) => (
          <tr key={row.code}>
            <td>
              <code>{row.code}</code>
            </td>
            <td>{prose(row.meaning)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
