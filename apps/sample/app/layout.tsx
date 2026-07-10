import type { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: '@rchemist/listgrid — sample',
  description:
    'Embedded sample site (apps/sample) — living integration demo + alpha demo vehicle. P1 scaffold: home + mock rcm backend + package-load-proof page.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
