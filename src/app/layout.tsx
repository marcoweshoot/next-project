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
    'color-scheme': 'light dark',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect opzionali (non rendono dinamico) */}
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
        {/* Se usi un CDN: <link rel="preconnect" href="https://cdn.weshoot.it" crossOrigin="" /> */}
      </head>
      <body className="font-sans antialiased">
        <ToastStateProvider>
          <ClientProviders>{children}</ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}
