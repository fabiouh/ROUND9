'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Wordmark } from '@/components/wordmark';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/#how', key: 'how' },
  { href: '/#features', key: 'features' },
  { href: '/#tournaments', key: 'tournaments' },
  { href: '/#pricing', key: 'pricing' },
] as const;

/** Transparent over the hero, solid paper once the page scrolls. */
export function SiteHeader({ overHero = true }: { overHero?: boolean }) {
  const t = useTranslations('marketing.nav');
  const tc = useTranslations('common.actions');
  const [solid, setSolid] = useState(!overHero);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,color,border-color] duration-300',
        solid ? 'border-b border-line bg-paper/95 text-ink backdrop-blur' : 'on-forest border-b border-transparent text-cream',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-8">
        <Link href="/" className="rounded-sm">
          <Wordmark tone={solid ? 'ink' : 'cream'} />
        </Link>

        <nav aria-label={t('label')} className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm">
            {LINKS.map((l) => (
              <li key={l.key}>
                <a href={l.href} className="opacity-80 transition-opacity hover:opacity-100">
                  {t(l.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <Link href="/login" className="px-2 text-sm opacity-80 hover:opacity-100">
            {tc('login')}
          </Link>
          <Button asChild size="sm" variant={solid ? 'primary' : 'accent'}>
            <Link href="/signup">{tc('getStarted')}</Link>
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className={cn('lg:hidden', !solid && 'text-cream hover:bg-cream/10')} aria-label={t('openMenu')}>
              <Menu className="size-5" />
            </Button>
          </DialogTrigger>
          <DialogContent side="right" title={<Wordmark />} closeLabel={tc('close')}>
            <nav aria-label={t('label')} className="flex flex-1 flex-col">
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.key} className="border-b border-line">
                    <a href={l.href} onClick={() => setOpen(false)} className="heading block py-4 text-2xl">
                      {t(l.key)}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3">
                <LocaleSwitcher className="self-start" />
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">{tc('login')}</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/signup">{tc('getStarted')}</Link>
                </Button>
              </div>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
