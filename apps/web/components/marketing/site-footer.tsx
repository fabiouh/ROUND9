import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Wordmark } from '@/components/wordmark';

export async function SiteFooter() {
  const t = await getTranslations('marketing');
  const columns = [
    {
      title: t('footer.product'),
      links: [
        { href: '/#how', label: t('nav.how') },
        { href: '/#features', label: t('nav.features') },
        { href: '/#tournaments', label: t('nav.tournaments') },
        { href: '/#pricing', label: t('nav.pricing') },
      ],
    },
    { title: t('footer.company'), links: [{ href: '/contact', label: t('footer.contact') }] },
    {
      title: t('footer.legal'),
      links: [
        { href: '/privacy', label: t('footer.privacy') },
        { href: '/terms', label: t('footer.terms') },
        { href: '/imprint', label: t('footer.imprint') },
        { href: '/privacy#cookies', label: t('footer.cookies') },
      ],
    },
  ];

  return (
    <footer className="bg-paper">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <Wordmark className="text-2xl" />
          <p className="max-w-xs text-sm text-muted">{(await getTranslations('common.brand'))('tagline')}</p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h2 className="eyebrow mb-4 text-muted">{c.title}</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1320px] border-t border-line px-4 py-6 text-xs text-muted sm:px-8">
        {t('footer.rights', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
