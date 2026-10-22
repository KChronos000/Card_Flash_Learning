import './globals.css';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';
import { AppShell } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-noto-thai',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FlashLearn TH — Micro-Learning สำหรับ ม.ปลาย',
  icons: '/favicon.ico', 
  description:
    'แอพฝึกการ์ดความจำ (Flashcards) และแบบทดสอบสั้นๆ สำหรับนักเรียนมัธยมปลาย เคมี ฟิสิกส์ ชีววิทยา และคณิตศาสตร์',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoThai.variable} font-sans`}
        style={{
          fontFamily:
            'var(--font-noto-thai), var(--font-inter), system-ui, sans-serif',
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
