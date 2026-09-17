import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppFrame } from '@/features/navigation/components/app-frame';
import { loadFrame } from '@/features/navigation/load-frame';
import { brand } from '@/lib/brand';
import { fontVariables } from '@/lib/fonts';
import '@/styles/tokens.css';

export const metadata: Metadata = {
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const frame = await loadFrame();

  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh">
        <AppFrame frame={frame}>{children}</AppFrame>
        <Toaster />
      </body>
    </html>
  );
}
