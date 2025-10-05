"use client";

import Script from "next/script";

const siteId = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID!;
const policyId = process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID!;

export default function IubendaScripts() {
  return (
    <>
      <Script id="iubenda-config" strategy="beforeInteractive">
        {`
          var _iub = _iub || [];
          _iub.csConfiguration = {
            lang: "it",
            siteId: ${siteId},
            cookiePolicyId: ${policyId},
            consentOnContinuedBrowsing: false,
            cookieDuration: 365, // Durata consenso: 365 giorni
            banner: {
              acceptButtonDisplay: true,
              customizeButtonDisplay: true,
              position: "bottom"
            }
          };
        `}
      </Script>

      <Script
        src="https://cdn.iubenda.com/cs/iubenda_cs.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
