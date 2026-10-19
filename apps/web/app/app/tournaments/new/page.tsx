import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeader } from '@/components/app/page-header';
import { RoundForm } from '@/features/rounds/round-form';

export async function generateMetadata() {
  return { title: (await getTranslations('app.tournaments'))('create') };
}

export default async function NewTournamentPage() {
  const t = await getTranslations('app.tournaments');
  return (
    <>
      <PageHeader eyebrow={t('title')} title={t('newTitle')} description={t('newDescription')} />
      <Suspense>
        <RoundForm kind="tournament" />
      </Suspense>
    </>
  );
}
