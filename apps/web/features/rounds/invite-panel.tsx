'use client';

import { Check, Copy, Link2 } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import type { InvitationLink } from '@/lib/types';
import { useCreateInvite } from './hooks';

/** Creates single-use invite links. The token is shown once; only its hash is stored. */
export function InvitePanel({ base }: { base: string }) {
  const t = useTranslations('app.invite');
  const tc = useTranslations('common.actions');
  const format = useFormatter();
  const create = useCreateInvite(base);
  const [email, setEmail] = useState('');
  const [link, setLink] = useState<InvitationLink | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLink(await create.mutateAsync(email.trim() || undefined));
    setCopied(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Field id={`${base}-email`} label={t('email')} optional={t('optional')} hint={t('emailHint')}>
        <Input id={`${base}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      </Field>
      <Button variant="outline" onClick={generate} disabled={create.isPending} className="self-start">
        <Link2 /> {t('create')}
      </Button>
      {create.isError && <p role="alert" className="text-sm text-danger">{t('failed')}</p>}
      {link && (
        <div className="rounded-md border border-forest/30 bg-cream p-4">
          <p className="num break-all text-sm">{link.url}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted">{t('expires', { date: format.dateTime(new Date(link.expiresAt), { dateStyle: 'medium' }) })}</span>
            <Button
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(link.url);
                setCopied(true);
              }}
            >
              {copied ? <Check /> : <Copy />} {copied ? tc('copied') : tc('copy')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
