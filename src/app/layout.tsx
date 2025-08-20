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
  title: 'viaggi fotografici nel mondo e workshop',
  description:
    'itinerari pensati per fotografi, coach professionisti e esperienze immersive.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <head>
        {/* aiuta a prevenire flicker tra light/dark */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased">
        {/* Provider di stato per i toast (nostro) + UI Toaster (shadcn) */}
        <ToastStateProvider>
          <ClientProviders>{children}</ClientProviders>
          <Toaster />
        </ToastStateProvider>
      </body>
    </html>
  );
}
