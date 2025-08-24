// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.weshoot.it'),
  title: {
    default: 'WeShoot – Viaggi e corsi di fotografia',
    template: '%s | WeShoot',
  },
  description:
    'Viaggi fotografici e workshop di paesaggio con coach professionisti. Calendario aggiornato, destinazioni e date.',
  robots: { index: true, follow: true },
  other: {
    'color-scheme': 'light dark', // 👈 qui, non nel <head>
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ToastStateProvider>
          <ClientProviders>{children}</ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}
