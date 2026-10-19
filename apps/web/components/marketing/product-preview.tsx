'use client';

import { CalendarDays, Flag, Plus, Trophy, UserPlus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LeaderboardTable } from '@/components/golf/leaderboard-table';
import { Scorecard } from '@/components/golf/scorecard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEMO_HOLES, DEMO_LEADERBOARD, DEMO_PLAYERS } from './demo-data';

const TABS = ['dashboard', 'round', 'leaderboard', 'crew', 'scorecard'] as const;

/** Previews built from the same components the app renders, filled with fictional demo data. */
export function ProductPreview() {
  const t = useTranslations('marketing');
  const tc = useTranslations('common');

  return (
    <Tabs defaultValue="dashboard" className="flex flex-col gap-6">
      <TabsList>
        {TABS.map((k) => (
          <TabsTrigger key={k} value={k}>
            {t(`preview.tabs.${k}`)}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="relative min-h-[460px] rounded-md border border-line bg-paper p-5 sm:p-8">
        <span className="eyebrow absolute right-4 top-4 text-muted">{tc('status.demoData')}</span>

        <TabsContent value="dashboard" className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="heading text-3xl sm:text-4xl">{t('preview.greeting')}</p>
            <h3 className="eyebrow mb-3 mt-8 text-muted">{t('preview.upcoming')}</h3>
            <ul className="divide-y divide-line border-y border-line">
              {[
                { title: t('how.preview.roundTitle'), meta: `${t('how.preview.whenValue')} · ${tc('formats.STABLEFORD')}`, icon: Flag },
                { title: t('tournaments.board').split(' · ')[0]!, meta: `${tc('formats.STROKE_PLAY')} · ${tc('players', { count: 6 })}`, icon: Trophy },
              ].map((r) => (
                <li key={r.title} className="flex items-center gap-4 py-4">
                  <r.icon className="size-4 text-muted" aria-hidden />
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-muted">{r.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-3 text-muted">{t('preview.quick')}</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: t('preview.createRound'), icon: Plus, primary: true },
                { label: t('preview.createTournament'), icon: Trophy },
                { label: t('preview.invite'), icon: UserPlus },
              ].map((a) => (
                <span
                  key={a.label}
                  className={`flex h-12 items-center gap-3 rounded-full px-5 text-sm font-medium ${a.primary ? 'bg-forest text-cream' : 'border border-line-strong'}`}
                >
                  <a.icon className="size-4" aria-hidden />
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="round" className="max-w-lg">
          <p className="heading text-3xl">{t('how.preview.roundTitle')}</p>
          <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
            {[
              [t('how.preview.course'), t('how.preview.courseValue')],
              [t('how.preview.when'), t('how.preview.whenValue')],
              [t('how.preview.format'), tc('formats.STABLEFORD')],
              [tc('scorecard.hole'), tc('holes', { count: 18 })],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-forest px-6 text-sm font-medium text-cream">
            <CalendarDays className="size-4" aria-hidden />
            {t('preview.createRound')}
          </span>
        </TabsContent>

        <TabsContent value="leaderboard">
          <p className="eyebrow mb-4 text-muted">{t('tournaments.board')}</p>
          <LeaderboardTable rows={DEMO_LEADERBOARD} format="STABLEFORD" holesCount={18} highlightId="Lena" />
        </TabsContent>

        <TabsContent value="crew">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-forest text-lime">
              <Users className="size-6" aria-hidden />
            </span>
            <div>
              <p className="heading text-2xl">{t('preview.crewName')}</p>
              <p className="text-sm text-muted">{t('preview.crewMeta')}</p>
            </div>
          </div>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {DEMO_PLAYERS.map((p, i) => (
              <li key={p.participantId} className="flex items-center justify-between border-b border-line py-3">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-muted">{tc(`roles.${i === 0 ? 'OWNER' : i === 1 ? 'ADMIN' : 'MEMBER'}`)}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="scorecard">
          <Scorecard
            holes={DEMO_HOLES}
            players={DEMO_PLAYERS.slice(0, 4).map((p) => ({ id: p.participantId, name: p.name, strokes: p.strokes }))}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
