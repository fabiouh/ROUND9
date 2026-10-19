'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { useTournaments } from '@/features/tournaments/hooks';
import { TournamentList } from '@/features/tournaments/tournament-list';

export default function TournamentsPage() {
  const t = useTranslations('app.tournaments');
  const q = useTournaments();
  const create = (
    <Button asChild>
      <Link href="/app/tournaments/new">
        <Plus aria-hidden /> {t('create')}
      </Link>
    </Button>
  );
  return (
    <>
      <PageHeader title={t('title')} description={t('description')} actions={create} />
      {q.isPending ? (
        <Loading />
      ) : q.isError ? (
        <ErrorState error={q.error} onRetry={q.refetch} />
      ) : q.data.length ? (
        <TournamentList tournaments={q.data} />
      ) : (
        <EmptyState title={t('emptyTitle')} body={t('emptyBody')} action={create} />
      )}
    </>
  );
}
