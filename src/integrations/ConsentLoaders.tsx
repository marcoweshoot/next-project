// src/integrations/ConsentLoaders.tsx
"use client";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;     // es: G-XXXXXX
const FB_ID = process.env.NEXT_PUBLIC_FB_PIXEL;  // es: 1234567890

declare global {
  interface Window {
    _iub?: {
      cs?: { consent?: unknown };
      push?: (tuple: unknown[]) => void;
    } & any; // Iubenda non ha tipi pubblici stabili
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      callMethod?: (...args: unknown[]) => void;
    };
  }
}

function loadScriptOnce(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

// -------- GA4: init senza 'arguments' / '.apply()' ----------
function initGA() {
  if (!GA_ID) return;

  if (!window.dataLayer) window.dataLayer = [];
  if (!window.gtag) {
    // Evita 'arguments' -> usa rest params e pusha l'array
    window.gtag = (...args: unknown[]) => {
      (window.dataLayer as unknown[]).push(args);
    };
  }

  loadScriptOnce(
    `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
    "ga4-lib"
  );
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

// -------- Meta Pixel: riscrittura moderna (niente IIFE minificata) ----------
function initFB() {
  if (!FB_ID) return;

  if (!window.fbq) {
    const q: any[] = [];
    const fbq: any = (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...(args as []));
      else q.push(args);
    };
    fbq.queue = q;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    loadScriptOnce(
      "https://connect.facebook.net/en_US/fbevents.js",
      "fb-pixel-lib"
    );
  }

  window.fbq("init", FB_ID);
  window.fbq("track", "PageView");
}

// -------- Bridge col consenso Iubenda ----------
export default function ConsentLoaders() {
  useEffect(() => {
    const onConsent = (e?: any) => {
      const analytics = e?.purposes?.statistics ?? false;
      const marketing = e?.purposes?.marketing ?? false;
      if (analytics) initGA();
      if (marketing) initFB();
    };

    window._iub = window._iub || ({} as any);
    window._iub.push?.([
      "csConfiguration",
      {
        callback: {
          onConsentGiven: onConsent,
          onConsentFirstGiven: onConsent,
          onPreferenceExpressed: onConsent,
        },
      },
    ]);

    // se l'utente aveva già dato consenso in passato
    setTimeout(() => onConsent(window._iub?.cs?.consent || {}), 0);
  }, []);

  return null;
}