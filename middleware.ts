// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'

// In middleware (Edge runtime) niente Buffer: usa Web Crypto.
function makeNonce() {
  // un valore opaco va benissimo; usiamo UUID senza trattini
  return crypto.randomUUID().replace(/-/g, "");
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isDev = process.env.NODE_ENV !== "production";
  const nonce = makeNonce();

  // Passa il nonce all'app (lo leggerai in app/layout.tsx con headers())
  res.headers.set("x-nonce", nonce);

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
