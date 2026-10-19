import { PLANS } from '@round9/shared';
import { ArrowRight, Check, Link2 } from 'lucide-react';
import { getFormatter, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { LeaderboardTable } from '@/components/golf/leaderboard-table';
import { ScoreMark } from '@/components/golf/score-mark';
import { HeroScene } from '@/components/three/HeroScene';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeatureLine } from './availability';
import { DEMO_LEADERBOARD } from './demo-data';
import { PhotoSlot } from './photo-slot';
import { ProductPreview } from './product-preview';
import { Reveal } from './reveal';

const wrap = 'mx-auto w-full max-w-[1320px] px-4 sm:px-8';

export async function Hero() {
  const t = await getTranslations('marketing.hero');
  return (
    <section className="on-forest relative isolate flex h-[100svh] min-h-[640px] max-h-[1100px] flex-col justify-end overflow-hidden bg-forest text-cream">
      <HeroScene label={t('sceneLabel')} />
      {/* Scrim keeps the headline legible over any frame of the scene. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(17_43_34/0.88)_0%,rgb(17_43_34/0.55)_45%,transparent_75%),linear-gradient(0deg,rgb(17_43_34/0.7)_0%,transparent_40%)]" />
      <div className={cn(wrap, 'relative pb-14 pt-32 sm:pb-20')}>
        <p className="eyebrow mb-6 text-lime">{t('eyebrow')}</p>
        <h1 className="display max-w-[12ch] text-[clamp(3.4rem,11vw,10.5rem)]">
          <span className="block">{t('title1')}</span>
          <span className="block">{t('title2')}</span>
          <span className="block">
            {t('title3').replace(/\.$/, '')}
            <span className="text-lime">.</span>
          </span>
        </h1>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-medium">{t('lead')}</p>
            <p className="mt-2 text-[var(--on-forest-muted)]">{t('body')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/signup">
                {t('primary')} <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="onForest" size="lg">
              <a href="#features">{t('secondary')}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function Social() {
  const t = await getTranslations('marketing.social');
  const items = ['organize', 'invite', 'compete', 'remember'] as const;
  return (
    <section id="features" className="scroll-mt-16 bg-cream py-24 sm:py-32">
      <div className={cn(wrap, 'grid gap-12 lg:grid-cols-12')}>
        <Reveal className="lg:col-span-7">
          <PhotoSlot description={t('photo')} className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]" />
        </Reveal>
        <div className="flex flex-col justify-between gap-12 lg:col-span-5 lg:pt-16">
          <Reveal>
            <p className="eyebrow mb-5 text-muted">{t('eyebrow')}</p>
            <h2 className="display text-[clamp(2.8rem,6vw,5.5rem)]">{t('title')}</h2>
            <p className="mt-6 max-w-md text-lg text-muted">{t('body')}</p>
          </Reveal>
          <ul className="border-t border-line-strong">
            {items.map((k) => (
              <li key={k} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-line py-5">
                <h3 className="font-semibold">{t(`items.${k}.title`)}</h3>
                <p className="text-sm text-muted">{t(`items.${k}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export async function HowItWorks() {
  const t = await getTranslations('marketing.how');
  const tc = await getTranslations('common');
  const previews = [
    // 01 — the round form, condensed
    <dl key="create" className="w-full divide-y divide-line rounded-md border border-line bg-paper text-sm">
      {[
        [t('preview.course'), t('preview.courseValue')],
        [t('preview.when'), t('preview.whenValue')],
        [t('preview.format'), tc('formats.STABLEFORD')],
      ].map(([k, v]) => (
        <div key={k} className="flex justify-between px-4 py-3">
          <dt className="text-muted">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>,
    // 02 — the invite link
    <div key="crew" className="w-full rounded-md border border-line bg-paper p-4 text-sm">
      <p className="eyebrow text-muted">{t('preview.inviteLabel')}</p>
      <p className="num mt-2 flex items-center gap-2 truncate">
        <Link2 className="size-4 shrink-0" aria-hidden />
        round9.app/invite/k3Jf…Qx8
      </p>
      <p className="mt-2 text-xs text-muted">{t('preview.inviteNote')}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {['Lena', 'Jonas', 'Mira'].map((n) => (
          <li key={n} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1">
            <Check className="size-3" aria-hidden /> {n}
          </li>
        ))}
      </ul>
    </div>,
    // 03 — a scored hole run
    <div key="play" className="flex w-full items-center justify-between rounded-md border border-line bg-paper p-4">
      {[
        [4, 3],
        [3, 3],
        [5, 6],
        [4, 4],
        [4, 6],
      ].map(([par, s], i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="num text-[0.65rem] text-muted">{i + 10}</span>
          <ScoreMark strokes={s!} par={par!} />
        </div>
      ))}
    </div>,
  ];
  const steps = ['create', 'crew', 'play'] as const;

  return (
    <section id="how" className="scroll-mt-16 bg-paper py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-5 text-muted">{t('eyebrow')}</p>
          <h2 className="heading text-[clamp(2.2rem,4.5vw,4rem)]">{t('title')}</h2>
        </Reveal>
        <ol className="mt-16 border-t border-line-strong">
          {steps.map((k, i) => (
            <li key={k} className="grid items-center gap-6 border-b border-line py-10 md:grid-cols-12 md:gap-10">
              <span aria-hidden className="num text-6xl font-medium tracking-tight text-sage md:col-span-2 md:text-7xl">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="md:col-span-5">
                <h3 className="heading text-2xl sm:text-3xl">{t(`steps.${k}.title`)}</h3>
                <p className="mt-2 max-w-sm text-muted">{t(`steps.${k}.body`)}</p>
              </div>
              <div className="md:col-span-5">{previews[i]}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function Tournaments() {
  const t = await getTranslations('marketing.tournaments');
  const tc = await getTranslations('common.status');
  const features = [
    ['create', true],
    ['invite', true],
    ['live', true],
    ['leaderboards', true],
    ['stableford', true],
    ['stroke', true],
    ['flights', false],
    ['match', false],
  ] as const;

  return (
    <section id="tournaments" className="on-forest scroll-mt-16 bg-forest py-24 text-cream sm:py-32">
      <div className={cn(wrap, 'grid gap-16 lg:grid-cols-12')}>
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-5 text-lime">{t('eyebrow')}</p>
            <h2 className="display text-[clamp(2.6rem,5.5vw,5rem)]">{t('title')}</h2>
            <p className="mt-6 max-w-md text-[var(--on-forest-muted)]">{t('body')}</p>
          </Reveal>
          <ul className="mt-12 border-t border-cream/25">
            {features.map(([k, available]) => (
              <FeatureLine key={k} label={t(`features.${k}`)} available={available} onForest />
            ))}
          </ul>
        </div>
        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="rounded-md bg-paper p-5 text-ink sm:p-8">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <p className="heading text-xl">{t('board')}</p>
              <p className="eyebrow text-muted">{tc('demoData')}</p>
            </div>
            <LeaderboardTable rows={DEMO_LEADERBOARD} format="STABLEFORD" holesCount={18} highlightId="Lena" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export async function Crew() {
  const t = await getTranslations('marketing.crew');
  const features = [
    ['private', true],
    ['invites', true],
    ['shared', true],
    ['standings', false],
    ['rivalries', false],
  ] as const;
  return (
    <section className="bg-cream py-24 sm:py-32">
      <div className={cn(wrap, 'grid items-end gap-12 lg:grid-cols-12')}>
        <div className="order-2 lg:order-1 lg:col-span-5">
          <Reveal>
            <p className="eyebrow mb-5 text-muted">{t('eyebrow')}</p>
            <h2 className="display text-[clamp(2.6rem,5.5vw,5rem)]">{t('title')}</h2>
            <p className="mt-6 max-w-md text-lg text-muted">{t('body')}</p>
          </Reveal>
          <ul className="mt-10 border-t border-line-strong">
            {features.map(([k, available]) => (
              <FeatureLine key={k} label={t(`features.${k}`)} available={available} />
            ))}
          </ul>
        </div>
        <Reveal className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
          <PhotoSlot description={t('photo')} className="aspect-[4/3] lg:aspect-[5/6]" />
        </Reveal>
      </div>
    </section>
  );
}

export async function Preview() {
  const t = await getTranslations('marketing.preview');
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-12 max-w-3xl">
          <p className="eyebrow mb-5 text-muted">{t('eyebrow')}</p>
          <h2 className="heading text-[clamp(2.2rem,4.5vw,4rem)]">{t('title')}</h2>
        </Reveal>
        <ProductPreview />
      </div>
    </section>
  );
}

export async function Pricing() {
  const t = await getTranslations('marketing.pricing');
  const format = await getFormatter();

  return (
    <section id="pricing" className="scroll-mt-16 bg-cream py-24 sm:py-32">
      <div className={wrap}>
        <Reveal className="mb-14 max-w-3xl">
          <p className="eyebrow mb-5 text-muted">{t('eyebrow')}</p>
          <h2 className="heading text-[clamp(2.2rem,4.5vw,4rem)]">{t('title')}</h2>
        </Reveal>
        <div className="grid border-y border-line-strong lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const featured = plan.available;
            return (
              <article
                key={plan.id}
                className={cn(
                  'flex flex-col gap-8 p-6 sm:p-8',
                  featured ? 'on-forest bg-forest text-cream' : 'bg-transparent',
                  i > 0 && 'border-t border-line lg:border-l lg:border-t-0',
                )}
              >
                <header>
                  <h3 className="eyebrow">{t(`plans.${plan.id}`)}</h3>
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="num text-5xl font-medium tracking-tight">
                      {format.number(plan.priceCents / 100, { style: 'currency', currency: plan.currency, minimumFractionDigits: plan.priceCents ? 2 : 0 })}
                    </span>
                    {plan.interval && <span className={featured ? 'text-cream/70' : 'text-muted'}>{t(`interval.${plan.interval}`)}</span>}
                  </p>
                </header>
                <ul className="flex flex-1 flex-col gap-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className={cn('mt-0.5 size-4 shrink-0', featured ? 'text-lime' : 'text-muted')} aria-hidden />
                      {t(`features.${f}` as 'features.unlimitedRounds')}
                    </li>
                  ))}
                </ul>
                {plan.available ? (
                  <Button asChild variant="accent" size="lg">
                    <Link href="/signup">{t('cta')}</Link>
                  </Button>
                ) : (
                  <span className="eyebrow inline-flex h-14 items-center justify-center rounded-full border border-line-strong text-muted">{t('soon')}</span>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted">{t('note')}</p>
      </div>
    </section>
  );
}

export async function FinalCta() {
  const t = await getTranslations('marketing.cta');
  return (
    <section className="on-forest bg-forest text-cream">
      <div className={cn(wrap, 'flex flex-col gap-10 py-24 sm:py-36 md:flex-row md:items-end md:justify-between')}>
        <h2 className="display max-w-[14ch] text-[clamp(3rem,8vw,7.5rem)]">{t('title')}</h2>
        <div className="flex flex-col items-start gap-6">
          <p className="text-lg text-[var(--on-forest-muted)]">{t('body')}</p>
          <Button asChild variant="accent" size="lg">
            <Link href="/signup">
              {t('button')} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
