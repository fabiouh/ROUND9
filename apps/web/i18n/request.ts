import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from './config';
import { loadMessages } from './messages';

const isLocale = (v: string | undefined): v is Locale => LOCALES.includes(v as Locale);

// Locale comes from the user's choice (cookie), then the browser, without URL prefixes.
export default getRequestConfig(async () => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const fromHeader = (await headers()).get('accept-language')?.split(',')[0]?.slice(0, 2).toLowerCase();
  const locale = isLocale(fromCookie) ? fromCookie : isLocale(fromHeader) ? fromHeader : DEFAULT_LOCALE;
  return { locale, messages: await loadMessages(locale), timeZone: 'Europe/Vienna' };
});
