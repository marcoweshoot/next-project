// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';
import IubendaScripts from "@/integrations/IubendaScripts";
import ConsentLoaders from "@/integrations/ConsentLoaders";
// Usa la CSS variable così font-sans del tema funziona ovunque
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-montserrat',
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
  other: { 'color-scheme': 'light dark' },
  openGraph: {
    siteName: 'WeShoot',
    type: 'website',
    url: 'https://www.weshoot.it',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
      </head>

      {/* Applica i token del tema subito per evitare bordi bianchi in dark */}
      <body
        className={`${montserrat.variable} min-h-screen bg-background text-foreground font-sans antialiased`}
      >
        <ToastStateProvider>
          <ClientProviders>
          <IubendaScripts />
          <ConsentLoaders />
          <div suppressHydrationWarning>
          {children}
          </div>
          </ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}