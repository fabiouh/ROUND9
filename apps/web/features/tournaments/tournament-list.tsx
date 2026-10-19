'use client';

import { ChevronRight } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge } from '@/components/app/states';
import type { TournamentSummary } from '@/lib/types';

export function TournamentList({ tournaments, hrefSuffix = '' }: { tournaments: TournamentSummary[]; hrefSuffix?: string }) {
  const tc = useTranslations('common');
  const format = useFormatter();
  return (
    <ul className="divide-y divide-line border-y border-line">
      {tournaments.map((tm) => (
        <li key={tm.id}>
          <Link href={`/app/tournaments/${tm.id}${hrefSuffix}`} className="group flex items-center gap-4 py-4">
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate font-semibold group-hover:underline">{tm.name}</span>
                <Badge tone={tm.status === 'LIVE' ? 'live' : tm.status === 'UPCOMING' ? 'neutral' : 'muted'}>{tc(`tournamentStatus.${tm.status}`)}</Badge>
              </span>
              <span className="mt-1 block truncate text-sm text-muted">
                {[
                  format.dateTime(new Date(tm.round.scheduledAt), { dateStyle: 'medium' }),
                  tm.round.course.name,
                  tc(`formats.${tm.round.format}`),
                  `${tm.round._count.participants}/${tm.maxParticipants}`,
                ].join(' · ')}
              </span>
            </span>
            <ChevronRight className="size-4 text-muted" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
