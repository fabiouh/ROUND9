'use client';

import { useMutation } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { PageHeader } from '@/components/app/page-header';
import { ErrorState, Loading } from '@/components/app/states';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { GolfProfileForm } from '@/features/profile/golf-profile-form';
import { ProfileForm } from '@/features/profile/profile-form';
import { useMe, useUpdateMe } from '@/hooks/use-me';
import { api } from '@/lib/api';
import type { Me } from '@/lib/types';

function Block({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-line py-10 lg:grid-cols-[280px_1fr]">
      <div>
        <h2 className="heading text-xl">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

function Toggle({ me, field, label, hint }: { me: Me; field: 'showHandicapToCrews' | 'notifyInvitations' | 'notifyScores'; label: string; hint?: string }) {
  const update = useUpdateMe();
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-0">
      <label htmlFor={field} className="text-sm">
        <span className="block font-medium">{label}</span>
        {hint && <span className="text-muted">{hint}</span>}
      </label>
      <Switch id={field} checked={me[field]} disabled={update.isPending} onCheckedChange={(v) => update.mutate({ [field]: v })} />
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('app.settings');
  const tc = useTranslations('common.actions');
  const me = useMe();
  const [confirmText, setConfirmText] = useState('');
  const del = useMutation({
    mutationFn: () => api.delete('/users/me'),
    // End the Auth0 session too, so the deleted account isn't silently re-created.
    onSuccess: () => (window.location.href = '/auth/logout'),
  });

  if (me.isPending) return <Loading rows={5} />;
  if (me.isError) return <ErrorState error={me.error} onRetry={me.refetch} />;
  const u = me.data;
  const word = t('delete.word');

  return (
    <>
      <PageHeader title={t('title')} />
      <Block title={t('profile')} description={t('profileHint')}>
        <ProfileForm me={u} submitLabel={tc('save')} />
      </Block>
      <Block title={t('golf')} description={t('golfHint')}>
        <GolfProfileForm me={u} submitLabel={tc('save')} />
      </Block>
      <Block title={t('privacy')}>
        <Toggle me={u} field="showHandicapToCrews" label={t('showHandicap')} hint={t('showHandicapHint')} />
        <p className="mt-4 text-sm text-muted">{t('privacyNote')}</p>
      </Block>
      <Block title={t('notifications')} description={t('notificationsHint')}>
        <Toggle me={u} field="notifyInvitations" label={t('notifyInvitations')} />
        <Toggle me={u} field="notifyScores" label={t('notifyScores')} />
      </Block>
      <Block title={t('language')}>
        <LocaleSwitcher className="text-sm" />
      </Block>
      <Block title={t('account')} description={u.email ?? undefined}>
        <div className="flex flex-col items-start gap-6">
          <Button asChild variant="outline">
            <a href="/auth/logout">
              <LogOut aria-hidden /> {tc('logout')}
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger">{t('delete.button')}</Button>
            </DialogTrigger>
            <DialogContent title={t('delete.title')} description={t('delete.body')} closeLabel={tc('close')}>
              <Field id="confirm-delete" label={t('delete.confirm', { word })}>
                <Input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
              </Field>
              {del.isError && <p role="alert" className="mt-3 text-sm text-danger">{t('delete.failed')}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">{tc('cancel')}</Button>
                </DialogClose>
                <Button variant="danger" disabled={confirmText !== word || del.isPending} onClick={() => del.mutate()}>
                  {t('delete.button')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-xs text-muted">{t('delete.note')}</p>
        </div>
      </Block>
    </>
  );
}
