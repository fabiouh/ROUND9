'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRounds } from '@/features/rounds/hooks';
import { RoundList } from '@/features/rounds/round-list';

function Rounds({ scope }: { scope: 'upcoming' | 'completed' }) {
  const t = useTranslations('app.rounds');
  const q = useRounds(scope);
  if (q.isPending) return <Loading />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;
  if (!q.data.length)
    return (
      <EmptyState
        title={t(`empty.${scope}.title`)}
        body={t(`empty.${scope}.body`)}
        action={
          scope === 'upcoming' && (
            <Button asChild>
              <Link href="/app/rounds/new">{t('create')}</Link>
            </Button>
          )
        }
      />
    );
  return <RoundList rounds={q.data} />;
}

export default function RoundsPage() {
  const t = useTranslations('app.rounds');
  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button asChild>
            <Link href="/app/rounds/new">
              <Plus aria-hidden /> {t('create')}
            </Link>
          </Button>
        }
      />
      <Tabs defaultValue="upcoming" className="flex flex-col gap-6">
        <TabsList>
          <TabsTrigger value="upcoming">{t('upcoming')}</TabsTrigger>
          <TabsTrigger value="completed">{t('completed')}</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <Rounds scope="upcoming" />
        </TabsContent>
        <TabsContent value="completed">
          <Rounds scope="completed" />
        </TabsContent>
      </Tabs>
    </>
  );
}
