// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'

// In middleware (Edge runtime) niente Buffer: usa Web Crypto.
function makeNonce() {
  // un valore opaco va benissimo; usiamo UUID senza trattini
  return crypto.randomUUID().replace(/-/g, "");
}

export async function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const nonce = makeNonce();

  const csp = [
    "default-src 'self'",
    // niente 'unsafe-inline': consentiamo solo script con nonce (+ strict-dynamic).
    // I domini elencati servono ai browser che non supportano 'strict-dynamic': dove è
    // supportato vengono ignorati e conta solo il nonce, che si propaga agli script
    // iniettati dinamicamente (fbevents.js, gtm.js, gli script figli di Iubenda).
    `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""} 'strict-dynamic' https://cdn.iubenda.com https://connect.facebook.net https://www.facebook.com https://www.googletagmanager.com https://www.google-analytics.com`.trim(),
    // style: tieni 'unsafe-inline' finché non passi a nonce per gli <style> iniettati
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://api.weshoot.it https://s3.eu-west-1.amazonaws.com https://wxoodcdxscxazjkoqhsg.supabase.co https://www.facebook.com https://connect.facebook.net https://cdn.iubenda.com https://www.googletagmanager.com https://www.google-analytics.com ${isDev ? "ws: http://localhost:*" : ""}`.trim(),
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // `upgrade-insecure-requests` è volutamente assente: in una policy Report-Only non ha
    // alcun effetto e Chrome lo segnala come errore una volta per contesto di navigazione,
    // riempiendo di righe rosse la console di produzione. L'upgrade a HTTPS è già garantito
    // dall'header Strict-Transport-Security servito da Vercel sul dominio.
    // RIMETTERLA insieme al passaggio in enforcing (Content-Security-Policy senza -Report-Only).
  ].join("; ");

  // Next.js legge il nonce dall'header Content-Security-Policy della RICHIESTA e lo applica
  // ai propri tag <script>. Impostarlo solo sulla risposta non basta: nessuno script
  // riceverebbe il nonce e, con 'strict-dynamic', il browser bloccherebbe l'intero bundle.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // Passa il nonce all'app (leggibile in un Server Component con headers())
  res.headers.set("x-nonce", nonce);

  // Report-Only: questa CSP non è mai stata applicata davvero, perché il middleware si
  // trovava fuori da src/ e Next.js non lo caricava. Attivarla in enforcing senza prima
  // leggere i report rischia di bloccare script legittimi. Passare a
  // "Content-Security-Policy" solo dopo aver verificato che la console non riporti
  // violazioni su traffico reale.
  res.headers.set("Content-Security-Policy-Report-Only", csp);

  // Gestione parametri di reset password per sicurezza
  if (req.nextUrl.pathname === '/auth/reset-password' || req.nextUrl.pathname === '/auth/reset-password-redirect') {
    const accessToken = req.nextUrl.searchParams.get('access_token');
    const refreshToken = req.nextUrl.searchParams.get('refresh_token');
    const code = req.nextUrl.searchParams.get('code');
    
    // Log che apparirà nei log di Vercel
    console.log('🚨 MIDDLEWARE: Reset password request detected', {
      pathname: req.nextUrl.pathname,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCode: !!code,
      url: req.url,
      fullUrl: req.url,
      searchParams: req.nextUrl.search,
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    // Se ci sono token nella URL (formato vecchio), rimuovili per sicurezza e salvali in cookie
    if (accessToken && refreshToken) {
      console.log('Middleware: Setting cookies for reset tokens (old format)');
      const url = new URL(req.url);
      url.searchParams.delete('access_token');
      url.searchParams.delete('refresh_token');
      
      // Imposta cookie sicuri per i token (non httpOnly per permettere lettura JS)
      res.cookies.set('reset_access_token', accessToken, {
        httpOnly: false, // Permette a JavaScript di leggerli
        secure: !isDev,
        sameSite: 'lax',
        maxAge: 300, // 5 minuti
        path: '/auth/reset-password'
      });
      
      res.cookies.set('reset_refresh_token', refreshToken, {
        httpOnly: false, // Permette a JavaScript di leggerli
        secure: !isDev,
        sameSite: 'lax',
        maxAge: 300, // 5 minuti
        path: '/auth/reset-password'
      });
      
      // Redirect alla stessa pagina senza parametri URL
      return NextResponse.redirect(url);
    } 
    // Se c'è un code (formato nuovo), rimuovilo per sicurezza e salvalo in cookie
    else if (code) {
      console.log('Middleware: Setting cookie for reset code (new format)');
      const url = new URL(req.url);
      url.searchParams.delete('code');
      
      // Imposta cookie sicuro per il code (non httpOnly per permettere lettura JS)
      res.cookies.set('reset_code', code, {
        httpOnly: false, // Permette a JavaScript di leggerlo
        secure: !isDev,
        sameSite: 'lax',
        maxAge: 300, // 5 minuti
        path: '/auth/reset-password'
      });
      
      // Redirect alla stessa pagina senza parametri URL
      return NextResponse.redirect(url);
            } else {
              console.log('🚨 MIDDLEWARE: No reset tokens or code found in URL - this is the problem!', {
                url: req.url,
                searchParams: req.nextUrl.search,
                allParams: Object.fromEntries(req.nextUrl.searchParams.entries())
              });
            }
  }

  // Gestione autenticazione Supabase
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            res.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    await supabase.auth.getSession()
  } catch (error) {
    console.error('Middleware Supabase error:', error)
  }

  // Proteggi le route admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              res.cookies.set(name, value, options)
            },
            remove(name: string, options: any) {
              res.cookies.set(name, '', { ...options, maxAge: 0 })
            },
          },
        }
      )
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }

      // Verifica se l'utente è admin usando la funzione RPC.
      // Se la RPC fallisce NON si redirige: l'autorizzazione autorevole è già in
      // src/app/admin/layout.tsx (e in ogni pagina sotto /admin), che legge user_roles e
      // fa redirect da Server Component. Bloccare qui su un errore della RPC
      // chiuderebbe fuori gli admin senza aggiungere protezione.
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id })

      if (error) {
        console.error('Middleware: RPC is_admin non disponibile, delego il controllo al layout admin', error)
      } else if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch (error) {
      console.error('Admin middleware error:', error)
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res;
}

// middleware.ts (in fondo)
export const config = {
  matcher: [
    // Escludi: API routes, _next static files, immagini, favicon, robots.txt, sitemap
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap\\.xml|sitemap-.*\\.xml).*)',
  ],
};
