'use client';

import { Flag, House, ListOrdered, LogOut, Settings, Trophy, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Wordmark } from '@/components/wordmark';
import { cn } from '@/lib/utils';
import { Avatar } from './avatar';

const NAV = [
  { href: '/app', key: 'home', icon: House, mobile: true },
  { href: '/app/rounds', key: 'rounds', icon: Flag, mobile: true },
  { href: '/app/tournaments', key: 'tournaments', icon: Trophy, mobile: true },
  { href: '/app/crews', key: 'crews', icon: Users, mobile: true },
  { href: '/app/leaderboards', key: 'leaderboards', icon: ListOrdered, mobile: false },
  { href: '/app/profile', key: 'profile', icon: User, mobile: true },
  { href: '/app/settings', key: 'settings', icon: Settings, mobile: false },
] as const;

export function AppShell({ user, children }: { user: { name: string | null; avatarUrl: string | null }; children: ReactNode }) {
  const t = useTranslations('app.nav');
  const tc = useTranslations('common.actions');
  const pathname = usePathname();
  const active = (href: string) => (href === '/app' ? pathname === '/app' : pathname.startsWith(href));

  return (
    <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[248px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-lime focus:px-4 focus:py-2">
        {t('skip')}
      </a>

      {/* Desktop sidebar */}
      <aside className="on-forest sticky top-0 hidden h-svh flex-col bg-forest p-5 text-cream lg:flex">
        <Link href="/app" className="mb-10 self-start rounded-sm px-2 pt-1">
          <Wordmark tone="cream" />
        </Link>
        <nav aria-label={t('label')} className="flex-1">
          <ul className="flex flex-col gap-0.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active(n.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                    active(n.href) ? 'bg-cream/10 font-medium text-cream' : 'text-cream/65 hover:bg-cream/5 hover:text-cream',
                  )}
                >
                  <n.icon className={cn('size-4', active(n.href) && 'text-lime')} aria-hidden />
                  {t(n.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-4 border-t border-cream/15 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Avatar name={user.name} src={user.avatarUrl} className="size-8" />
            <span className="truncate text-sm">{user.name}</span>
          </div>
          <div className="flex items-center justify-between px-1">
            <LocaleSwitcher />
            <a href="/auth/logout" className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-cream/65 hover:text-cream">
              <LogOut className="size-3.5" aria-hidden /> {tc('logout')}
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 backdrop-blur lg:hidden">
        <Link href="/app" className="rounded-sm">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/app/leaderboards" aria-label={t('leaderboards')} className="rounded-full p-2 hover:bg-ink/5">
            <ListOrdered className="size-5" aria-hidden />
          </Link>
          <Link href="/app/settings" aria-label={t('settings')} className="rounded-full p-2 hover:bg-ink/5">
            <Settings className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-8 lg:pb-16 lg:pt-14">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav aria-label={t('label')} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {NAV.filter((n) => n.mobile).map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active(n.href) ? 'page' : undefined}
                className={cn('flex flex-col items-center gap-1 py-2.5 text-[0.68rem]', active(n.href) ? 'font-medium text-forest' : 'text-muted')}
              >
                <n.icon className="size-5" aria-hidden />
                {t(n.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
