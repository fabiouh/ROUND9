import type { Locale } from './config';

const NAMESPACES = ['common', 'marketing', 'auth', 'onboarding', 'app', 'validation', 'legal'] as const;

export async function loadMessages(locale: Locale) {
  const parts = await Promise.all(NAMESPACES.map((ns) => import(`../messages/${locale}/${ns}.json`).then((m) => [ns, m.default])));
  return Object.fromEntries(parts) as Messages;
}

export type Messages = {
  common: typeof import('../messages/en/common.json');
  marketing: typeof import('../messages/en/marketing.json');
  auth: typeof import('../messages/en/auth.json');
  onboarding: typeof import('../messages/en/onboarding.json');
  app: typeof import('../messages/en/app.json');
  validation: typeof import('../messages/en/validation.json');
  legal: typeof import('../messages/en/legal.json');
};
