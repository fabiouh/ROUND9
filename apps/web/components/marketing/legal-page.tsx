import { getTranslations } from 'next-intl/server';
import { SiteHeader } from './site-header';

type LegalKey = 'privacy' | 'terms' | 'imprint' | 'contact';

export async function legalMetadata(page: LegalKey) {
  const t = await getTranslations('legal');
  return { title: t(`${page}.title`) };
}

export async function LegalPage({ page }: { page: LegalKey }) {
  const t = await getTranslations('legal');
  const sections = t.raw(`${page}.sections`) as { id: string; title: string; body: string }[];
  return (
    <>
      <SiteHeader overHero={false} />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-8">
        <h1 className="display text-[clamp(2.8rem,7vw,5rem)]">{t(`${page}.title`)}</h1>
        <p className="mt-6 rounded-md border border-line-strong bg-cream p-4 text-sm">{t('draft')}</p>
        <div className="mt-12 flex flex-col gap-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="heading text-2xl">{s.title}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
