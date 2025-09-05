"use client";
import { useEffect, useRef } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID; // es. GTM-XXXXXXX

type IubApi = {
  isConsentGiven?: () => boolean;
  getConsentForPurpose?: (p: string | number) => boolean;
};

declare global {
  interface Window {
    _iub?: { cs?: { api?: IubApi } };
    dataLayer: any[]; // dichiarata non opzionale nel tuo window.d.ts
  }
}

function ensureDL() {
  window.dataLayer = window.dataLayer || [];
}

function getIubApi(): IubApi | null {
  return (window._iub && window._iub.cs && window._iub.cs.api) || null;
}

function readPurposes(api: IubApi) {
  const analytics =
    !!api.getConsentForPurpose?.("statistics") ||
    !!api.getConsentForPurpose?.("measurement") ||
    !!api.getConsentForPurpose?.(5);
  const marketing =
    !!api.getConsentForPurpose?.("marketing") ||
    !!api.getConsentForPurpose?.("targeting") ||
    !!api.getConsentForPurpose?.(4);
  const any = analytics || marketing || !!api.isConsentGiven?.();
  return { analytics, marketing, any };
}

function pushConsent(cons: { analytics: boolean; marketing: boolean }) {
  ensureDL();
  window.dataLayer.push({
    event: "default_consent",
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.dataLayer.push({
    event: "iubenda_consent_update",
    analytics_storage: cons.analytics ? "granted" : "denied",
    ad_storage: cons.marketing ? "granted" : "denied",
    ad_user_data: cons.marketing ? "granted" : "denied",
    ad_personalization: cons.marketing ? "granted" : "denied",
  });
  window.dataLayer.push({ event: "iubenda_consent_given" });
}

function loadGTM(containerId: string) {
  if (document.getElementById("gtm-lib")) return;
  ensureDL();
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-lib";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(s);
}

export default function ConsentLoaders() {
  const gtmLoaded = useRef(false);

  useEffect(() => {
    if (!GTM_ID) {
      if (process.env.NODE_ENV !== "production")
        console.warn("[ConsentLoaders] NEXT_PUBLIC_GTM_ID mancante");
      return;
    }

    const log = (...args: unknown[]) =>
      process.env.NODE_ENV !== "production" && console.log("[ConsentLoaders]", ...args);

    const applyFromApi = (source: string) => {
      const api = getIubApi();
      if (!api) {
        log("API non pronta", source);
        return false;
      }
      const cons = readPurposes(api);
      log("consenso", cons, "via", source);
      pushConsent({ analytics: cons.analytics, marketing: cons.marketing });
      if (!gtmLoaded.current && cons.any) {
        loadGTM(GTM_ID);
        gtmLoaded.current = true;
        log("GTM caricato (API)", source);
      }
      return cons.any;
    };

    // 1) prova subito (consenso persistito)
    if (!applyFromApi("immediate")) {
      // 2) poll leggero finché l’API è pronta (max ~10s)
      let tries = 0;
      const iv = setInterval(() => {
        if (applyFromApi("poll")) clearInterval(iv);
        else if (++tries > 40) clearInterval(iv);
      }, 250);

      // 3) eventi iubenda: se l’API ancora non risponde, carica GTM in fallback
      const onChange = () => {
        const ok = applyFromApi("event");
        if (!ok && !gtmLoaded.current) {
          // fallback: l’utente ha dato consenso, ma l’API tarda -> carica GTM
          ensureDL();
          window.dataLayer.push({ event: "iubenda_consent_given" });
          loadGTM(GTM_ID);
          gtmLoaded.current = true;
          log("GTM caricato (fallback)", "event");
        }
      };

      document.addEventListener("iubenda_consent_given", onChange as EventListener);
      document.addEventListener("iubenda_preference_given", onChange as EventListener);
      document.addEventListener("iubenda_preference_updated", onChange as EventListener);

      return () => {
        clearInterval(iv);
        document.removeEventListener("iubenda_consent_given", onChange as EventListener);
        document.removeEventListener("iubenda_preference_given", onChange as EventListener);
        document.removeEventListener("iubenda_preference_updated", onChange as EventListener);
      };
    }
  }, []);

  return null;
}
