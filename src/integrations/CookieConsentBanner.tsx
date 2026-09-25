"use client";

import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { cookieConsentConfig } from "./cookieConsent";

// Sostituisce il banner iubenda: libreria open source (vanilla-cookieconsent),
// nessuna chiamata esterna, nessun iframe (compatibile con la CSP frame-src 'none').
export default function CookieConsentBanner() {
  useEffect(() => {
    let cancelled = false;

    import("vanilla-cookieconsent").then((CookieConsent) => {
      if (cancelled) return;
      CookieConsent.run(cookieConsentConfig);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
