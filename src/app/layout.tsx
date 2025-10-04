import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';
import IubendaScripts from "@/integrations/IubendaScripts";
import ConsentLoaders from "@/integrations/ConsentLoaders";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";

// Usa la CSS variable così font-sans del tema funziona ovunque
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-montserrat',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning className={montserrat.variable}>
      <head>
        {/* Viewport per mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Preconnect solo alle origini davvero critiche per la home */}
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
        
        {/* Permissions Policy per abilitare i pagamenti */}
        <meta httpEquiv="Permissions-Policy" content="payment=(*), camera=(), microphone=(), geolocation=()" />
        
        <FacebookPixel />
      </head>

      {/* Applica i token del tema subito per evitare bordi bianchi in dark */}
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
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