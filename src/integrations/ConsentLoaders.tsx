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
  }
}

function ensureDL() {
  window.dataLayer = window.dataLayer || [];
}

function loadScriptOnce(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function getIubApi(): IubApi | null {
  return (window._iub && window._iub.cs && window._iub.cs.api) || null;
}

function readPurposes(api: IubApi) {
  // copriamo le varianti più comuni di nomi/ID
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

function pushConsentToDataLayer(cons: { analytics: boolean; marketing: boolean }) {
  ensureDL();
  // Default negato
  window.dataLayer!.push({
    event: "default_consent",
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  // Aggiornamento in base a Iubenda
  window.dataLayer!.push({
    event: "iubenda_consent_update",
    analytics_storage: cons.analytics ? "granted" : "denied",
    ad_storage: cons.marketing ? "granted" : "denied",
    ad_user_data: cons.marketing ? "granted" : "denied",
    ad_personalization: cons.marketing ? "granted" : "denied",
  });
  // Per compatibilità con trigger esistenti
  window.dataLayer!.push({ event: "iubenda_consent_given" });
}

function initGTM(containerId: string) {
  if (!containerId) return;
  if (document.getElementById("gtm-lib")) return;
  ensureDL();
  // Evento di bootstrap standard di GTM
  window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-lib";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(s);
}

export default function ConsentLoaders() {
  const gtmLoadedRef = useRef(false);

  useEffect(() => {
    if (!GTM_ID) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[ConsentLoaders] NEXT_PUBLIC_GTM_ID mancante");
      }
      return;
    }

    const apply = () => {
      const api = getIubApi();
      if (!api) return;
      const cons = readPurposes(api);

      if (process.env.NODE_ENV !== "production") {
        console.log("[ConsentLoaders] consent:", cons);
      }

      pushConsentToDataLayer(cons);

      // Carica GTM se l’utente ha dato qualsiasi consenso utile
      if (!gtmLoadedRef.current && cons.any) {
        initGTM(GTM_ID);
        gtmLoadedRef.current = true;
      }
    };

    // 1) tenta subito (per chi ha già dato consenso in passato)
    apply();

    // 2) aspetta che l’API Iubenda sia pronta (poll leggero, max ~10s)
    let tries = 0;
    const iv = setInterval(() => {
      if (getIubApi()) {
        clearInterval(iv);
        apply();
      } else if (++tries > 40) {
        clearInterval(iv);
      }
    }, 250);

    // 3) reagisci ai cambi di preferenze
    const onChange = () => apply();
    document.addEventListener("iubenda_consent_given", onChange as EventListener);
    document.addEventListener("iubenda_preference_given", onChange as EventListener);
    document.addEventListener("iubenda_preference_updated", onChange as EventListener);

    return () => {
      clearInterval(iv);
      document.removeEventListener("iubenda_consent_given", onChange as EventListener);
      document.removeEventListener("iubenda_preference_given", onChange as EventListener);
      document.removeEventListener("iubenda_preference_updated", onChange as EventListener);
    };
  }, []);

  return null;
}
