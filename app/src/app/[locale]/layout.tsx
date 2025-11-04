import Script from 'next/script';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {locales} from '@/i18n';
import {unstable_setRequestLocale} from 'next-intl/server';

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen" data-locale={locale}>
          <Header />
          <main className="flex-grow container mx-auto px-4">
            {children}
          </main>
          <Footer />
        </div>
      </AuthProvider>
      <Script
        async
        type="text/javascript"
        src="//t1.daumcdn.net/kas/static/ba.min.js"
      />
    </NextIntlClientProvider>
  );
}
