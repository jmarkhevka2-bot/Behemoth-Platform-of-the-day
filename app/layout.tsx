import type { Metadata } from 'next';
import { Black_Ops_One, Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import { Analytics } from '@vercel/analytics/next';

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

// Inline script to apply saved theme before first paint (avoids flash)
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('behemoth-theme');
    document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${blackOps.variable} ${inter.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-body antialiased">
        <AppProvider>{children}</AppProvider>
        <Analytics />
      </body>
    </html>
  );
}
