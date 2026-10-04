import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Angren Ixtisoslashtirilgan Maktabi | House System • Astra vs Terra',
  description:
    'Angren ixtisoslashtirilgan maktabining rasmiy House tizimi platformasi. Astra va Terra guruhlari o‘rtasidagi musobaqalar, ballar jadvali va o‘quvchilar yutuqlari.',
  keywords: ['Angren Ixtisoslashtirilgan Maktabi', 'House System', 'Astra House', 'Terra House', 'Leaderboard', 'Competitions'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body>
        <Providers>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
