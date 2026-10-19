'use client';

import { ChevronRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar } from '@/components/app/avatar';
import { PageHeader } from '@/components/app/page-header';
import { EmptyState, ErrorState, Loading } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/features/crews/hooks';

export default function CrewsPage() {
  const t = useTranslations('app.crews');
  const tc = useTranslations('common');
  const q = useCrews();
  const create = (
    <Button asChild>
      <Link href="/app/crews/new">
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
      ) : !q.data.length ? (
        <EmptyState title={t('emptyTitle')} body={t('emptyBody')} action={create} />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {q.data.map((c) => (
            <li key={c.id}>
              <Link href={`/app/crews/${c.id}`} className="group flex items-center gap-4 py-4">
                <Avatar name={c.name} src={c.avatarUrl} className="size-12" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold group-hover:underline">{c.name}</span>
                  <span className="text-sm text-muted">
                    {[tc('members', { count: c._count.members }), tc(`roles.${c.myRole}`)].join(' · ')}
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
