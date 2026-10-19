'use client';

import { Dialog as D } from 'radix-ui';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
  title,
  description,
  children,
  closeLabel,
  side,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  closeLabel: string;
  /** Renders as a full-height sheet from the right (mobile navigation). */
  side?: 'right';
  className?: string;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-[2px]" />
      <D.Content
        className={cn(
          'fixed z-50 bg-paper text-ink focus:outline-none',
          side === 'right'
            ? 'inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col p-6'
            : 'left-1/2 top-1/2 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-line p-6',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <D.Title className="heading text-xl">{title}</D.Title>
            {description && <D.Description className="mt-1 text-sm text-muted">{description}</D.Description>}
          </div>
          <D.Close aria-label={closeLabel} className="-m-2 rounded-full p-2 hover:bg-ink/5">
            <X className="size-5" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}
