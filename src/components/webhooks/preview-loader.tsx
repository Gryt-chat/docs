'use client';

import dynamic from 'next/dynamic';

// Every docs page shares one route, so a plain import would ship the preview and its card to all of them.
export const WebhookPreview = dynamic(() => import('./preview').then((m) => m.WebhookPreview), {
  loading: () => <div className="not-prose my-6 min-h-[36rem] rounded-xl border bg-fd-card" aria-hidden="true" />,
});
