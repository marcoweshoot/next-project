// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
  return res;
}

// Escludi asset statici
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
