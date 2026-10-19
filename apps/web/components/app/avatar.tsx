import { cn } from '@/lib/utils';

export function Avatar({ name, src, className }: { name: string | null; src?: string | null; className?: string }) {
  const initials = (name ?? '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- user-supplied avatar hosts are arbitrary
    <img src={src} alt="" className={cn('size-10 shrink-0 rounded-full object-cover', className)} />
  ) : (
    <span aria-hidden className={cn('num grid size-10 shrink-0 place-items-center rounded-full bg-sage/60 text-sm font-medium text-forest', className)}>
      {initials}
    </span>
  );
}
