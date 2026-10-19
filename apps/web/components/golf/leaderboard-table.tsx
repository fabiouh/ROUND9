import type { LeaderboardRow } from '@round9/shared';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const toPar = (n: number | null) => (n === null ? '—' : n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`);

export function LeaderboardTable({
  rows,
  format,
  holesCount,
  highlightId,
  className,
}: {
  rows: LeaderboardRow[];
  format: 'STROKE_PLAY' | 'STABLEFORD' | 'MATCH_PLAY';
  holesCount: number;
  highlightId?: string | null;
  className?: string;
}) {
  const t = useTranslations('common.leaderboard');
  const stableford = format === 'STABLEFORD';

  return (
    <table className={cn('w-full border-collapse text-sm', className)}>
      <caption className="sr-only">{t('caption')}</caption>
      <thead>
        <tr className="eyebrow border-b border-line-strong text-left text-muted">
          <th scope="col" className="w-12 py-2.5 font-medium">{t('position')}</th>
          <th scope="col" className="py-2.5 font-medium">{t('player')}</th>
          <th scope="col" className="w-14 py-2.5 text-right font-medium">{t('thru')}</th>
          <th scope="col" className="w-16 py-2.5 text-right font-medium">{t('gross')}</th>
          <th scope="col" className="w-20 py-2.5 text-right font-medium">{stableford ? t('points') : t('net')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.participantId} className={cn('border-b border-line', r.participantId === highlightId && 'bg-lime/25')}>
            <td className="num py-3 text-muted">{r.thru ? r.position : '–'}</td>
            <td className="py-3 font-medium">{r.name}</td>
            <td className="num py-3 text-right text-muted">{r.complete ? t('finished') : r.thru ? `${r.thru}/${holesCount}` : '–'}</td>
            <td className="num py-3 text-right">{r.gross ?? '—'}</td>
            <td className="num py-3 text-right text-base font-semibold">{stableford ? (r.points ?? '—') : toPar(r.netToPar)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
