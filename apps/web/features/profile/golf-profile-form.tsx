'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AVAILABLE_FORMATS, EXPERIENCE_LEVELS, golfProfileSchema } from '@round9/shared';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { CoursePicker } from '@/features/courses/course-picker';
import { useUpdateGolfProfile } from '@/hooks/use-me';
import { useValidationMessage } from '@/hooks/use-validation';
import type { Me } from '@/lib/types';

type In = z.input<typeof golfProfileSchema>;
type Out = z.output<typeof golfProfileSchema>;

/** Every field is optional; handicaps are self-reported and never presented as official. */
export function GolfProfileForm({ me, submitLabel, onSaved, secondary }: { me: Me; submitLabel: string; onSaved?: () => void; secondary?: React.ReactNode }) {
  const t = useTranslations('app.golfForm');
  const tc = useTranslations('common');
  const tv = useValidationMessage();
  const update = useUpdateGolfProfile();
  const gp = me.golfProfile;
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(golfProfileSchema),
    defaultValues: {
      handicapIndex: gp?.handicapIndex ?? '',
      preferredFormat: gp?.preferredFormat ?? '',
      experienceLevel: gp?.experienceLevel ?? '',
      homeCourseId: gp?.homeCourseId ?? '',
    },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await update.mutateAsync({
        handicapIndex: v.handicapIndex === '' || v.handicapIndex === undefined ? null : v.handicapIndex,
        preferredFormat: v.preferredFormat || null,
        experienceLevel: v.experienceLevel || null,
        homeCourseId: v.homeCourseId || null,
      });
      onSaved?.();
    } catch {
      form.setError('root', { message: 'generic' });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field id="handicapIndex" label={t('handicap')} optional={t('optional')} hint={t('handicapHint')} error={tv(errors.handicapIndex?.message)}>
        <Input
          id="handicapIndex"
          inputMode="decimal"
          placeholder="18.4"
          className="num max-w-40"
          aria-invalid={!!errors.handicapIndex}
          aria-describedby={errors.handicapIndex ? 'handicapIndex-error' : 'handicapIndex-hint'}
          {...form.register('handicapIndex', { setValueAs: (v: string) => (v === '' ? '' : v.replace(',', '.')) })}
        />
      </Field>
      <Field id="homeCourseId" label={t('homeCourse')} optional={t('optional')}>
        <Controller
          control={form.control}
          name="homeCourseId"
          render={({ field }) => (
            <CoursePicker id="homeCourseId" value={field.value || null} initialName={gp?.homeCourse?.name} onChange={(c) => field.onChange(c?.id ?? '')} />
          )}
        />
      </Field>
      <Field id="preferredFormat" label={t('format')} optional={t('optional')}>
        <Select id="preferredFormat" {...form.register('preferredFormat')}>
          <option value="">{t('noPreference')}</option>
          {AVAILABLE_FORMATS.map((f) => (
            <option key={f} value={f}>
              {tc(`formats.${f}`)}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="experienceLevel" label={t('experience')} optional={t('optional')}>
        <Select id="experienceLevel" {...form.register('experienceLevel')}>
          <option value="">{t('noPreference')}</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>
              {tc(`experience.${l}`)}
            </option>
          ))}
        </Select>
      </Field>
      {errors.root && <p role="alert" className="text-sm text-danger">{tc('errors.generic')}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc('actions.saving') : submitLabel}
        </Button>
        {secondary}
        {!onSaved && isSubmitSuccessful && !errors.root && <span role="status" className="text-sm text-muted">{tc('actions.saved')}</span>}
      </div>
    </form>
  );
}
