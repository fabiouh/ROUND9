import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** A feature line that states honestly whether it ships today. */
export function FeatureLine({ label, available, onForest }: { label: string; available: boolean; onForest?: boolean }) {
  const t = useTranslations('common.status');
  return (
    <li className={cn('flex items-center justify-between gap-4 border-b py-3', onForest ? 'border-cream/15' : 'border-line')}>
      <span className={cn(!available && (onForest ? 'text-cream/55' : 'text-muted'))}>{label}</span>
      <span
        className={cn(
          'eyebrow rounded-full px-2 py-0.5',
          available ? (onForest ? 'bg-lime text-forest' : 'bg-forest text-lime') : onForest ? 'border border-cream/25 text-cream/60' : 'border border-line-strong text-muted',
        )}
      >
        {available ? t('available') : t('upcoming')}
      </span>
    </li>
  );
}
