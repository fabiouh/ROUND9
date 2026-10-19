import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { PhotoSlot } from '@/components/marketing/photo-slot';
import { Wordmark } from '@/components/wordmark';

export async function AuthShell({ children }: { children: ReactNode }) {
  const t = await getTranslations('auth');
  const brand = await getTranslations('common.brand');
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="on-forest relative hidden flex-col justify-between bg-forest p-10 text-cream lg:flex">
        <Link href="/" className="self-start rounded-sm">
          <Wordmark tone="cream" />
        </Link>
        <PhotoSlot tone="forest" description={t('photo')} className="my-10 flex-1" />
        <p className="display text-5xl">{brand('tagline')}</p>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="rounded-sm lg:invisible">
            <Wordmark />
          </Link>
          <LocaleSwitcher />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">{children}</div>
      </main>
    </div>
  );
}

/** Only same-origin paths are accepted as post-login destinations. */
export function safeReturnTo(value: string | string[] | undefined, fallback: string) {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.startsWith('/') && !v.startsWith('//') ? v : fallback;
}

export function loginHref(params: Record<string, string>) {
  return `/auth/login?${new URLSearchParams(params).toString()}`;
}
