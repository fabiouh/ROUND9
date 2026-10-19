'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function EmptyState({ title, body, action, className }: { title: ReactNode; body?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-md border border-dashed border-line-strong px-6 py-10', className)}>
      <p className="heading text-xl">{title}</p>
      {body && <p className="max-w-md text-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations('common');
  const notFound = error instanceof ApiError && (error.status === 404 || error.status === 403);
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-md border border-danger/30 bg-danger/5 px-6 py-8">
      {notFound && <p className="heading text-xl">{t('errors.notFoundTitle')}</p>}
      <p className="text-sm">{notFound ? t('errors.notFound') : t('errors.generic')}</p>
      {onRetry && !notFound && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          {t('actions.retry')}
        </Button>
      )}
    </div>
  );
}

export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-md bg-ink/[0.05]" />
      ))}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'live' | 'muted' }) {
  return (
    <span
      className={cn(
        'eyebrow inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        tone === 'live' && 'bg-lime text-forest',
        tone === 'neutral' && 'bg-forest text-cream',
        tone === 'muted' && 'border border-line-strong text-muted',
      )}
    >
      {tone === 'live' && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-forest" />}
      {children}
    </span>
  );
}

export function Section({ title, action, children, className }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
