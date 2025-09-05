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
  // Copre varianti comuni dei nomi/ID delle finalità
  const analytics =
    !!api.getConsentForPurpose?.("statistics") ||
    !!api.getConsentForPurpose?.("measurement") ||
    !!api.getConsentForPurpose?.(5) ||
    !!api.isConsentGiven?.();

  const marketing =
    !!api.getConsentForPurpose?.("marketing") ||
    !!api.getConsentForPurpose?.("targeting") ||
    !!api.getConsentForPurpose?.(4);

  return { analytics, marketing };
}

function pushConsentToDataLayer(cons: { analytics: boolean; marketing: boolean }) {
  window.dataLayer = window.dataLayer || [];

  // Consent Mode: default "denied" (nel dubbio)
  window.dataLayer.push({
    event: "default_consent",
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  // Aggiornamento in base al consenso Iubenda
  window.dataLayer.push({
    event: "iubenda_consent_update",
    analytics_storage: cons.analytics ? "granted" : "denied",
    ad_storage: cons.marketing ? "granted" : "denied",
    ad_user_data: cons.marketing ? "granted" : "denied",
    ad_personalization: cons.marketing ? "granted" : "denied",
  });

  // Per compatibilità con vecchi trigger in GTM
  window.dataLayer.push({ event: "iubenda_consent_given" });
}

function initGTM(containerId: string) {
  loadScriptOnce(`https://www.googletagmanager.com/gtm.js?id=${containerId}`, "gtm-lib");
}

export default function ConsentLoaders() {
  const gtmLoadedRef = useRef(false);

  useEffect(() => {
    if (!GTM_ID) return;

    const apply = () => {
      const api = getIubApi();
      if (!api) return;
      const cons = readPurposes(api);

      // Pubblica lo stato di consenso su dataLayer:
      pushConsentToDataLayer(cons);

      // Carica GTM se non è già stato caricato e c'è almeno una finalità utile
      if (!gtmLoadedRef.current && (cons.analytics || cons.marketing)) {
        initGTM(GTM_ID);
        gtmLoadedRef.current = true;
      }
    };

    // 1) tenta subito (consenso già presente)
    apply();

    // 2) aspetta che l’API Iubenda sia pronta (poll leggero)
    let tries = 0;
    const iv = setInterval(() => {
      if (getIubApi()) {
        clearInterval(iv);
        apply();
      } else if (++tries > 40) {
        clearInterval(iv); // ~10s max
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
