'use client';

import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Participant, RoundDetail } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePutScores } from './hooks';

type Card = Record<number, number | null | undefined>;

const toCard = (p: Participant): Card => Object.fromEntries(p.scores.map((s) => [s.holeNumber, s.strokes]));

/** Hole-by-hole entry for the cards the caller may keep: their own, or everyone's for the organizer. */
export function ScoreEntry({ round }: { round: RoundDetail }) {
  const t = useTranslations('app.scores');
  const tc = useTranslations('common');
  const editable = round.participants.filter((p) => round.canManage || p.id === round.myParticipantId);
  const [playerId, setPlayerId] = useState(round.myParticipantId ?? editable[0]?.id);
  const player = editable.find((p) => p.id === playerId);
  const [card, setCard] = useState<Card>(() => (player ? toCard(player) : {}));
  const [dirty, setDirty] = useState(false);
  const save = usePutScores(round.id);

  // Pick up scores saved elsewhere (another marker) unless there are local edits.
  const serverCard = useMemo(() => (player ? toCard(player) : {}), [player]);
  useEffect(() => {
    if (!dirty) setCard(serverCard);
  }, [serverCard, dirty]);

  if (!editable.length || !player) return null;

  const set = (hole: number, v: number | null | undefined) => {
    setCard((c) => ({ ...c, [hole]: v }));
    setDirty(true);
  };

  const onSave = async () => {
    const scores = Object.entries(card)
      .filter(([, v]) => v !== undefined)
      .map(([h, v]) => ({ holeNumber: Number(h), strokes: v ?? null }));
    await save.mutateAsync({ participantId: player.id, scores });
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {editable.length > 1 && (
        <div role="tablist" aria-label={t('player')} className="flex gap-1 overflow-x-auto">
          {editable.map((p) => (
            <button
              key={p.id}
              role="tab"
              type="button"
              aria-selected={p.id === player.id}
              disabled={dirty && p.id !== player.id}
              onClick={() => {
                setPlayerId(p.id);
                setCard(toCard(p));
              }}
              className={cn(
                'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-40',
                p.id === player.id ? 'border-forest bg-forest text-cream' : 'border-line-strong hover:border-ink',
              )}
            >
              {p.user.displayName ?? p.user.username}
            </button>
          ))}
        </div>
      )}

      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {round.holes.map((h) => {
          const v = card[h.holeNumber];
          return (
            <li key={h.holeNumber} className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2">
              <span className="flex flex-col leading-tight">
                <span className="num text-lg font-medium">{h.holeNumber}</span>
                <span className="text-xs text-muted">
                  {tc('scorecard.par')} {h.par} · {tc('scorecard.strokeIndex')} {h.strokeIndex}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={t('minus', { hole: h.holeNumber })} disabled={!v || v <= 1} onClick={() => set(h.holeNumber, (v ?? h.par) - 1)}>
                  <Minus />
                </Button>
                <button
                  type="button"
                  onClick={() => set(h.holeNumber, v === undefined ? h.par : v)}
                  aria-label={t('strokesOn', { hole: h.holeNumber })}
                  className={cn('num grid h-9 w-10 place-items-center rounded-md text-lg', v === undefined ? 'text-muted/60' : 'bg-cream font-semibold')}
                >
                  {v === undefined ? '·' : v === null ? '–' : v}
                </button>
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={t('plus', { hole: h.holeNumber })} disabled={v != null && v >= 20} onClick={() => set(h.holeNumber, (v ?? h.par - 1) + 1)}>
                  <Plus />
                </Button>
                <button
                  type="button"
                  onClick={() => set(h.holeNumber, null)}
                  className={cn('ml-1 rounded-full px-2 py-1 text-xs', v === null ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5')}
                  aria-pressed={v === null}
                >
                  {t('pickup')}
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-20 z-10 flex items-center gap-4 lg:bottom-4">
        <Button onClick={onSave} disabled={!dirty || save.isPending} size="lg">
          {save.isPending ? tc('actions.saving') : t('save')}
        </Button>
        {save.isError && <span role="alert" className="text-sm text-danger">{tc('errors.generic')}</span>}
        {!dirty && save.isSuccess && <span role="status" className="text-sm text-muted">{tc('actions.saved')}</span>}
      </div>
      <p className="text-xs text-muted">{t('pickupHint')}</p>
    </div>
  );
}
