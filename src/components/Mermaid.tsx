'use client';

import { Mermaid as FumadocsMermaid } from 'fumadocs-mermaid/ui';
import { useTheme } from 'next-themes';
import type { ComponentProps } from 'react';

// Hex copies of @gryt/ui's neutral and accent steps; Mermaid derives shades and can't read var().
const palettes = {
  dark: {
    background: '#111318',
    surface: '#1e2028',
    panel: '#1a1d24',
    border: '#2b303d',
    text: '#e0e0e6',
    accent: '#968ff8',
  },
  light: {
    background: '#f1f2f7',
    surface: '#ffffff',
    panel: '#f7f8fb',
    border: '#b6bac7',
    text: '#1f2129',
    accent: '#8179e0',
  },
};

function grytThemeConfig(mode: 'dark' | 'light'): string {
  const p = palettes[mode];
  return JSON.stringify({
    config: JSON.stringify({
      themeVariables: {
        darkMode: mode === 'dark',
        background: p.background,
        primaryColor: p.surface,
        primaryTextColor: p.text,
        primaryBorderColor: p.accent,
        secondaryColor: p.surface,
        tertiaryColor: p.panel,
        lineColor: p.border,
        textColor: p.text,
        fontFamily: 'inherit',
        fontSize: '14px',
        nodeBorder: p.accent,
        nodeTextColor: p.text,
        mainBkg: p.surface,
        clusterBkg: p.background,
        clusterBorder: p.border,
        edgeLabelBackground: p.background,
        signalColor: p.text,
        actorBorder: p.accent,
        actorBkg: p.surface,
        actorTextColor: p.text,
      },
    }),
  });
}

export function Mermaid(props: ComponentProps<typeof FumadocsMermaid>) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === 'light' ? 'light' : 'dark';

  return (
    <FumadocsMermaid
      // A new key re-renders the chart when the page theme flips.
      key={mode}
      {...props}
      config={props.config ?? grytThemeConfig(mode)}
      theme={mode === 'dark' ? 'dark' : 'default'}
    />
  );
}
