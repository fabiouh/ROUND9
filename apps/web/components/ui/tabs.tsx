'use client';

import { Tabs as T } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Tabs = T.Root;
export const TabsContent = T.Content;

export function TabsList({ className, ...props }: ComponentProps<typeof T.List>) {
  return <T.List className={cn('flex gap-1 overflow-x-auto border-b border-line', className)} {...props} />;
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof T.Trigger>) {
  return (
    <T.Trigger
      className={cn(
        '-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink data-[state=active]:border-forest data-[state=active]:text-ink',
        className,
      )}
      {...props}
    />
  );
}
