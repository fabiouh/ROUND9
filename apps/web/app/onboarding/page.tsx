import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Wordmark } from '@/components/wordmark';
import { OnboardingFlow } from '@/features/onboarding/onboarding-flow';
import { getMe } from '@/lib/server-api';

export async function generateMetadata() {
  return { title: (await getTranslations('onboarding'))('meta') };
}

export default async function OnboardingPage() {
  const me = await getMe();
  if (!me) redirect('/login?returnTo=/onboarding');
  if (me.onboardingCompleted) redirect('/app');

  return (
    <div className="min-h-svh bg-cream">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-4 py-6 sm:px-8">
        <Wordmark />
        <LocaleSwitcher />
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-8">
        <OnboardingFlow initial={me} />
      </main>
    </div>
  );
}
