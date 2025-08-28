// app/termini/page.tsx

import { getClient } from '@/lib/apolloClient';
import { GET_TERMS_CONDITIONS } from '@/graphql/queries';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export const dynamic = 'force-static';

export default async function TermsPage() {
  const client = getClient();
  let termsData: { title?: string; subtitle?: string; body?: string } | null = null;

  try {
    const { data } = await client.query({
      query: GET_TERMS_CONDITIONS,
      fetchPolicy: 'no-cache',
    });
    termsData = data?.terminiCondizioniPage;
  } catch (e) {
    console.error('Errore fetching termini e condizioni:', e);
  }

  return (
    <>
      <SEO
        title={termsData?.title || 'Termini e Condizioni'}
        description="Termini e condizioni d'uso per i servizi WeShoot.it - Viaggi fotografici e corsi di fotografia"
        url="https://www.weshoot.it/termini"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 text-primary-foreground">
        {/* Immagine di sfondo */}
        <Image
          src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif"
          alt="Termini e Condizioni"
          fill
          priority
          sizes="(max-width:1200px) 100vw, 1200px"
          className="object-cover object-center"
        />
        {/* Overlay gradiente (più intenso in dark) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/40 to-black/60 dark:from-black/70 dark:via-black/55 dark:to-black/70" />

        <div className="relative z-20">
          <div className="container text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              {termsData?.title || 'Termini e Condizioni'}
            </h1>
            {termsData?.subtitle && (
              <p className="mx-auto mb-8 max-w-3xl text-xl text-primary-foreground/80">
                {termsData.subtitle}
              </p>
            )}
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
                      Termini e Condizioni
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-muted py-16">
        <div className="container max-w-4xl">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm md:p-12">
            {termsData?.body ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: termsData.body }}
              />
            ) : (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p>Contenuto non disponibile al momento.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
