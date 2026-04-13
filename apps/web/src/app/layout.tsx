import type { Metadata, Viewport } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tracker',
  description: 'Personal training tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tracker',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background">
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <header className="hidden h-14 items-center justify-end border-b px-6 md:flex">
              <HealthBadge />
            </header>
            <main className="flex-1 p-4 md:p-8">{children}</main>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
