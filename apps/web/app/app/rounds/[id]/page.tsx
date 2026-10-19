'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { use } from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Badge, ErrorState, Loading } from '@/components/app/states';
import { useRound } from '@/features/rounds/hooks';
import { RoundBody } from '@/features/rounds/round-detail';

export default function RoundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('app');
  const tc = useTranslations('common');
  const q = useRound(id);

  if (q.isPending) return <Loading rows={5} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  const round = q.data;

  return (
    <>
      <PageHeader
        eyebrow={
          round.tournament ? (
            <Link href={`/app/tournaments/${round.tournament.id}`} className="underline underline-offset-4">
              {round.tournament.name}
            </Link>
          ) : (
            <Link href="/app/rounds">{t('rounds.title')}</Link>
          )
        }
        title={round.title}
        actions={<Badge tone={round.status === 'IN_PROGRESS' ? 'live' : round.status === 'SCHEDULED' ? 'neutral' : 'muted'}>{tc(`roundStatus.${round.status}`)}</Badge>}
      />
      <RoundBody round={round} base={round.tournament ? `/tournaments/${round.tournament.id}` : `/rounds/${round.id}`} />
    </>
  );
}
