'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { use } from 'react';
import { PageHeader } from '@/components/app/page-header';
import { Badge, ErrorState, Loading } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { RoundBody } from '@/features/rounds/round-detail';
import { useTournament, useUpdateTournament } from '@/features/tournaments/hooks';

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('app.tournaments');
  const tc = useTranslations('common');
  const q = useTournament(id);
  const update = useUpdateTournament(id);

  if (q.isPending) return <Loading rows={5} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  const tm = q.data;
  const open = tm.status === 'UPCOMING' || tm.status === 'LIVE';

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/tournaments">{t('title')}</Link>}
        title={tm.name}
        description={tm.description}
        actions={
          <>
            <Badge tone={tm.status === 'LIVE' ? 'live' : tm.status === 'UPCOMING' ? 'neutral' : 'muted'}>{tc(`tournamentStatus.${tm.status}`)}</Badge>
            {tm.canManage && tm.status === 'UPCOMING' && (
              <Button size="sm" variant="outline" onClick={() => update.mutate({ status: 'LIVE' })}>{t('start')}</Button>
            )}
            {tm.canManage && open && (
              <Button size="sm" onClick={() => confirm(t('completeConfirm')) && update.mutate({ status: 'COMPLETED' })}>{t('complete')}</Button>
            )}
            {tm.canManage && open && (
              <Button size="sm" variant="ghost" onClick={() => confirm(t('cancelConfirm')) && update.mutate({ status: 'CANCELLED' })}>{t('cancel')}</Button>
            )}
          </>
        }
      />
      <RoundBody round={tm.round} base={`/tournaments/${tm.id}`} capacity={tm.maxParticipants} />
    </>
  );
}
