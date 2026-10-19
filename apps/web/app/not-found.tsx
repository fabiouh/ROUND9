import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/wordmark';

export default async function NotFound() {
  const t = await getTranslations('common.errors');
  return (
    <main className="flex min-h-svh flex-col bg-cream px-4 py-6 sm:px-8">
      <Link href="/" className="self-start rounded-sm">
        <Wordmark />
      </Link>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6">
        <h1 className="display text-6xl">{t('notFoundTitle')}</h1>
        <p className="text-lg text-muted">{t('notFound')}</p>
        <Button asChild className="self-start">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </main>
  );
}
