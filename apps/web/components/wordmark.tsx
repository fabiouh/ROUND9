import { cn } from '@/lib/utils';

/** ROUND9 wordmark: the 9 sits in a ball-sized disc. */
export function Wordmark({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'cream' }) {
  return (
    <span className={cn('inline-flex items-center gap-[0.12em] text-[1.15rem] font-semibold tracking-[-0.04em]', className)} aria-label="ROUND9">
      <span aria-hidden>ROUND</span>
      <span
        aria-hidden
        className={cn(
          'num inline-grid size-[1.15em] place-items-center rounded-full text-[0.8em] font-semibold tracking-normal',
          tone === 'cream' ? 'bg-lime text-forest' : 'bg-forest text-lime',
        )}
      >
        9
      </span>
    </span>
  );
}
