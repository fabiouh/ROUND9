import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.meta');
  return {
    title: { default: t('title'), template: '%s · ROUND9' },
    description: t('description'),
    metadataBase: new URL(process.env.APP_BASE_URL ?? 'http://localhost:3000'),
  };
}

export const viewport: Viewport = { themeColor: '#112B22' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
