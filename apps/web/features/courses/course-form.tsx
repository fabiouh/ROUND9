'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema } from '@round9/shared';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { useValidationMessage } from '@/hooks/use-validation';
import { api } from '@/lib/api';
import { COUNTRIES, countryName } from '@/lib/countries';
import type { Course } from '@/lib/types';

type In = z.input<typeof courseSchema>;
type Out = z.output<typeof courseSchema>;

const blankHoles = (n: number) => Array.from({ length: n }, (_, i) => ({ par: 4, strokeIndex: i + 1 }));

export function CourseForm() {
  const t = useTranslations('app.courses');
  const tc = useTranslations('common');
  const tv = useValidationMessage();
  const locale = useLocale();
  const router = useRouter();
  const create = useMutation({ mutationFn: (body: Out) => api.post<Course>('/courses', body) });
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: '', country: '', city: '', holes: blankHoles(18), tees: [{ name: '', courseRating: '', slopeRating: '' }] },
  });
  const holes = useFieldArray({ control: form.control, name: 'holes' });
  const tees = useFieldArray({ control: form.control, name: 'tees' });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await create.mutateAsync(v);
      router.back();
    } catch {
      form.setError('root', { message: 'generic' });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label={t('name')} error={tv(errors.name?.message)} className="sm:col-span-2">
          <Input id="name" aria-invalid={!!errors.name} {...form.register('name')} />
        </Field>
        <Field id="country" label={t('country')} error={tv(errors.country?.message)}>
          <Select id="country" aria-invalid={!!errors.country} {...form.register('country')}>
            <option value="">—</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {countryName(c, locale)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="city" label={t('city')} optional={t('optional')}>
          <Input id="city" {...form.register('city')} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <legend className="heading text-xl">{t('holes')}</legend>
          <div role="group" aria-label={t('holes')} className="flex gap-1">
            {[9, 18].map((n) => (
              <Button key={n} type="button" size="sm" variant={holes.fields.length === n ? 'primary' : 'outline'} onClick={() => holes.replace(blankHoles(n))}>
                {tc('holes', { count: n })}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted">{t('holesHint')}</p>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6 lg:grid-cols-9">
          {holes.fields.map((f, i) => (
            <div key={f.id} className="flex flex-col gap-1 rounded-md border border-line p-2">
              <span className="eyebrow text-muted">{tc('scorecard.hole')} {i + 1}</span>
              <label className="flex items-center justify-between gap-1 text-xs">
                {tc('scorecard.par')}
                <Input type="number" min={3} max={6} className="num h-8 w-14 px-2 text-sm" {...form.register(`holes.${i}.par`)} />
              </label>
              <label className="flex items-center justify-between gap-1 text-xs">
                {tc('scorecard.strokeIndex')}
                <Input type="number" min={1} max={18} className="num h-8 w-14 px-2 text-sm" {...form.register(`holes.${i}.strokeIndex`)} />
              </label>
            </div>
          ))}
        </div>
        {errors.holes?.root?.message && <p role="alert" className="text-sm text-danger">{tv(errors.holes.root.message)}</p>}
        {errors.holes?.message && <p role="alert" className="text-sm text-danger">{tv(errors.holes.message)}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="heading text-xl">{t('tees')}</legend>
        <p className="text-sm text-muted">{t('teesHint')}</p>
        {tees.fields.map((f, i) => (
          <div key={f.id} className="grid items-end gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
            <Field id={`tee-${i}-name`} label={t('teeName')} error={tv(errors.tees?.[i]?.name?.message)}>
              <Input id={`tee-${i}-name`} placeholder={t('teePlaceholder')} {...form.register(`tees.${i}.name`)} />
            </Field>
            <Field id={`tee-${i}-cr`} label={t('courseRating')} error={errors.tees?.[i]?.courseRating && t('ratingRange')}>
              <Input id={`tee-${i}-cr`} inputMode="decimal" className="num" placeholder="71.4" {...form.register(`tees.${i}.courseRating`)} />
            </Field>
            <Field id={`tee-${i}-sr`} label={t('slopeRating')} error={errors.tees?.[i]?.slopeRating && t('slopeRange')}>
              <Input id={`tee-${i}-sr`} inputMode="numeric" className="num" placeholder="128" {...form.register(`tees.${i}.slopeRating`)} />
            </Field>
            <Button type="button" variant="ghost" size="icon" aria-label={t('removeTee')} onClick={() => tees.remove(i)}>
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => tees.append({ name: '', courseRating: '', slopeRating: '' })}>
          <Plus /> {t('addTee')}
        </Button>
      </fieldset>

      {errors.root && <p role="alert" className="text-sm text-danger">{tc('errors.generic')}</p>}
      <div className="flex gap-3 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? tc('actions.saving') : t('create')}
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={() => router.back()}>
          {tc('actions.cancel')}
        </Button>
      </div>
    </form>
  );
}
