// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';

// Precarica SOLO i pesi realmente usati above-the-fold (es. 400 e 700)
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
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
  other: { 'color-scheme': 'light dark' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
      </head>
      {/* ✅ Applica direttamente la classe del font: viene usato subito */}
      <body className={`${montserrat.className} antialiased`}>
        <ToastStateProvider>
          <ClientProviders>{children}</ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}
