'use client';

import { useTranslations } from 'next-intl';

/** Maps shared-schema error keys to localized copy. */
export function useValidationMessage() {
  const t = useTranslations('validation');
  return (message?: string) => {
    if (!message) return undefined;
    return t.has(message as 'required') ? t(message as 'required') : t('required');
  };
}
