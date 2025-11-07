"use client";
import { useEffect, useRef } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID; // es. GTM-XXXXXXX

type IubApi = {
  isConsentGiven?: () => boolean;
  getConsentForPurpose?: (p: string | number) => boolean;
};

// This allows us to safely access Iubenda's API and the dataLayer
declare global {
  interface Window {
    _iub?: { cs?: { api?: IubApi } };
    dataLayer: unknown[]; // Match the stricter type 'unknown[]' from other declarations
  }
}

function ensureDL() {
  window.dataLayer = window.dataLayer || [];
}

function getIubApi(): IubApi | null {
  return (window._iub && window._iub.cs && window._iub.cs.api) || null;
}

function readPurposes(api: IubApi) {
  const has = (keys: (string | number)[]) =>
    keys.some(k => !!api.getConsentForPurpose?.(k as any));

  // Proviamo i nomi e anche alcuni ID comuni
  const analytics = has(["analytics", "measurement", "statistics", 4, 5, 7]);
  const marketing = has(["marketing", "advertising", "targeting", 4, 5, 8]);

  const any = analytics || marketing || !!api.isConsentGiven?.();
  return { analytics, marketing, any };
}

function loadGTM(gtmId: string) {
  if (document.getElementById('gtm-script')) return;
  
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
}

// ...
function pushConsentGranted() {
  // Default: denied
  ensureDL();
  window.dataLayer.push({
    event: "default_consent",
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  // Dopo il click su Accetta / Salva preferenze -> granted
  window.dataLayer.push({
    event: "iubenda_consent_update",
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
  window.dataLayer.push({ event: "iubenda_consent_given" });
}

export default function ConsentLoaders() {
  const gtmLoaded = useRef(false);

  useEffect(() => {
    if (!GTM_ID) return;

    // 1) stato iniziale: nega tutto (consent mode baseline)
    ensureDL();
    window.dataLayer.push({
      event: "default_consent",
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    // 2) se Iubenda è già pronta e ricorda un consenso, ok;
    //    ma se l'API non dà i purpose, non blocchiamoci
    const tryApiOnce = () => {
      const api = window._iub?.cs?.api;
      if (!api) return false;
      // molti setup qui tornano sempre false: passiamo comunque
      if (api.isConsentGiven?.() === true) {
        pushConsentGranted();
        return true;
      }
      return false;
    };
    if (!tryApiOnce()) {
      // 3) ascolta SEMPRE gli eventi di Iubenda
      const onChange = () => {
        pushConsentGranted();
        if (!gtmLoaded.current) {
          loadGTM(GTM_ID!);
          gtmLoaded.current = true;
        }
      };
      document.addEventListener("iubenda_consent_given", onChange as EventListener);
      document.addEventListener("iubenda_preference_given", onChange as EventListener);
      document.addEventListener("iubenda_preference_updated", onChange as EventListener);

      // 4) piccolo poll per quando l’API arriva tardi
      let tries = 0;
      const iv = setInterval(() => {
        if (tryApiOnce()) {
          clearInterval(iv);
          if (!gtmLoaded.current) {
            loadGTM(GTM_ID!);
            gtmLoaded.current = true;
          }
        } else if (++tries > 40) {
          clearInterval(iv);
        }
      }, 250);

      return () => {
        clearInterval(iv);
        document.removeEventListener("iubenda_consent_given", onChange as EventListener);
        document.removeEventListener("iubenda_preference_given", onChange as EventListener);
        document.removeEventListener("iubenda_preference_updated", onChange as EventListener);
      };
    } else {
      // consenso già presente -> carica GTM subito
      if (!gtmLoaded.current) {
        loadGTM(GTM_ID!);
        gtmLoaded.current = true;
      }
    }
  }, []);

  return null;
}
