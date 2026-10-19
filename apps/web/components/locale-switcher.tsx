'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/i18n/actions';
import { LOCALES } from '@/i18n/config';
import { cn } from '@/lib/utils';

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('common.locale');
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label={t('label')} className={cn('inline-flex items-center gap-0.5 text-xs font-medium', className)}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          aria-pressed={l === locale}
          onClick={() => start(async () => { await setLocale(l); router.refresh(); })}
          className={cn('num rounded-full px-2 py-1 uppercase transition-opacity', l === locale ? 'opacity-100' : 'opacity-50 hover:opacity-80')}
        >
          <span className="sr-only">{t(l)}</span>
          <span aria-hidden>{l}</span>
        </button>
      ))}
    </div>
  );
}
