import type { Metadata } from 'next';
import './globals.css';
import { Montserrat } from 'next/font/google';
import ClientProviders from '@/components/providers/ClientProviders';
import { ToastStateProvider } from '@/components/ui/toast-provider';
import { Toaster } from '@/components/ui/toaster';
// import IubendaScripts from "@/integrations/IubendaScripts";
// import ConsentLoaders from "@/integrations/ConsentLoaders";
// import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import Script from 'next/script';

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
        {/* Viewport per mobile responsiveness - accessibile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Preconnect solo alle origini davvero critiche per la home */}
        <link rel="preconnect" href="https://s3.eu-west-1.amazonaws.com" crossOrigin="" />
        <link rel="preconnect" href="https://wxoodcdxscxazjkoqhsg.supabase.co" crossOrigin="" />
        
        {/* Permissions Policy per abilitare i pagamenti */}
        <meta httpEquiv="Permissions-Policy" content="payment=(*), camera=(), microphone=(), geolocation=()" />
        
        {/* <FacebookPixel /> */}
        {/* <IubendaScripts /> */}
        {/* <ConsentLoaders /> */}
        <Script id="fb-pixel-temp" strategy="beforeInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display:'none'}} 
               src={\`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL}&ev=PageView&noscript=1\`}/>
        </noscript>
      </head>

      {/* Applica i token del tema subito per evitare bordi bianchi in dark */}
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <ToastStateProvider>
          <ClientProviders>
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