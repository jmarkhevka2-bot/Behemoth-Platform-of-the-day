import type { Metadata } from 'next';
import { Black_Ops_One, Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';

const blackOps = Black_Ops_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-black-ops',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Disable static pre-rendering — this app requires Supabase env vars at runtime
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Behemoth — Platform of the Day',
  description: 'Crew recognition dashboard for Behemoth ride operations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${blackOps.variable} ${inter.variable} dark`}>
      <body className="font-body antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
