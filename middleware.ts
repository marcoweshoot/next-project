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
  const res = NextResponse.next();
  const isDev = process.env.NODE_ENV !== "production";
  const nonce = makeNonce();

  // Passa il nonce all'app (lo leggerai in app/layout.tsx con headers())
  res.headers.set("x-nonce", nonce);

  // Gestione parametri di reset password per sicurezza
  if (req.nextUrl.pathname === '/auth/reset-password') {
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
      console.log('🚨 MIDDLEWARE: No reset tokens or code found in URL - this is the problem!');
    }
  }

  const csp = [
    "default-src 'self'",
    // niente 'unsafe-inline': consentiamo solo script con nonce (+ strict-dynamic)
    `script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ""} 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com`.trim(),
    // style: tieni 'unsafe-inline' finché non passi a nonce per gli <style> iniettati
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://api.weshoot.it https://s3.eu-west-1.amazonaws.com https://wxoodcdxscxazjkoqhsg.supabase.co ${isDev ? "ws: http://localhost:*" : ""}`.trim(),
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  // Parti in Report-Only per test; poi passa a 'Content-Security-Policy'
  res.headers.set("Content-Security-Policy", csp);

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

      // Verifica se l'utente è admin usando la funzione RPC
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin', { user_uuid: user.id })

      if (error || !isAdmin) {
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
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap\\.xml|sitemap-.*\\.xml).*)',
  ],
};
