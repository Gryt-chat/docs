import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

const { GET: search } = createFromSource(source, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'english',
});

// The support page on gryt.chat searches these docs from the browser.
export async function GET(request: Request) {
  const response = await search(request);
  response.headers.set('Access-Control-Allow-Origin', 'https://gryt.chat');
  return response;
}
