import { permanentRedirect } from 'next/navigation';

export default function HomePage() {
  // 308, so search engines keep /docs rather than the root. redirect() answered 307.
  permanentRedirect('/docs');
}
