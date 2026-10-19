'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AVAILABLE_FORMATS, FREE_PLAN, roundSchema, tournamentSchema } from '@round9/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { CoursePicker } from '@/features/courses/course-picker';
import { useCrews } from '@/features/crews/hooks';
import { useValidationMessage } from '@/hooks/use-validation';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { cn } from '@/lib/utils';

// One form for rounds and tournaments; tournaments add name, description and a player limit.
const schema = z.union([roundSchema, tournamentSchema]);
type Values = {
  title?: string;
  name?: string;
  description?: string;
  maxParticipants?: number | string;
  courseId: string;
  teeId?: string;
  crewId?: string;
  scheduledAt: string;
  holesCount: number | string;
  format: (typeof AVAILABLE_FORMATS)[number];
};

function defaultStart() {
  const d = new Date(Date.now() + 864e5);
  d.setHours(9, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
}

export function RoundForm({ kind }: { kind: 'round' | 'tournament' }) {
  const t = useTranslations('app.roundForm');
  const tc = useTranslations('common');
  const tv = useValidationMessage();
  const router = useRouter();
  const params = useSearchParams();
  const crews = useCrews();
  const isTournament = kind === 'tournament';

  const form = useForm<Values>({
    resolver: zodResolver(isTournament ? tournamentSchema : roundSchema) as never,
    defaultValues: {
      ...(isTournament ? { name: '', description: '', maxParticipants: FREE_PLAN.limits.maxTournamentPlayers } : { title: '' }),
      courseId: '',
      teeId: '',
      crewId: params.get('crew') ?? '',
      scheduledAt: defaultStart(),
      holesCount: 18,
      format: 'STABLEFORD',
    },
  });
  const { errors, isSubmitting } = form.formState;
  const courseId = useWatch({ control: form.control, name: 'courseId' });
  const holesCount = Number(useWatch({ control: form.control, name: 'holesCount' }));
  const format = useWatch({ control: form.control, name: 'format' });
  const course = useQuery({ queryKey: ['course', courseId], queryFn: () => api.get<Course>(`/courses/${courseId}`), enabled: !!courseId });
  const maxHoles = course.data?.holes.length ?? 18;

  const create = useMutation({ mutationFn: (body: unknown) => api.post<{ id: string }>(isTournament ? '/tournaments' : '/rounds', body) });

  const onSubmit = form.handleSubmit(async (raw) => {
    const v = raw as z.output<typeof schema>;
    try {
      const created = await create.mutateAsync({
        ...v,
        teeId: v.teeId || undefined,
        crewId: v.crewId || undefined,
        description: 'description' in v ? v.description || undefined : undefined,
        scheduledAt: new Date(v.scheduledAt).toISOString(),
      });
      router.push(`/app/${isTournament ? 'tournaments' : 'rounds'}/${created.id}`);
    } catch {
      form.setError('root', { message: 'generic' });
    }
  });

  const err = (k: keyof Values) => tv(errors[k]?.message as string | undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        {isTournament ? (
          <>
            <Field id="name" label={t('tournamentName')} error={err('name')}>
              <Input id="name" placeholder={t('tournamentPlaceholder')} aria-invalid={!!errors.name} {...form.register('name')} />
            </Field>
            <Field id="description" label={t('description')} optional={t('optional')} error={err('description')}>
              <Textarea id="description" {...form.register('description')} />
            </Field>
          </>
        ) : (
          <Field id="title" label={t('title')} error={err('title')}>
            <Input id="title" placeholder={t('titlePlaceholder')} aria-invalid={!!errors.title} {...form.register('title')} />
          </Field>
        )}

        <Field id="course" label={t('course')} error={err('courseId')}>
          <Controller
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <CoursePicker
                id="course"
                value={field.value || null}
                invalid={!!errors.courseId}
                onChange={(c) => {
                  field.onChange(c?.id ?? '');
                  form.setValue('teeId', '');
                  if (c && c._count.holes < 18) form.setValue('holesCount', 9);
                }}
              />
            )}
          />
        </Field>

        {course.data && course.data.tees.length > 0 && (
          <Field id="teeId" label={t('tee')} hint={t('teeHint')}>
            <Select id="teeId" {...form.register('teeId')}>
              <option value="">{t('noTee')}</option>
              {course.data.tees.map((tee) => (
                <option key={tee.id} value={tee.id}>
                  {tee.name} · CR {tee.courseRating} · Slope {tee.slopeRating}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field id="scheduledAt" label={t('teeTime')} error={err('scheduledAt')}>
          <Input id="scheduledAt" type="datetime-local" className="num" {...form.register('scheduledAt')} />
        </Field>
      </div>

      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t('holes')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {[9, 18].map((n) => (
              <label
                key={n}
                className={cn(
                  'flex cursor-pointer items-center justify-center rounded-md border py-3 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/30',
                  holesCount === n ? 'border-forest bg-forest text-cream' : 'border-line-strong hover:border-ink',
                  n > maxHoles && 'pointer-events-none opacity-40',
                )}
              >
                <input type="radio" value={n} disabled={n > maxHoles} className="sr-only" {...form.register('holesCount')} />
                {tc('holes', { count: n })}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t('format')}</legend>
          {AVAILABLE_FORMATS.map((f) => (
            <label
              key={f}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/30',
                format === f ? 'border-forest bg-cream' : 'border-line-strong hover:border-ink',
              )}
            >
              <input type="radio" value={f} className="mt-1 accent-[var(--forest)]" {...form.register('format')} />
              <span>
                <span className="block font-medium">{tc(`formats.${f}`)}</span>
                <span className="text-sm text-muted">{t(`formatHint.${f}`)}</span>
              </span>
            </label>
          ))}
          <div className="flex items-center justify-between rounded-md border border-dashed border-line-strong p-4 text-muted">
            <span>{tc('formats.MATCH_PLAY')}</span>
            <span className="eyebrow">{tc('status.upcoming')}</span>
          </div>
        </fieldset>

        {isTournament && (
          <Field id="maxParticipants" label={t('maxPlayers')} hint={t('maxPlayersHint', { max: FREE_PLAN.limits.maxTournamentPlayers })} error={err('maxParticipants')}>
            <Input id="maxParticipants" type="number" min={2} max={FREE_PLAN.limits.maxTournamentPlayers} className="num max-w-32" {...form.register('maxParticipants')} />
          </Field>
        )}

        {!!crews.data?.length && (
          <Field id="crewId" label={t('crew')} optional={t('optional')} hint={t('crewHint')}>
            <Select id="crewId" {...form.register('crewId')}>
              <option value="">{t('noCrew')}</option>
              {crews.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-6 lg:col-span-2">
        {errors.root && <p role="alert" className="text-sm text-danger">{tc('errors.generic')}</p>}
        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? tc('actions.saving') : isTournament ? t('createTournament') : t('createRound')}
          </Button>
          <Button type="button" size="lg" variant="ghost" onClick={() => router.back()}>
            {tc('actions.cancel')}
          </Button>
        </div>
      </div>
    </form>
  );
}
