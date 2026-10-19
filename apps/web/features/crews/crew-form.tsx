'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { crewSchema } from '@round9/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { useValidationMessage } from '@/hooks/use-validation';
import { api } from '@/lib/api';
import type { CrewDetail } from '@/lib/types';

type In = z.input<typeof crewSchema>;
type Out = z.output<typeof crewSchema>;

/** Create a crew, or edit one when `crew` is given. */
export function CrewForm({ crew, onDone }: { crew?: CrewDetail; onDone?: () => void }) {
  const t = useTranslations('app.crews');
  const tc = useTranslations('common');
  const tv = useValidationMessage();
  const router = useRouter();
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: (body: Out) => (crew ? api.patch<{ id: string }>(`/crews/${crew.id}`, body) : api.post<{ id: string }>('/crews', body)),
  });
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(crewSchema),
    defaultValues: { name: crew?.name ?? '', description: crew?.description ?? '', avatarUrl: crew?.avatarUrl ?? '' },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      const saved = await save.mutateAsync({ ...v, avatarUrl: v.avatarUrl || (crew ? null : undefined) } as Out);
      await qc.invalidateQueries({ queryKey: ['crews'] });
      await qc.invalidateQueries({ queryKey: ['crew'] });
      if (onDone) onDone();
      else router.push(`/app/crews/${saved.id}`);
    } catch {
      form.setError('root', { message: 'generic' });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-5">
      <Field id="crew-name" label={t('name')} error={tv(errors.name?.message)}>
        <Input id="crew-name" placeholder={t('namePlaceholder')} aria-invalid={!!errors.name} {...form.register('name')} />
      </Field>
      <Field id="crew-description" label={t('descriptionLabel')} optional={t('optional')} error={tv(errors.description?.message)}>
        <Textarea id="crew-description" {...form.register('description')} />
      </Field>
      <Field id="crew-avatar" label={t('avatar')} optional={t('optional')} hint={t('avatarHint')} error={tv(errors.avatarUrl?.message)}>
        <Input id="crew-avatar" type="url" placeholder="https://" {...form.register('avatarUrl')} />
      </Field>
      <p className="text-sm text-muted">{t('privateNote')}</p>
      {errors.root && <p role="alert" className="text-sm text-danger">{tc('errors.generic')}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc('actions.saving') : crew ? tc('actions.save') : t('create')}
        </Button>
        <Button type="button" variant="ghost" onClick={() => (onDone ? onDone() : router.back())}>
          {tc('actions.cancel')}
        </Button>
      </div>
    </form>
  );
}
