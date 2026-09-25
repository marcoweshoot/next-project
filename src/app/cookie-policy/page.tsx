import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManageCookiePreferencesButton from './ManageCookiePreferencesButton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Cookie Policy | WeShoot',
  description:
    'Cookie Policy di WeShoot.it: quali cookie e strumenti di tracciamento usiamo, per quali finalità e come gestire le tue preferenze.',
  alternates: { canonical: '/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />

      <section className="relative py-24 text-primary-foreground">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/40 to-black/60 dark:from-black/70 dark:via-black/55 dark:to-black/70" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif")',
          }}
          aria-hidden="true"
        />

        <div className="relative z-20">
          <div className="container">
            <div className="text-center">
              <h1 className="mb-6 text-4xl font-bold md:text-5xl">Cookie Policy</h1>

              <div className="mb-8 flex justify-center">
                <Breadcrumb>
                  <BreadcrumbList className="text-primary-foreground">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          href="/"
                          className="text-primary-foreground/80 hover:text-primary-foreground"
                        >
                          WeShoot
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="text-primary-foreground/70" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-primary-foreground">
                        Cookie Policy
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container max-w-4xl">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm md:p-12">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary">
              <p>
                Questo documento descrive i cookie e gli altri strumenti di tracciamento
                utilizzati da WeShoot.it ("il Sito") e come puoi gestire le tue preferenze.
              </p>

              <h2>Titolare del trattamento</h2>
              <p>
                Marco Carotenuto — Via Monte Fumaiolo, 13, 00139 Roma (RM)
                <br />
                Email: <a href="mailto:marco@weshoot.it">marco@weshoot.it</a>
              </p>

              <h2>Cosa sono i cookie e gli strumenti di tracciamento</h2>
              <p>
                I cookie sono piccoli file di testo che i siti visitati inviano al browser
                dell'utente, dove vengono memorizzati per poi essere ritrasmessi agli stessi
                siti alla visita successiva. Alcune finalità per cui vengono utilizzati
                richiedono il consenso preventivo dell'utente. Il consenso, quando prestato,
                può essere revocato liberamente in ogni momento seguendo le istruzioni
                riportate in questa pagina.
              </p>

              <h2>Come gestire le tue preferenze</h2>
              <p>
                Puoi accettare, rifiutare o personalizzare in ogni momento le categorie di
                cookie non necessari usando il pulsante qui sotto, che riapre il pannello delle
                preferenze mostrato alla prima visita.
              </p>
              <p>
                <ManageCookiePreferencesButton />
              </p>

              <h2>Cookie tecnici (sempre attivi)</h2>
              <p>
                Non richiedono consenso perché indispensabili al funzionamento del Sito:
                gestiscono l'autenticazione, la sicurezza della sessione e il completamento dei
                pagamenti. Se disattivati (ad es. bloccandoli dalle impostazioni del browser),
                alcune funzionalità come login, prenotazioni e checkout smettono di funzionare
                correttamente.
              </p>
              <ul>
                <li>
                  <strong>Supabase Auth</strong> — Supabase, Inc. — gestisce accesso e sessione
                  dell'utente registrato.
                </li>
                <li>
                  <strong>Stripe</strong> (incluse le opzioni di pagamento come Klarna offerte
                  tramite Stripe Checkout) — Stripe, Inc. — necessario per processare i
                  pagamenti in modo sicuro.
                </li>
              </ul>

              <h2>Cookie di analisi (richiedono consenso)</h2>
              <p>
                Ci aiutano a capire come viene utilizzato il Sito, in forma aggregata, per
                migliorarne contenuti e funzionamento. Vengono caricati solo dopo che accetti
                questa categoria dal pannello preferenze.
              </p>
              <ul>
                <li>
                  <strong>Google Tag Manager</strong> — Google LLC/Google Ireland Limited —
                  contenitore di tag che può includere strumenti di misurazione come Google
                  Analytics 4. Luogo del trattamento: Stati Uniti/Unione Europea, con eventuali
                  garanzie previste dalla normativa per il trasferimento extra-UE.
                </li>
              </ul>

              <h2>Cookie di marketing (richiedono consenso)</h2>
              <p>
                Utilizzati per misurare l'efficacia delle nostre campagne pubblicitarie.
                Vengono attivati solo dopo che accetti questa categoria dal pannello
                preferenze.
              </p>
              <ul>
                <li>
                  <strong>Meta Pixel e Conversions API</strong> — Meta Platforms, Inc. —
                  misura le conversioni derivanti dagli annunci pubblicitari su Facebook e
                  Instagram. Luogo del trattamento: Stati Uniti, con eventuali garanzie
                  previste dalla normativa per il trasferimento extra-UE.
                </li>
              </ul>

              <h2>Come controllare i cookie dalle impostazioni del browser</h2>
              <p>
                Oltre al pannello preferenze del Sito, puoi gestire o eliminare i cookie
                direttamente dalle impostazioni del tuo browser (Chrome, Firefox, Safari, Edge,
                ecc.). Le impostazioni del browser non permettono però un controllo granulare
                per categoria come quello offerto dal pannello preferenze.
              </p>

              <h2>Ulteriori informazioni</h2>
              <p>
                Per qualsiasi domanda relativa a questa Cookie Policy o al trattamento dei tuoi
                dati personali, scrivi a{' '}
                <a href="mailto:marco@weshoot.it">marco@weshoot.it</a> o consulta la nostra{' '}
                <Link href="/gdpr">Privacy Policy</Link>.
              </p>

              <p className="text-sm text-muted-foreground">
                Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
