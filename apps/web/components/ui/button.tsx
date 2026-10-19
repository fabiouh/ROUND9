import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
  {
    variants: {
      variant: {
        primary: 'bg-forest text-cream hover:bg-deep',
        accent: 'bg-lime text-forest hover:bg-[#d4f78f]',
        outline: 'border border-line-strong text-ink hover:border-ink hover:bg-ink/[0.03]',
        ghost: 'text-ink hover:bg-ink/[0.05]',
        onForest: 'border border-cream/30 text-cream hover:border-cream hover:bg-cream/[0.06]',
        danger: 'bg-danger text-paper hover:bg-danger/90',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-sm',
        md: 'h-11 rounded-full px-5 text-[0.95rem]',
        lg: 'h-14 rounded-full px-7 text-base',
        icon: 'size-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
