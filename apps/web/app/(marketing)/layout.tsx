import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
