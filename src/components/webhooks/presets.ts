// Starting payloads for the preview on the Webhooks page. Every one of them has to pass the server's rules.

const ASSETS = "https://docs.gryt.chat/webhooks";

export interface WebhookPreset {
  id: string;
  label: string;
  payload: Record<string, unknown>;
}

export const WEBHOOK_PRESETS: WebhookPreset[] = [
  {
    id: "minimal",
    label: "Minimal",
    payload: {
      cards: [
        {
          title: "Backup finished",
          description: "All 3 volumes copied in 2m 41s.",
          color: "#3fb27f",
        },
      ],
    },
  },
  {
    id: "rich",
    label: "Rich",
    payload: {
      text: "api v2.14.0 is live.",
      display_name: "Deploys",
      avatar_url: `${ASSETS}/sample-icon.png`,
      cards: [
        {
          author: { name: "ci.example.com", url: "https://example.com/runner", icon_url: `${ASSETS}/sample-icon.png` },
          title: "Deploy finished: api v2.14.0",
          url: "https://example.com/deploys/2140",
          description: "Rolled out to **eu-north** and **us-east** in 4 minutes.\nTwo migrations ran, and `0047_threads` took the longest.",
          color: "#3fb27f",
          fields: [
            { name: "Environment", value: "production", inline: true },
            { name: "Commit", value: "a1b2c3d", inline: true },
            { name: "Duration", value: "4m 12s", inline: true },
          ],
          thumbnail_url: `${ASSETS}/sample-thumb.jpg`,
          image_url: `${ASSETS}/sample-image.jpg`,
          footer: { text: "ci.example.com", icon_url: `${ASSETS}/sample-icon.png` },
          timestamp: "2026-09-15T07:42:00Z",
        },
      ],
    },
  },
  {
    id: "fields",
    label: "Lots of fields",
    payload: {
      display_name: "Nightly report",
      cards: [
        {
          title: "Nightly build, 15 September",
          url: "https://example.com/builds/nightly",
          color: 5793266,
          fields: [
            { name: "Linux", value: "passed", inline: true },
            { name: "macOS", value: "passed", inline: true },
            { name: "Windows", value: "passed", inline: true },
            { name: "Android", value: "passed", inline: true },
            { name: "iOS", value: "1 flaky test", inline: true },
            { name: "Web", value: "passed", inline: true },
            { name: "Tests", value: "4,812 run, 0 failed, 1 retried" },
            { name: "Slowest", value: "`voice-reconnect` at 48 s" },
          ],
          footer: { text: "Built from main" },
          timestamp: "2026-09-15T03:00:00Z",
        },
      ],
    },
  },
  {
    id: "alert",
    label: "Alert",
    payload: {
      text: "The API is down.",
      display_name: "Uptime",
      cards: [
        {
          author: { name: "status.example.com", url: "https://example.com/status" },
          title: "api.example.com is not responding",
          url: "https://example.com/status/api",
          description: "3 checks in a row failed from 2 regions.",
          color: "#e5484d",
          fields: [
            { name: "Status", value: "503", inline: true },
            { name: "Down for", value: "4 minutes", inline: true },
            { name: "Last healthy", value: "07:38 UTC", inline: true },
          ],
          footer: { text: "Checked every 60 s" },
          timestamp: "2026-09-15T07:42:00Z",
        },
      ],
    },
  },
];

export const PLACEHOLDER_WEBHOOK_URL = "https://gryt.example.com/api/webhooks/WEBHOOK_ID/TOKEN";
