'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@round9/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Input, Select } from '@/components/ui/field';
import { useUpdateMe } from '@/hooks/use-me';
import { useValidationMessage } from '@/hooks/use-validation';
import { ApiError } from '@/lib/api';
import { COUNTRIES, countryName } from '@/lib/countries';
import type { Me } from '@/lib/types';

type In = z.input<typeof profileSchema>;
type Out = z.output<typeof profileSchema>;

export function ProfileForm({ me, submitLabel, extra, onSaved }: { me: Me; submitLabel: string; extra?: Partial<Me>; onSaved?: () => void }) {
  const t = useTranslations('app.profileForm');
  const tc = useTranslations('common.actions');
  const tv = useValidationMessage();
  const locale = useLocale();
  const update = useUpdateMe();
  const form = useForm<In, unknown, Out>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: me.displayName ?? '',
      username: me.username ?? '',
      country: me.country ?? '',
      avatarUrl: me.avatarUrl ?? '',
    },
  });
  const { errors, isSubmitting, isSubmitSuccessful } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ ...values, avatarUrl: values.avatarUrl || null, ...extra });
      onSaved?.();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) form.setError('username', { message: 'usernameTaken' });
      else form.setError('root', { message: 'generic' });
    }
  });

  const aria = (name: keyof In) => ({ 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-error` : `${name}-hint` });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field id="displayName" label={t('displayName')} error={tv(errors.displayName?.message)}>
        <Input id="displayName" autoComplete="nickname" {...aria('displayName')} {...form.register('displayName')} />
      </Field>
      <Field id="username" label={t('username')} hint={t('usernameHint')} error={tv(errors.username?.message)}>
        <Input id="username" autoComplete="username" autoCapitalize="none" spellCheck={false} {...aria('username')} {...form.register('username')} />
      </Field>
      <Field id="country" label={t('country')} error={tv(errors.country?.message)}>
        <Select id="country" {...aria('country')} {...form.register('country')}>
          <option value="">{t('countryPlaceholder')}</option>
          {COUNTRIES.map((c) => ({ c, name: countryName(c, locale) }))
            .sort((a, b) => a.name.localeCompare(b.name, locale))
            .map(({ c, name }) => (
              <option key={c} value={c}>
                {name}
              </option>
            ))}
        </Select>
      </Field>
      <Field id="avatarUrl" label={t('avatar')} optional={t('optional')} hint={t('avatarHint')} error={tv(errors.avatarUrl?.message)}>
        <Input id="avatarUrl" type="url" inputMode="url" placeholder="https://" {...aria('avatarUrl')} {...form.register('avatarUrl')} />
      </Field>
      {errors.root && <p role="alert" className="text-sm text-danger">{t('error')}</p>}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? tc('saving') : submitLabel}
        </Button>
        {!onSaved && isSubmitSuccessful && !errors.root && <span role="status" className="text-sm text-muted">{tc('saved')}</span>}
      </div>
    </form>
  );
}
