'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/wordmark';
import { api, ApiError } from '@/lib/api';
import type { InvitationPreview } from '@/lib/types';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations('app.invitePage');
  const format = useFormatter();
  const router = useRouter();
  const preview = useQuery({ queryKey: ['invite', token], queryFn: () => api.post<InvitationPreview>('/invitations/preview', { token }), retry: false });
  const accept = useMutation({
    mutationFn: () => api.post<{ type: 'crew' | 'round' | 'tournament'; id: string }>('/invitations/accept', { token }),
    onSuccess: ({ type, id }) => router.replace(`/app/${type}s/${id}`),
  });

  const status = (preview.error ?? accept.error) instanceof ApiError ? ((preview.error ?? accept.error) as ApiError).status : null;
  const problem = status === 410 ? t('used') : status === 403 ? t('wrongEmail') : status === 409 ? t('full') : preview.isError || accept.isError ? t('invalid') : null;

  return (
    <div className="flex min-h-svh flex-col bg-cream px-4 py-6 sm:px-8">
      <Link href="/app" className="self-start rounded-sm">
        <Wordmark />
      </Link>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 py-16">
        {preview.isPending ? (
          <p aria-busy className="text-muted">{t('loading')}</p>
        ) : problem ? (
          <>
            <h1 className="display text-5xl">{t('problemTitle')}</h1>
            <p role="alert" className="text-lg text-muted">{problem}</p>
            <Button asChild className="self-start">
              <Link href="/app">{t('toApp')}</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="eyebrow text-muted">{t(`type.${preview.data!.type}`)}</p>
            <h1 className="display text-[clamp(2.6rem,7vw,4.5rem)]">{preview.data!.name}</h1>
            <p className="text-lg text-muted">
              {preview.data!.invitedBy ? t('invitedBy', { name: preview.data!.invitedBy }) : t('invited')}
              {preview.data!.scheduledAt && ` · ${format.dateTime(new Date(preview.data!.scheduledAt), { dateStyle: 'full', timeStyle: 'short' })}`}
            </p>
            <Button size="lg" variant="accent" className="self-start" disabled={accept.isPending} onClick={() => accept.mutate()}>
              {t('accept')}
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
