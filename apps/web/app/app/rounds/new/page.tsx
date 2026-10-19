import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHeader } from '@/components/app/page-header';
import { RoundForm } from '@/features/rounds/round-form';

export async function generateMetadata() {
  return { title: (await getTranslations('app.rounds'))('create') };
}

export default async function NewRoundPage() {
  const t = await getTranslations('app.rounds');
  return (
    <>
      <PageHeader eyebrow={t('title')} title={t('newTitle')} />
      <Suspense>
        <RoundForm kind="round" />
      </Suspense>
    </>
  );
}
