"use client";
import { useEffect, useRef } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID; // es. GTM-XXXXXXX

type CookieConsentEventDetail = {
  cookie?: {
    categories?: string[];
  };
};

function ensureDL() {
  window.dataLayer = window.dataLayer || [];
}

function loadGTM(gtmId: string) {
  if (document.getElementById("gtm-script")) return;

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

// A differenza della vecchia integrazione iubenda (che concedeva sempre tutti
// e 4 i flag a qualunque evento di consenso), qui i flag riflettono le
// categorie granulari realmente accettate: `analytics` pilota
// analytics_storage, `marketing` pilota i 3 flag ads.
function pushConsentUpdate(categories: string[]) {
  ensureDL();
  const hasAnalytics = categories.includes("analytics");
  const hasMarketing = categories.includes("marketing");

  window.dataLayer.push({
    event: "cookie_consent_update",
    analytics_storage: hasAnalytics ? "granted" : "denied",
    ad_storage: hasMarketing ? "granted" : "denied",
    ad_user_data: hasMarketing ? "granted" : "denied",
    ad_personalization: hasMarketing ? "granted" : "denied",
  });
}

export default function ConsentLoaders() {
  const gtmLoaded = useRef(false);

  useEffect(() => {
    if (!GTM_ID) return;

    // 1) stato iniziale: nega tutto (consent mode baseline), prima che
    // l'utente interagisca col banner.
    ensureDL();
    window.dataLayer.push({
      event: "default_consent",
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentEventDetail>).detail;
      const categories = detail?.cookie?.categories ?? [];

      pushConsentUpdate(categories);

      if (categories.includes("analytics") && !gtmLoaded.current) {
        loadGTM(GTM_ID!);
        gtmLoaded.current = true;
      }
    };

    // cc:onConsent -> primo consenso dell'utente (o consenso già salvato al
    // caricamento pagina). cc:onChange -> l'utente ha cambiato le preferenze
    // dal pannello (es. da footer "Gestisci preferenze cookie").
    window.addEventListener("cc:onConsent", handleConsent as EventListener);
    window.addEventListener("cc:onChange", handleConsent as EventListener);

    return () => {
      window.removeEventListener("cc:onConsent", handleConsent as EventListener);
      window.removeEventListener("cc:onChange", handleConsent as EventListener);
    };
  }, []);

  return null;
}
