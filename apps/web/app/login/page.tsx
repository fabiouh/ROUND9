import { ArrowRight, ShieldCheck } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthShell, loginHref, safeReturnTo } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  return { title: (await getTranslations('auth.login'))('meta') };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = await getTranslations('auth.login');
  const returnTo = safeReturnTo((await searchParams).returnTo, '/app');
  const locale = await getLocale();

  return (
    <AuthShell>
      <p className="eyebrow mb-4 text-muted">{t('eyebrow')}</p>
      <h1 className="display text-6xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted">{t('body')}</p>
      {/* Plain anchor: the SDK route must not be prefetched. */}
      <Button asChild size="lg" className="mt-10 w-full">
        <a href={loginHref({ returnTo, ui_locales: locale })}>
          {t('continue')} <ArrowRight aria-hidden />
        </a>
      </Button>
      <p className="mt-4 flex gap-2 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('secure')}
      </p>
      <p className="mt-12 border-t border-line pt-6 text-sm">
        {t('noAccount')}{' '}
        <Link href={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="font-medium underline underline-offset-4">
          {t('signup')}
        </Link>
      </p>
    </AuthShell>
  );
}
