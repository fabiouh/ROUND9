'use client';

import { Switch as S } from 'radix-ui';
import type { ComponentProps } from 'react';

export function Switch(props: ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-cream transition-colors data-[state=checked]:border-forest data-[state=checked]:bg-forest"
      {...props}
    >
      <S.Thumb className="block size-4 translate-x-1 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-lime" />
    </S.Root>
  );
}
