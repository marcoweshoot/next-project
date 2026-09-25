// Configurazione condivisa del CMP (vanilla-cookieconsent) e piccoli helper
// usati sia dal banner sia dai loader di GTM/Meta Pixel per leggere lo stato
// del consenso senza reimportare la libreria ovunque.
import type { CookieConsentConfig } from "vanilla-cookieconsent";

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export const cookieConsentConfig: CookieConsentConfig = {
  guiOptions: {
    consentModal: {
      layout: "box wide",
      position: "bottom left",
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: "box",
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: {
      readOnly: true,
      enabled: true,
    },
    analytics: {
      autoClear: {
        cookies: [{ name: /^_ga/ }, { name: "_gid" }],
      },
    },
    marketing: {
      autoClear: {
        cookies: [{ name: /^_fb/ }],
      },
    },
  },
  language: {
    default: "it",
    translations: {
      it: {
        consentModal: {
          title: "Usiamo i cookie",
          description:
            "Utilizziamo cookie tecnici necessari al funzionamento del sito e, solo con il tuo consenso, cookie di analisi e marketing per capire come viene usato il sito e mostrarti contenuti pertinenti. Puoi accettare tutto, rifiutare tutto o scegliere le tue preferenze.",
          acceptAllBtn: "Accetta tutti",
          acceptNecessaryBtn: "Rifiuta tutti",
          showPreferencesBtn: "Gestisci preferenze",
          footer:
            '<a href="/cookie-policy">Cookie Policy</a>\n<a href="/gdpr">Privacy Policy</a>',
        },
        preferencesModal: {
          title: "Preferenze sui cookie",
          acceptAllBtn: "Accetta tutti",
          acceptNecessaryBtn: "Rifiuta tutti",
          savePreferencesBtn: "Salva preferenze",
          closeIconLabel: "Chiudi",
          sections: [
            {
              title: "Utilizzo dei cookie",
              description:
                "Puoi scegliere quali categorie di cookie consentire. I cookie necessari non possono essere disattivati perché indispensabili al funzionamento del sito.",
            },
            {
              title: "Cookie strettamente necessari",
              description:
                "Necessari al funzionamento del sito: autenticazione, sicurezza, pagamenti. Non possono essere disattivati.",
              linkedCategory: "necessary",
            },
            {
              title: "Cookie di analisi",
              description:
                "Ci aiutano a capire come viene usato il sito (Google Tag Manager) per migliorarlo.",
              linkedCategory: "analytics",
            },
            {
              title: "Cookie di marketing",
              description:
                "Usati per misurare le performance delle campagne pubblicitarie (Meta Pixel).",
              linkedCategory: "marketing",
            },
            {
              title: "Maggiori informazioni",
              description:
                'Per qualsiasi domanda relativa alla nostra policy sui cookie e sulle tue scelte, <a href="/contatti">contattaci</a>.',
            },
          ],
        },
      },
    },
  },
};

/**
 * True se la categoria è stata accettata dall'utente. Import dinamico per
 * evitare di caricare la libreria in contesti server-side.
 */
export async function hasConsentFor(category: ConsentCategory): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const CookieConsent = await import("vanilla-cookieconsent");
  return CookieConsent.acceptedCategory(category);
}

export async function openCookiePreferences() {
  if (typeof window === "undefined") return;
  const CookieConsent = await import("vanilla-cookieconsent");
  CookieConsent.showPreferences();
}
