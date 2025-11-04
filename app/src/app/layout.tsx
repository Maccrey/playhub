import type {Metadata} from 'next';
import './[locale]/globals.css';

const normalizedBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH && process.env.NEXT_PUBLIC_BASE_PATH !== '/'
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '';

const withBasePath = (path: string) => `${normalizedBasePath}${path}`;

export const metadata: Metadata = {
  title: 'PlayHub',
  description: 'A hub for mini-games',
  icons: {
    icon: [{url: withBasePath('/icon.png'), sizes: 'any'}],
    shortcut: withBasePath('/icon.png'),
    apple: withBasePath('/icon.png'),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
