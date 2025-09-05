// src/integrations/ConsentLoaders.tsx
"use client";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;     // es: G-XXXXXX
const FB_ID = process.env.NEXT_PUBLIC_FB_PIXEL;  // es: 1234567890

function load(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id; s.src = src; s.async = true;
  document.head.appendChild(s);
}

function initGA() {
  if (!GA_ID || (window as any).gtag) return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function(){ (window as any).dataLayer.push(arguments); };
  load(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "ga4-lib");
  (window as any).gtag("js", new Date());
  (window as any).gtag("config", GA_ID, { anonymize_ip: true });
}

function initFB() {
  if (!FB_ID || (window as any).fbq) return;
  function initFB() {
    if (!FB_ID || (window as any).fbq) return;
    
    // Facebook Pixel code with proper typing
    (function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js", null, null, null);
    
    (window as any).fbq("init", FB_ID);
    (window as any).fbq("track", "PageView");
  }
  (window as any).fbq("init", FB_ID);
  (window as any).fbq("track", "PageView");
}

export default function ConsentLoaders() {
  useEffect(() => {
    const handler = (e?: any) => {
      const analytics = e?.purposes?.statistics ?? false;
      const marketing = e?.purposes?.marketing ?? false;
      if (analytics) initGA();
      if (marketing) initFB();
    };

    (window as any)._iub = (window as any)._iub || [];
    (window as any)._iub.push(["csConfiguration", { callback: {
      onConsentGiven: handler,
      onConsentFirstGiven: handler,
      onPreferenceExpressed: handler,
    }}]);

    // se il consenso esiste già, prova a partire subito
    setTimeout(() => handler((window as any)._iub?.cs?.consent || {}), 0);
  }, []);
  return null;
}
