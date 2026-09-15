import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { remarkMdxMermaid } from 'fumadocs-mermaid';
import { markdownTable } from './src/components/webhooks/spec';

export const docs = defineDocs({
  docs: {
    schema: pageSchema,
    // Markdown for llms.txt and the .md routes, compiled once instead of reread from disk.
    postprocess: {
      includeProcessedMarkdown: {
        headingIds: false,
        // remarkMdxMermaid turned the fence into <Mermaid chart>; a model reads the fence better.
        stringify(node) {
          if (node.type !== 'mdxJsxFlowElement') return;
          const attrs = Object.fromEntries(
            node.attributes.flatMap((attr) =>
              attr.type === 'mdxJsxAttribute' && typeof attr.value === 'string' ? [[attr.name, attr.value]] : [],
            ),
          );
          // The Webhooks page's tables come from the server's spec; the preview only exists on the web page.
          if (node.name === 'WebhookPreview') return '_The interactive card preview is on the web version of this page._';
          const table = node.name ? markdownTable(node.name, attrs) : undefined;
          if (table) return table;
          if (node.name !== 'Mermaid') return;
          const chart = node.attributes.find(
            (attr) => attr.type === 'mdxJsxAttribute' && attr.name === 'chart',
          );
          if (typeof chart?.value === 'string') return `\`\`\`mermaid\n${chart.value}\n\`\`\``;
        },
      },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxMermaid],
    rehypePlugins: [],
  },
});
