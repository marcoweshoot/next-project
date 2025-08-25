// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';
import { headers } from 'next/headers';

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
    'color-scheme': 'light dark', // meglio qui che in <head>
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Nonce passato dal middleware (usalo per eventuali <Script nonce={...}> in futuro)
  const nonce = (await headers()).get('x-nonce') || undefined;

  return (
    <html lang="it" className={montserrat.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect per velocizzare immagini/asset */}
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
        {/* Se/quando userai un CDN tipo cdn.weshoot.it, aggiungi anche: */}
        {/* <link rel="preconnect" href="https://cdn.weshoot.it" crossOrigin="" /> */}
      </head>
      <body className="font-sans antialiased" data-nonce={nonce}>
        <ToastStateProvider>
          <ClientProviders>{children}</ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}
