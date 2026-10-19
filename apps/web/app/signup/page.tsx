import { ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthShell, loginHref, safeReturnTo } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  return { title: (await getTranslations('auth.signup'))('meta') };
}

// Social buttons appear only for connections enabled in Auth0, e.g. AUTH0_SOCIAL_CONNECTIONS=google-oauth2,apple
const SOCIAL = { 'google-oauth2': 'google', apple: 'apple' } as const;

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = await getTranslations('auth.signup');
  const locale = await getLocale();
  // New accounts land in /app, which sends incomplete profiles to onboarding first.
  const returnTo = safeReturnTo((await searchParams).returnTo, '/app');
  const enabled = (process.env.AUTH0_SOCIAL_CONNECTIONS ?? '').split(',').map((s) => s.trim()) as (keyof typeof SOCIAL)[];
  const social = enabled.filter((c) => c in SOCIAL);
  const link = (chunks: React.ReactNode, href: string) => (
    <Link href={href} className="underline underline-offset-4">
      {chunks}
    </Link>
  );

  return (
    <AuthShell>
      <p className="eyebrow mb-4 text-muted">{t('eyebrow')}</p>
      <h1 className="display text-6xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted">{t('body')}</p>
      <div className="mt-10 flex flex-col gap-3">
        {social.map((c) => (
          <Button key={c} asChild size="lg" variant="outline">
            <a href={loginHref({ screen_hint: 'signup', connection: c, returnTo, ui_locales: locale })}>{t(SOCIAL[c])}</a>
          </Button>
        ))}
        <Button asChild size="lg">
          <a href={loginHref({ screen_hint: 'signup', returnTo, ui_locales: locale })}>
            {t('email')} <ArrowRight aria-hidden />
          </a>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted">
        {t.rich('legal', { terms: (c) => link(c, '/terms'), privacy: (c) => link(c, '/privacy') })}
      </p>
      <p className="mt-12 border-t border-line pt-6 text-sm">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-medium underline underline-offset-4">
          {t('login')}
        </Link>
      </p>
    </AuthShell>
  );
}
