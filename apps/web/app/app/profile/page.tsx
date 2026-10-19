'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar } from '@/components/app/avatar';
import { ErrorState, Loading, Section } from '@/components/app/states';
import { Button } from '@/components/ui/button';
import { useRounds } from '@/features/rounds/hooks';
import { RoundList } from '@/features/rounds/round-list';
import { useTournaments } from '@/features/tournaments/hooks';
import { TournamentList } from '@/features/tournaments/tournament-list';
import { useMe } from '@/hooks/use-me';
import { api } from '@/lib/api';
import { countryName } from '@/lib/countries';
import type { Stats } from '@/lib/types';

export default function ProfilePage() {
  const t = useTranslations('app.profile');
  const tc = useTranslations('common');
  const locale = useLocale();
  const me = useMe();
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api.get<Stats>('/users/me/stats') });
  const history = useRounds('completed');
  const tournaments = useTournaments();

  if (me.isPending) return <Loading rows={4} />;
  if (me.isError) return <ErrorState error={me.error} onRetry={me.refetch} />;
  const u = me.data;
  const gp = u.golfProfile;

  const tiles = [
    [t('stats.rounds'), stats.data?.roundsCompleted],
    [t('stats.best'), stats.data?.bestGross18],
    [t('stats.points'), stats.data?.averageStablefordPoints],
    [t('stats.tournaments'), stats.data?.tournaments],
  ] as const;

  return (
    <div className="flex flex-col gap-14">
      <header className="flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-5">
          <Avatar name={u.displayName} src={u.avatarUrl} className="size-20 text-xl" />
          <div>
            <h1 className="display text-[clamp(2.2rem,5vw,3.5rem)]">{u.displayName}</h1>
            <p className="mt-1 text-muted">
              @{u.username}
              {u.country && ` · ${countryName(u.country, locale)}`}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/app/settings">{t('edit')}</Link>
        </Button>
      </header>

      <section aria-label={t('golf')} className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-forest p-5 text-cream">
          <p className="eyebrow text-cream/70">{t('handicap')}</p>
          <p className="num mt-3 text-4xl font-medium">{gp?.handicapIndex ?? '—'}</p>
          <p className="mt-2 text-xs text-cream/60">{t('selfReported')}</p>
        </div>
        {tiles.map(([label, value]) => (
          <div key={label} className="bg-paper p-5">
            <p className="eyebrow text-muted">{label}</p>
            <p className="num mt-3 text-4xl font-medium">{value ?? '—'}</p>
          </div>
        ))}
      </section>

      {(gp?.homeCourse || gp?.preferredFormat || gp?.experienceLevel) && (
        <dl className="grid gap-6 text-sm sm:grid-cols-3">
          {gp.homeCourse && (
            <div><dt className="text-muted">{t('homeCourse')}</dt><dd className="mt-1 font-medium">{gp.homeCourse.name}</dd></div>
          )}
          {gp.preferredFormat && (
            <div><dt className="text-muted">{t('format')}</dt><dd className="mt-1 font-medium">{tc(`formats.${gp.preferredFormat}`)}</dd></div>
          )}
          {gp.experienceLevel && (
            <div><dt className="text-muted">{t('experience')}</dt><dd className="mt-1 font-medium">{tc(`experience.${gp.experienceLevel}`)}</dd></div>
          )}
        </dl>
      )}

      <div className="grid gap-14 lg:grid-cols-2">
        <Section title={t('roundHistory')}>
          {history.isPending ? <Loading rows={2} /> : history.data?.length ? <RoundList rounds={history.data} /> : <p className="text-sm text-muted">{t('noRounds')}</p>}
        </Section>
        <Section title={t('tournamentHistory')}>
          {tournaments.isPending ? <Loading rows={2} /> : tournaments.data?.length ? <TournamentList tournaments={tournaments.data} /> : <p className="text-sm text-muted">{t('noTournaments')}</p>}
        </Section>
      </div>
    </div>
  );
}
