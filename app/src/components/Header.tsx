'use client';

import Image from 'next/image';
import useUserStore from '@/store/userStore';
import { logout } from '@/lib/auth';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link, locales } from '@/navigation';
import { useState } from 'react';

const Header = () => {
  const { user } = useUserStore();
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLocaleChange = (newLocale: typeof locales[number]) => {
    router.replace(pathname, { locale: newLocale });
  };

  const localeNames: { [key: string]: string } = {
    en: 'English',
    ko: '한국어',
    zh: '中文',
    ja: '日本語',
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          {t('title')}
        </Link>
        <nav className="flex items-center">
          <Link href="/" className="mr-4">Home</Link>
          {user ? (
            <>
              <Link href="/profile" className="mr-4">{t('profile')}</Link>
              <span className="mr-4">{user.displayName || 'Guest'}</span>
              <button onClick={logout} className="mr-4">{t('logout')}</button>
            </>
          ) : (
            <Link href="/login">{t('login')}</Link>
          )}
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center focus:outline-none">
              <Image src="/globe.svg" alt="Language" width={20} height={20} className="mr-1" />
              {localeNames[locale]}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button onClick={() => handleLocaleChange('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">English</button>
                <button onClick={() => handleLocaleChange('ko')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">한국어</button>
                <button onClick={() => handleLocaleChange('zh')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">中文</button>
                <button onClick={() => handleLocaleChange('ja')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">日本語</button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;