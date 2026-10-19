import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';
import { getMe } from '@/lib/server-api';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await getMe();
  if (!me) redirect('/login?returnTo=/app');
  // First login (or an unfinished profile) always lands in onboarding.
  if (!me.onboardingCompleted) redirect('/onboarding');
  return <AppShell user={{ name: me.displayName ?? me.username, avatarUrl: me.avatarUrl }}>{children}</AppShell>;
}
