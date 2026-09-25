'use client';

import { openCookiePreferences } from '@/integrations/cookieConsent';

export default function ManageCookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
    >
      Gestisci le tue preferenze sui cookie
    </button>
  );
}
