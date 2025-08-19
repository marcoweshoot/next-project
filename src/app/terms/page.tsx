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
      <section className="relative py-24 text-white overflow-hidden">
        {/* Immagine di sfondo ottimizzata */}
        <Image
          src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/photo-1469474968028-56623f02e42e.avif"
          alt="Termini e Condizioni"
          fill
          priority
          sizes="(max-width:1200px) 100vw, 1200px"
          className="object-cover object-center brightness-50"
        />
        {/* Overlay scuro */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {termsData?.title || 'Termini e Condizioni'}
          </h1>
          {termsData?.subtitle && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              {termsData.subtitle}
            </p>
          )}
          <div className="flex justify-center mb-8">
            <Breadcrumb>
              <BreadcrumbList className="text-white">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="text-gray-300 hover:text-white">
                      WeShoot
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-gray-400" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    Termini e Condizioni
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
            {termsData?.body ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: termsData.body }}
              />
            ) : (
              <div className="prose prose-lg max-w-none">
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
