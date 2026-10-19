import { useTranslations } from 'next-intl';
import type { Hole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScoreMark } from './score-mark';

export interface ScorecardPlayer {
  id: string;
  name: string;
  strokes: Record<number, number | null | undefined>;
}

/** Read-only scorecard grid. Splits 18 holes into Out / In like a printed card. */
export function Scorecard({ holes, players, className }: { holes: Hole[]; players: ScorecardPlayer[]; className?: string }) {
  const t = useTranslations('common.scorecard');
  const nines = holes.length > 9 ? [holes.slice(0, 9), holes.slice(9)] : [holes];
  const sum = (hs: Hole[], f: (h: Hole) => number | null | undefined) =>
    hs.reduce<number | null>((s, h) => {
      const v = f(h);
      return s === null || v == null ? null : s + v;
    }, 0);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {nines.map((nine, i) => (
        <div key={i} className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-center text-sm">
            <caption className="sr-only">{t('caption')}</caption>
            <thead>
              <tr className="bg-forest text-cream">
                <th scope="col" className="eyebrow w-28 py-2 pl-3 text-left font-medium">{t('hole')}</th>
                {nine.map((h) => (
                  <th key={h.holeNumber} scope="col" className="num py-2 font-medium">{h.holeNumber}</th>
                ))}
                <th scope="col" className="eyebrow bg-deep px-2 font-medium">{nines.length > 1 ? (i === 0 ? t('out') : t('in')) : t('total')}</th>
              </tr>
              <tr className="border-b border-line text-muted">
                <th scope="row" className="eyebrow py-1.5 pl-3 text-left font-medium">{t('par')}</th>
                {nine.map((h) => <td key={h.holeNumber} className="num py-1.5">{h.par}</td>)}
                <td className="num py-1.5">{sum(nine, (h) => h.par)}</td>
              </tr>
              <tr className="border-b border-line text-muted/80">
                <th scope="row" className="eyebrow py-1.5 pl-3 text-left font-medium">{t('strokeIndex')}</th>
                {nine.map((h) => <td key={h.holeNumber} className="num py-1.5 text-xs">{h.strokeIndex}</td>)}
                <td />
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <th scope="row" className="max-w-28 truncate py-1.5 pl-3 text-left font-medium">{p.name}</th>
                  {nine.map((h) => (
                    <td key={h.holeNumber} className="py-1">
                      <ScoreMark strokes={p.strokes[h.holeNumber]} par={h.par} />
                    </td>
                  ))}
                  <td className="num py-1.5 font-semibold">{sum(nine, (h) => p.strokes[h.holeNumber]) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
