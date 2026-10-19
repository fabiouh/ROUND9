'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { GolfProfileForm } from '@/features/profile/golf-profile-form';
import { ProfileForm } from '@/features/profile/profile-form';
import { useMe, useUpdateMe } from '@/hooks/use-me';
import { api, ApiError } from '@/lib/api';
import type { Me } from '@/lib/types';
import { cn } from '@/lib/utils';

const STEPS = ['welcome', 'profile', 'golf', 'connect', 'ready'] as const;

/** Five steps; progress is stored server-side so a reload or another device resumes where you left off. */
export function OnboardingFlow({ initial }: { initial: Me }) {
  const t = useTranslations('onboarding');
  const { data: me = initial } = useMe();
  const update = useUpdateMe();
  const router = useRouter();
  const [step, setStep] = useState(Math.min(initial.onboardingStep, STEPS.length - 1));

  const go = async (next: number) => {
    await update.mutateAsync({ onboardingStep: next });
    setStep(next);
  };

  const finish = async () => {
    await update.mutateAsync({ onboardingCompleted: true, onboardingStep: STEPS.length - 1 });
    router.replace('/app');
    router.refresh();
  };

  const key = STEPS[step]!;
  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="eyebrow mb-3 text-muted">{t('progress', { step: step + 1, total: STEPS.length })}</p>
        <ol className="grid grid-cols-5 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <li key={s} className={cn('h-1 rounded-full', i <= step ? 'bg-forest' : 'bg-line-strong')} />
          ))}
        </ol>
      </div>

      <div>
        <h1 className="display text-[clamp(2.6rem,6vw,4.25rem)]">{t(`${key}.title`)}</h1>
        <p className="mt-4 max-w-lg text-lg text-muted">{t(`${key}.body`)}</p>
      </div>

      {key === 'welcome' && (
        <Button size="lg" className="self-start" disabled={update.isPending} onClick={() => go(1)}>
          {t('welcome.cta')} <ArrowRight aria-hidden />
        </Button>
      )}
      {key === 'profile' && <ProfileForm me={me} submitLabel={t('next')} extra={{ onboardingStep: 2 }} onSaved={() => setStep(2)} />}
      {key === 'golf' && (
        <GolfProfileForm
          me={me}
          submitLabel={t('next')}
          onSaved={() => go(3)}
          secondary={
            <Button type="button" variant="ghost" onClick={() => go(3)}>
              {t('skip')}
            </Button>
          }
        />
      )}
      {key === 'connect' && <ConnectStep onDone={() => go(4)} />}
      {key === 'ready' && (
        <Button size="lg" variant="accent" className="self-start" disabled={update.isPending} onClick={finish}>
          {t('ready.cta')} <ArrowRight aria-hidden />
        </Button>
      )}

      {step > 1 && key !== 'ready' && (
        <button type="button" className="self-start text-sm text-muted underline underline-offset-4" onClick={() => setStep(step - 1)}>
          {t('back')}
        </button>
      )}
    </div>
  );
}

function ConnectStep({ onDone }: { onDone: () => void }) {
  const t = useTranslations('onboarding.connect');
  const qc = useQueryClient();
  const [crewName, setCrewName] = useState('');
  const [invite, setInvite] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createCrew = useMutation({ mutationFn: () => api.post('/crews', { name: crewName.trim() }) });
  const join = useMutation({
    // Accept a full invite link or a bare token.
    mutationFn: () => api.post('/invitations/accept', { token: invite.trim().split('/invite/').pop()!.split(/[?#]/)[0] }),
  });

  const submit = (m: typeof createCrew | typeof join, valid: boolean) => async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!valid) return setError(t('invalid'));
    try {
      await m.mutateAsync();
      await qc.invalidateQueries({ queryKey: ['crews'] });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError && (err.status === 404 || err.status === 410) ? t('inviteInvalid') : t('failed'));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={submit(createCrew, crewName.trim().length >= 2)} className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="heading text-xl">{t('createTitle')}</h2>
        <Field id="crewName" label={t('crewName')}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="crewName" value={crewName} onChange={(e) => setCrewName(e.target.value)} placeholder={t('crewPlaceholder')} maxLength={60} />
            <Button type="submit" disabled={createCrew.isPending}>{t('create')}</Button>
          </div>
        </Field>
      </form>
      <form onSubmit={submit(join, invite.trim().length >= 20)} className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="heading text-xl">{t('joinTitle')}</h2>
        <Field id="invite" label={t('inviteLabel')}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="invite" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="https://…/invite/…" autoComplete="off" />
            <Button type="submit" variant="outline" disabled={join.isPending}>{t('join')}</Button>
          </div>
        </Field>
      </form>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button variant="ghost" className="self-start" onClick={onDone}>
        {t('skip')}
      </Button>
    </div>
  );
}
