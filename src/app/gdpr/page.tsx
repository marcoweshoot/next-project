// app/privacy/page.tsx
import { getClient } from '@/lib/apolloClient';
import { GET_PRIVACY_POLICY } from '@/graphql/queries';
import Link from 'next/link';
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

export default async function PrivacyPage() {
  const client = getClient();
  let privacyData;

  try {
    const { data } = await client.query({
      query: GET_PRIVACY_POLICY,
      fetchPolicy: 'no-cache',
    });
    privacyData = data?.gdprPage;
  } catch (error) {
    console.error('Errore fetching privacy policy:', error);
    privacyData = null;
  }

  return (
    <>
      <SEO
        title={privacyData?.title || 'Privacy Policy'}
        description="Privacy Policy e trattamento dei dati personali per i servizi WeShoot.it - Viaggi fotografici e corsi di fotografia"
        url="https://www.weshoot.it/gdpr"
      />

      <Header />

      {/* Hero Section */}
      <section className="relative py-24 text-primary-foreground">
        {/* overlay gradiente: un filo più intenso in dark */}
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
              <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                {privacyData?.title || 'Privacy Policy'}
              </h1>

              {privacyData?.subtitle && (
                <p className="mx-auto mb-8 max-w-3xl text-xl text-primary-foreground/80">
                  {privacyData.subtitle}
                </p>
              )}

              {/* Breadcrumbs */}
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
                        Privacy Policy
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-muted">
        <div className="container max-w-4xl">
          <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm md:p-12">
            {privacyData?.body ? (
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary"
                // opzionale: raffina headings/strong/code se vuoi
                // className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary prose-headings:text-foreground prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: privacyData.body }}
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
