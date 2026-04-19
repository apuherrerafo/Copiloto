import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Copiloto Metabólico',
  description: 'Tu protocolo metabólico personal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Copiloto',
  },
};

export const viewport: Viewport = {
  themeColor: '#5B7A65',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <main className="min-h-screen pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
