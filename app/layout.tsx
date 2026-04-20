import type { Metadata, Viewport } from 'next';
import { getServerSession } from 'next-auth';
import { Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});
import AppShell from '@/components/layout/AppShell';
import PWARecovery from '@/components/layout/PWARecovery';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider';
import SyncOnLogin from '@/components/sync/SyncOnLogin';
import { authOptions } from '@/lib/auth.config';
import { APP_NAME, APP_TAGLINE } from '@/lib/brand';

/** Cookies/sesión vía getServerSession requieren render dinámico (evita fallo "Dynamic server usage" y pantalla en blanco). */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
};

export const viewport: Viewport = {
  themeColor: '#5B7A65',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  /** Necesario para que env(safe-area-inset-*) funcione bien en iPhone / PWA. */
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /** Sesión inicial en servidor; nunca undefined para que SessionProvider no quede en "loading". */
  const session = (await getServerSession(authOptions)) ?? null;

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <PWARecovery />
        <AuthSessionProvider session={session}>
          <SyncOnLogin />
          <AppShell>
            <main className="min-h-screen pb-20 pt-[env(safe-area-inset-top,0px)]">{children}</main>
          </AppShell>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
