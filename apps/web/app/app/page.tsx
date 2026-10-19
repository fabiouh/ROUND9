'use client';

import { ArrowRight, Flag, Plus, Trophy, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar } from '@/components/app/avatar';
import { EmptyState, ErrorState, Loading, Section } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/features/crews/hooks';
import { useRounds } from '@/features/rounds/hooks';
import { RoundList } from '@/features/rounds/round-list';
import { useTournaments } from '@/features/tournaments/hooks';
import { TournamentList } from '@/features/tournaments/tournament-list';
import { useMe } from '@/hooks/use-me';

function greetingKey() {
  const h = new Date().getHours();
  return h < 11 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export default function DashboardPage() {
  const t = useTranslations('app.dashboard');
  const tc = useTranslations('common');
  const me = useMe();
  const upcoming = useRounds('upcoming');
  const completed = useRounds('completed');
  const tournaments = useTournaments();
  const crews = useCrews();
  const active = tournaments.data?.filter((x) => x.status === 'UPCOMING' || x.status === 'LIVE') ?? [];
  const recent = completed.data?.filter((r) => r.status === 'COMPLETED').slice(0, 4) ?? [];
  const firstCrew = crews.data?.[0];

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-8 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="display text-[clamp(2.6rem,6vw,4.75rem)]">
          {t(`greeting.${greetingKey()}`, { name: me.data?.displayName?.split(' ')[0] ?? me.data?.username ?? '' })}
        </h1>
        <nav aria-label={t('quickActions')} className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/app/rounds/new">
              <Plus aria-hidden /> {t('createRound')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/tournaments/new">
              <Trophy aria-hidden /> {t('createTournament')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={firstCrew ? `/app/crews/${firstCrew.id}` : '/app/crews/new'}>
              <UserPlus aria-hidden /> {t('invite')}
            </Link>
          </Button>
        </nav>
      </header>

      <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-14">
          <Section
            title={t('upcoming')}
            action={<Link href="/app/rounds" className="text-sm underline-offset-4 hover:underline">{t('all')}</Link>}
          >
            {upcoming.isPending ? (
              <Loading rows={2} />
            ) : upcoming.isError ? (
              <ErrorState error={upcoming.error} onRetry={upcoming.refetch} />
            ) : upcoming.data.length ? (
              <RoundList rounds={upcoming.data.slice(0, 4)} />
            ) : (
              <EmptyState
                title={t('noUpcoming')}
                body={t('noUpcomingBody')}
                action={
                  <Button asChild size="sm">
                    <Link href="/app/rounds/new">
                      <Flag aria-hidden /> {t('createRound')}
                    </Link>
                  </Button>
                }
              />
            )}
          </Section>

          <Section title={t('activeTournaments')}>
            {tournaments.isPending ? (
              <Loading rows={1} />
            ) : active.length ? (
              <TournamentList tournaments={active} />
            ) : (
              <p className="text-sm text-muted">{t('noTournaments')}</p>
            )}
          </Section>
        </div>

        <div className="flex flex-col gap-14">
          <Section title={t('recentScores')}>
            {completed.isPending ? (
              <Loading rows={2} />
            ) : recent.length ? (
              <ul className="divide-y divide-line border-y border-line">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link href={`/app/rounds/${r.id}`} className="flex items-center justify-between gap-4 py-3 hover:underline">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="text-xs text-muted">{r.course.name} · {tc('holes', { count: r.holesCount })}</span>
                      </span>
                      <span className="num text-2xl font-medium">{r.myStrokes ?? '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t('noScores')}</p>
            )}
          </Section>

          <Section title={t('crews')} action={<Link href="/app/crews" className="text-sm underline-offset-4 hover:underline">{t('all')}</Link>}>
            {crews.isPending ? (
              <Loading rows={1} />
            ) : crews.data?.length ? (
              <ul className="flex flex-col">
                {crews.data.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link href={`/app/crews/${c.id}`} className="group flex items-center gap-3 border-b border-line py-3">
                      <Avatar name={c.name} src={c.avatarUrl} className="size-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium group-hover:underline">{c.name}</span>
                        <span className="text-xs text-muted">
                          {tc('members', { count: c._count.members })} · {t('crewRounds', { count: c._count.rounds })}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={t('noCrews')}
                body={t('noCrewsBody')}
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/app/crews/new">{t('startCrew')}</Link>
                  </Button>
                }
              />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
