'use client';

import { Mermaid as FumadocsMermaid } from 'fumadocs-mermaid/ui';
import type { ComponentProps } from 'react';

const grytThemeConfig = JSON.stringify({
  theme: 'dark',
  config: JSON.stringify({
    themeVariables: {
      darkMode: true,
      background: '#111318',
      primaryColor: '#968ff8',
      primaryTextColor: '#e0e0e6',
      primaryBorderColor: '#968ff8',
      lineColor: '#2b303d',
      secondaryColor: '#1e2028',
      tertiaryColor: '#1a1d24',
      fontFamily: 'inherit',
      fontSize: '14px',
      nodeBorder: '#968ff8',
      nodeTextColor: '#e0e0e6',
      mainBkg: '#1e2028',
      clusterBkg: '#111318',
      clusterBorder: '#2b303d',
      edgeLabelBackground: '#111318',
      signalColor: '#e0e0e6',
      actorBorder: '#968ff8',
      actorBkg: '#1e2028',
      actorTextColor: '#e0e0e6',
    },
  }),
});

export function Mermaid(props: ComponentProps<typeof FumadocsMermaid>) {
  return (
    <FumadocsMermaid
      {...props}
      config={props.config ?? grytThemeConfig}
      theme="dark"
    />
  );
}
