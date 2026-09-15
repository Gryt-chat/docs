import { defineConfig, defineDocs } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { remarkMdxMermaid } from 'fumadocs-mermaid';

export const docs = defineDocs({
  docs: {
    schema: pageSchema,
    // Markdown for llms.txt and the .md routes, compiled once instead of reread from disk.
    postprocess: {
      includeProcessedMarkdown: {
        headingIds: false,
        // remarkMdxMermaid turned the fence into <Mermaid chart>; a model reads the fence better.
        stringify(node) {
          if (node.type !== 'mdxJsxFlowElement' || node.name !== 'Mermaid') return;
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
