import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

export async function generateMetadata() {
  return { title: (await getTranslations('auth.error'))('meta') };
}

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ code?: string; error?: string; error_description?: string }> }) {
  const t = await getTranslations('auth.error');
  const sp = await searchParams;
  const raw = sp.error ?? sp.code ?? '';
  // Only known codes map to copy; provider-supplied descriptions are never rendered.
  const code = /^[a-z_]{1,40}$/.test(raw) ? raw : '';
  const message = code === 'access_denied' ? t('access_denied') : sp.error_description?.toLowerCase().includes('verify') ? t('unverified') : t('default');

  return (
    <AuthShell>
      <h1 className="display text-5xl">{t('title')}</h1>
      <p role="alert" className="mt-4 text-lg text-muted">{message}</p>
      {code && <p className="num mt-2 text-xs text-muted">{t('code', { code })}</p>}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/login">{t('retry')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
