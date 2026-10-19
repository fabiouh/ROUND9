'use client';

import { UserMinus, UserPlus } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Avatar } from '@/components/app/avatar';
import { Section } from '@/components/app/states';
import { LeaderboardTable } from '@/components/golf/leaderboard-table';
import { Scorecard } from '@/components/golf/scorecard';
import { Button } from '@/components/ui/button';
import { useCrew } from '@/features/crews/hooks';
import type { RoundDetail } from '@/lib/types';
import { useAddParticipant, useRemoveParticipant, useUpdateRound } from './hooks';
import { InvitePanel } from './invite-panel';
import { ScoreEntry } from './score-entry';

/**
 * Everything below a round's header. Tournaments reuse it with their own
 * participant/invite endpoints (`base`), since a tournament is played as one round.
 */
export function RoundBody({ round, base, capacity }: { round: RoundDetail; base: string; capacity?: number }) {
  const t = useTranslations('app.round');
  const tc = useTranslations('common');
  const format = useFormatter();
  const open = round.status === 'SCHEDULED' || round.status === 'IN_PROGRESS';
  const full = capacity !== undefined && round.participants.length >= capacity;
  const remove = useRemoveParticipant(round.id);
  const update = useUpdateRound(round.id);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-12">
        <Section title={t('leaderboard')}>
          {round.format === 'MATCH_PLAY' ? (
            <p className="text-sm text-muted">{t('matchPlayUnavailable')}</p>
          ) : (
            <LeaderboardTable rows={round.leaderboard} format={round.format} holesCount={round.holesCount} highlightId={round.myParticipantId} />
          )}
          {round.tee === null && <p className="text-xs text-muted">{t('grossOnly')}</p>}
        </Section>

        {open && (round.myParticipantId !== null || round.canManage) ? (
          <Section title={t('enterScores')}>
            <ScoreEntry round={round} />
          </Section>
        ) : null}

        <Section title={t('scorecard')}>
          <Scorecard
            holes={round.holes}
            players={round.participants.map((p) => ({
              id: p.id,
              name: p.user.displayName ?? p.user.username ?? '—',
              strokes: Object.fromEntries(p.scores.map((s) => [s.holeNumber, s.strokes])),
            }))}
          />
        </Section>
      </div>

      <aside className="flex flex-col gap-10">
        <dl className="divide-y divide-line border-y border-line text-sm">
          {[
            [t('when'), format.dateTime(new Date(round.scheduledAt), { dateStyle: 'full', timeStyle: 'short' })],
            [t('course'), round.course.name],
            [t('tee'), round.tee ? `${round.tee.name} · CR ${round.tee.courseRating} / ${round.tee.slopeRating}` : t('noTee')],
            [t('format'), `${tc(`formats.${round.format}`)} · ${tc('holes', { count: round.holesCount })}`],
            [t('organizer'), round.creator.displayName ?? round.creator.username ?? '—'],
            ...(round.crew ? [[t('crew'), round.crew.name]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <Section title={`${t('players')} · ${round.participants.length}${capacity ? ` / ${capacity}` : ''}`}>
          <ul className="flex flex-col">
            {round.participants.map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-b border-line py-2.5">
                <Avatar name={p.user.displayName} src={p.user.avatarUrl} className="size-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.user.displayName ?? p.user.username}</span>
                  <span className="text-xs text-muted">{p.playingHandicap === null ? t('noHandicap') : t('playingHandicap', { value: p.playingHandicap })}</span>
                </span>
                {open && (round.canManage || p.id === round.myParticipantId) && p.userId !== round.creatorId && (
                  <Button variant="ghost" size="icon" className="size-8" aria-label={t('remove', { name: p.user.displayName ?? '' })} onClick={() => remove.mutate(p.id)}>
                    <UserMinus />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Section>

        {round.canManage && open && (
          <>
            {round.crew && !full && <AddFromCrew crewId={round.crew.id} base={base} exclude={round.participants.map((p) => p.userId)} />}
            {!full ? (
              <Section title={t('invite')}>
                <InvitePanel base={base} />
              </Section>
            ) : (
              <p className="text-sm text-muted">{t('full')}</p>
            )}
          </>
        )}

        {round.canManage && !round.tournament && (
          <Section title={t('manage')}>
            <div className="flex flex-wrap gap-2">
              {round.status === 'SCHEDULED' && (
                <Button size="sm" variant="outline" onClick={() => update.mutate({ status: 'IN_PROGRESS' })}>{t('start')}</Button>
              )}
              {open && (
                <Button size="sm" onClick={() => update.mutate({ status: 'COMPLETED' })}>{t('complete')}</Button>
              )}
              {open && (
                <Button size="sm" variant="ghost" onClick={() => confirm(t('cancelConfirm')) && update.mutate({ status: 'CANCELLED' })}>
                  {t('cancel')}
                </Button>
              )}
            </div>
          </Section>
        )}
      </aside>
    </div>
  );
}

function AddFromCrew({ crewId, base, exclude }: { crewId: string; base: string; exclude: string[] }) {
  const t = useTranslations('app.round');
  const crew = useCrew(crewId);
  const add = useAddParticipant(base);
  const candidates = crew.data?.members.filter((m) => !exclude.includes(m.userId)) ?? [];
  if (!candidates.length) return null;
  return (
    <Section title={t('addFromCrew', { crew: crew.data!.name })}>
      <ul className="flex flex-col">
        {candidates.map((m) => (
          <li key={m.id} className="flex items-center gap-3 border-b border-line py-2">
            <Avatar name={m.user.displayName} src={m.user.avatarUrl} className="size-8" />
            <span className="flex-1 truncate text-sm">{m.user.displayName ?? m.user.username}</span>
            <Button size="sm" variant="outline" disabled={add.isPending} onClick={() => add.mutate(m.userId)}>
              <UserPlus /> {t('add')}
            </Button>
          </li>
        ))}
      </ul>
      {add.isError && <p role="alert" className="text-sm text-danger">{t('addFailed')}</p>}
    </Section>
  );
}
