import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const control =
  'w-full rounded-md border border-line-strong bg-paper px-3.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors hover:border-ink/40 focus-visible:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 aria-[invalid=true]:border-danger disabled:opacity-60';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-11', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-24 py-2.5', className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        control,
        'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 fill=%27none%27%3E%3Cpath d=%27M1 1.5l5 5 5-5%27 stroke=%27%23202822%27 stroke-width=%271.5%27/%3E%3C/svg%3E")] bg-[position:right_14px_center] bg-no-repeat pr-10',
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-sm font-medium text-ink', className)} {...props} />;
}

/** Label + control + hint/error, wired for screen readers via ids. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optional && <span className="text-xs text-muted">{optional}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
