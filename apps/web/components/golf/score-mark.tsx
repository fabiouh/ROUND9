import { cn } from '@/lib/utils';

/**
 * Classic scorecard notation: circles under par, squares over par,
 * doubled for eagle-or-better / double-bogey-or-worse.
 */
export function ScoreMark({ strokes, par, className }: { strokes: number | null | undefined; par: number; className?: string }) {
  if (strokes === undefined) return <span className={cn('num text-muted/50', className)}>·</span>;
  if (strokes === null) return <span className={cn('num text-muted', className)}>–</span>;
  const diff = strokes - par;
  const shape = diff < 0 ? 'rounded-full' : 'rounded-[2px]';
  return (
    <span className={cn('num relative inline-grid size-7 place-items-center text-sm', className)}>
      {diff !== 0 && <span aria-hidden className={cn('absolute inset-0.5 border border-current', shape)} />}
      {Math.abs(diff) >= 2 && <span aria-hidden className={cn('absolute -inset-px border border-current', shape)} />}
      <span className={cn(diff < 0 && 'font-semibold')}>{strokes}</span>
    </span>
  );
}
