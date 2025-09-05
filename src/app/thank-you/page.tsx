import { getClient } from '@/lib/apolloClient';
import { GET_COURSES } from '@/graphql/queries/courses';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import ThankYouTracking from '@/components/ThankYouTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Camera, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default async function ThankYouPage() {
  const client = getClient();
  // Carico in build-time
  const { data } = await client.query({
    query: GET_COURSES,
    variables: { locale: 'it' },
    fetchPolicy: 'no-cache',
  });

  const courses = data?.courses || [];
  const courseBase = courses.find((c: any) => c.id === '1');
  const coursePaesaggio = courses.find((c: any) => c.id === '3');

  const fallbackOffers = [
    {
      id: 1,
      title: 'Corso Base di Fotografia',
      description:
        'Impara le tecniche fondamentali per scattare foto straordinarie durante il tuo viaggio',
      icon: Camera,
      link: '/corsi-di-fotografia/',
      originalPrice: '€19',
      offerPrice: '€9',
    },
    {
      id: 2,
      title: 'Editing Fotografico Avanzato',
      description:
        'Scopri come post-processare le tue foto per risultati professionali',
      icon: Star,
      link: '/corsi-di-fotografia/',
      originalPrice: '€149',
      offerPrice: '€99',
    },
  ];

  const offers =
    courseBase && coursePaesaggio
      ? [
          {
            id: courseBase.id,
            title: courseBase.title,
            description:
              courseBase.excerpt ||
              'Impara le tecniche fondamentali per scattare foto straordinarie durante il tuo viaggio',
            icon: Camera,
            link: `/corsi-di-fotografia/${courseBase.slug}`,
            originalPrice: '€19',
            offerPrice: courseBase.price
              ? `€${courseBase.price}`
              : '€9',
          },
          {
            id: coursePaesaggio.id,
            title: coursePaesaggio.title,
            description:
              coursePaesaggio.excerpt ||
              'Scopri come post-processare le tue foto per risultati professionali',
            icon: Star,
            link: `/corsi-di-fotografia/${coursePaesaggio.slug}`,
            originalPrice: '€149',
            offerPrice: coursePaesaggio.price
              ? `€${coursePaesaggio.price}`
              : '€99',
          },
        ]
      : fallbackOffers;

  return (
    <>
      {/* Metadati SEO */}
      <SEO
        title="Grazie per la tua prenotazione - WeShoot"
        description="Grazie per aver scelto WeShoot! Non vediamo l’ora di condividere con te questa esperienza fotografica indimenticabile."
      />

      {/* Header + Tracking */}
      <Header />
      <ThankYouTracking orderId="thank-you-page" />

      {/* Hero */}
      <PageHeader backgroundImage="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/viaggi-fotografici-e-workshop.avif" theme="dark" size="big">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Grazie per la tua prenotazione!
            </h1>
            <h2 className="text-xl md:text-2xl text-white/90 animate-fade-in">
              Non vediamo l’ora di condividere con te questa esperienza fotografica indimenticabile
            </h2>
          </div>
        </div>
      </PageHeader>

      {/* Contenuti testuali */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg dark:prose-invert text-muted-foreground">
          <p>
            Hai appena fatto il primo passo verso un’avventura fotografica che
            cambierà il tuo modo di vedere il mondo…
          </p>
          <p>
            Nelle prossime ore riceverai una mail di conferma con tutti i
            dettagli: itinerario, consigli e info pratiche.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 mb-16 text-center text-foreground">
            <div>
              <Users className="h-10 w-10 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">1200+</div>
              <div className="text-muted-foreground">Viaggiatori Felici</div>
            </div>
            <div>
              <Camera className="h-10 w-10 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">200+</div>
              <div className="text-muted-foreground">Viaggi Organizzati</div>
            </div>
            <div>
              <Star className="h-10 w-10 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">22.000+</div>
              <div className="text-muted-foreground">WeShooters</div>
            </div>
            <div>
              <CheckCircle className="h-10 w-10 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">98%</div>
              <div className="text-muted-foreground">Soddisfazione</div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerte */}
      <section className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Prima di partire…
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Approfitta dell’offerta limitata sul nostro corso di fotografia.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className="overflow-hidden border border-border bg-card text-card-foreground hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10">
                      <offer.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {offer.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground line-through">
                          {offer.originalPrice}
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {offer.offerPrice}
                        </span>
                        <Button asChild>
                          <Link href={offer.link}>Scopri di più</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/viaggi-fotografici/">Scopri altri viaggi</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
