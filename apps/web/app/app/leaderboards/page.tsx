'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PageHeader } from '@/components/app/page-header';
import { Badge, EmptyState, ErrorState, Loading, Section } from '@/components/app/states';
import { LeaderboardTable } from '@/components/golf/leaderboard-table';
import { useTournament, useTournaments } from '@/features/tournaments/hooks';

function Board({ id }: { id: string }) {
  const tc = useTranslations('common');
  const q = useTournament(id);
  if (q.isPending) return <Loading rows={2} />;
  if (q.isError) return <ErrorState error={q.error} />;
  const tm = q.data;
  return (
    <article className="flex flex-col gap-4 rounded-md border border-line p-5 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/app/tournaments/${tm.id}`} className="heading text-xl hover:underline">{tm.name}</Link>
        <Badge tone={tm.status === 'LIVE' ? 'live' : 'muted'}>{tc(`tournamentStatus.${tm.status}`)}</Badge>
      </header>
      {tm.round.format !== 'MATCH_PLAY' && (
        <LeaderboardTable rows={tm.round.leaderboard} format={tm.round.format} holesCount={tm.round.holesCount} highlightId={tm.round.myParticipantId} />
      )}
    </article>
  );
}

export default function LeaderboardsPage() {
  const t = useTranslations('app.leaderboards');
  const tc = useTranslations('common.status');
  const q = useTournaments();
  const boards = q.data?.filter((x) => x.status !== 'CANCELLED').slice(0, 6) ?? [];

  return (
    <>
      <PageHeader title={t('title')} description={t('description')} />
      <div className="flex flex-col gap-12">
        <Section title={t('tournaments')}>
          {q.isPending ? (
            <Loading />
          ) : q.isError ? (
            <ErrorState error={q.error} onRetry={q.refetch} />
          ) : boards.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {boards.map((b) => <Board key={b.id} id={b.id} />)}
            </div>
          ) : (
            <EmptyState title={t('emptyTitle')} body={t('emptyBody')} />
          )}
        </Section>
        <Section title={t('season')}>
          <div className="flex items-center justify-between gap-4 rounded-md border border-dashed border-line-strong px-6 py-6">
            <p className="text-sm text-muted">{t('seasonBody')}</p>
            <span className="eyebrow shrink-0 text-muted">{tc('upcoming')}</span>
          </div>
        </Section>
      </div>
    </>
  );
}
