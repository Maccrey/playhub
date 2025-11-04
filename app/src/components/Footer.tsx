
'use client';

import AdBanner from './AdBanner';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');
  const adUnitId = process.env.NEXT_PUBLIC_KAKAO_AD_UNIT?.trim();
  const isAdUnitConfigured =
    adUnitId !== undefined &&
    adUnitId !== '' &&
    !adUnitId.toLowerCase().includes('xxxx');

  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        {isAdUnitConfigured && (
          <AdBanner
            data-ad-unit={adUnitId}
            data-ad-width="728"
            data-ad-height="90"
          />
        )}
        <p className="mt-4">{t('copy')}</p>
      </div>
    </footer>
  );
};

export default Footer;
