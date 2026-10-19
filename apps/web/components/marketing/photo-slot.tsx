import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Clearly labelled stand-in for licensed photography. Drawn as yardage-book contour lines
 * so the layout reads correctly until real images are supplied.
 */
export function PhotoSlot({ description, className, tone = 'sage' }: { description: string; className?: string; tone?: 'sage' | 'forest' }) {
  const t = useTranslations('common.photo');
  const stroke = tone === 'forest' ? '#c7f279' : '#183b2d';
  return (
    <figure
      className={cn('relative overflow-hidden rounded-md', tone === 'forest' ? 'bg-deep' : 'bg-sage/45', className)}
      role="img"
      aria-label={`${t('placeholder')}: ${description}`}
    >
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 11 }, (_, i) => (
          <ellipse key={i} cx={250} cy={170} rx={30 + i * 26} ry={18 + i * 17} fill="none" stroke={stroke} strokeWidth={0.6} transform={`rotate(${-12 + i * 2} 250 170)`} />
        ))}
      </svg>
      <figcaption className={cn('absolute bottom-0 left-0 right-0 flex gap-2 p-4 text-xs', tone === 'forest' ? 'text-cream/80' : 'text-forest/80')}>
        <span className="eyebrow shrink-0">{t('placeholder')}</span>
        <span className="line-clamp-2">{description}</span>
      </figcaption>
    </figure>
  );
}
