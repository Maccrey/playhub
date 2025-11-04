
'use client';

import AdBanner from './AdBanner';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <AdBanner
          data-ad-unit="DAN-xxxxxxx"
          data-ad-width="728"
          data-ad-height="90"
        />
        <p className="mt-4">{t('copy')}</p>
      </div>
    </footer>
  );
};

export default Footer;
