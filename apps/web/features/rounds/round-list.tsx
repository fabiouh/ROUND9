'use client';

import { ChevronRight } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/app/states';
import type { RoundSummary } from '@/lib/types';

export function RoundRow({ round, href }: { round: Omit<RoundSummary, 'crew'>; href?: string }) {
  const tc = useTranslations('common');
  const format = useFormatter();
  const d = new Date(round.scheduledAt);
  return (
    <li>
      <Link href={href ?? `/app/rounds/${round.id}`} className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[80px_1fr_auto]">
        <span className="flex flex-col items-start leading-none">
          <span className="num text-3xl font-medium tracking-tight">{format.dateTime(d, { day: '2-digit' })}</span>
          <span className="eyebrow mt-1 text-muted">{format.dateTime(d, { month: 'short' })}</span>
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold group-hover:underline">{round.title}</span>
            {round.status === 'IN_PROGRESS' && <Badge tone="live">{tc('roundStatus.IN_PROGRESS')}</Badge>}
            {round.status === 'CANCELLED' && <Badge tone="muted">{tc('roundStatus.CANCELLED')}</Badge>}
          </span>
          <span className="mt-1 block truncate text-sm text-muted">
            {[format.dateTime(d, { weekday: 'short', hour: '2-digit', minute: '2-digit' }), round.course.name, tc(`formats.${round.format}`), tc('holes', { count: round.holesCount })].join(' · ')}
          </span>
        </span>
        <span className="flex items-center gap-2 text-sm text-muted">
          <span className="hidden sm:inline">{tc('players', { count: round._count.participants })}</span>
          <ChevronRight className="size-4" aria-hidden />
        </span>
      </Link>
    </li>
  );
}

export function RoundList({ rounds }: { rounds: Omit<RoundSummary, 'crew'>[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rounds.map((r) => (
        <RoundRow key={r.id} round={r} />
      ))}
    </ul>
  );
}
