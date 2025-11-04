import type {Metadata} from 'next';
import './[locale]/globals.css';

export const metadata: Metadata = {
  title: 'PlayHub',
  description: 'A hub for mini-games',
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
