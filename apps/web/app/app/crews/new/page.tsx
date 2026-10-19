import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/app/page-header';
import { CrewForm } from '@/features/crews/crew-form';

export async function generateMetadata() {
  return { title: (await getTranslations('app.crews'))('create') };
}

export default async function NewCrewPage() {
  const t = await getTranslations('app.crews');
  return (
    <>
      <PageHeader eyebrow={t('title')} title={t('newTitle')} />
      <CrewForm />
    </>
  );
}
