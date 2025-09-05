// src/types/window.d.ts
export {};

declare global {
  type IubApi = {
    isConsentGiven?: () => boolean;
    getConsentForPurpose?: (p: string | number) => boolean;
  };

  type FBQ = ((...args: unknown[]) => void) & {
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
    callMethod?: (...args: unknown[]) => void;
  };

  interface Window {
    dataLayer: unknown[]; // <-- non opzionale (niente '?')
    gtag?: (...args: unknown[]) => void;
    fbq?: FBQ;
    _iub?: { cs?: { api?: IubApi } };
  }
}
