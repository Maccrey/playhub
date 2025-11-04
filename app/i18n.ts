import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'ko', 'ja', 'zh'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  const resolvedLocale = locale ?? defaultLocale;

  if (!locales.includes(resolvedLocale as typeof locales[number])) {
    notFound();
  }

  return {
    locale: resolvedLocale,
    messages: (await import(`./src/messages/${resolvedLocale}.json`)).default
  };
});
