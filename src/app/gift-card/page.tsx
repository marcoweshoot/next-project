
import Image from 'next/image';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GiftCardGrid from '@/components/gift-card/GiftCardGrid';
import GiftCardInfo from '@/components/gift-card/GiftCardInfo';
import GiftCardFAQ from '@/components/gift-card/GiftCardFAQ';

export const dynamic = 'force-static';

export default function GiftCardPage() {
  return (
    <>
      <SEO
        title="Carte Regalo WeShoot | Regala un Viaggio Fotografico"
        description="Sorprendi i tuoi cari con una carta regalo WeShoot. Il viaggio del futuro comincia adesso con i nostri buoni regalo per viaggi fotografici."
        url="https://www.weshoot.it/gift-card"
      />
      <Header />

      {/* Hero Section ottimizzata per LCP */}
      <section className="relative h-[60vh] md:h-[70vh] text-white overflow-hidden">
        {/* Sfondo immagine ottimizzata */}
        <Image
          src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/viaggi-fotografici-e-workshop.avif"
          alt="Carte regalo WeShoot"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-75"
          unoptimized
        />
        {/* Overlay scuro */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Contenuto Hero */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            Carte regalo WeShoot
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
            Regala un viaggio fotografico indimenticabile ai tuoi amici e familiari.
          </p>
        </div>
      </section>

      <main className="min-h-screen bg-gray-50">
        {/* Qui i tuoi componenti di sezione */}
        <div className="pt-16">
          <GiftCardGrid />
        </div>
        <GiftCardInfo />
        <GiftCardFAQ />
      </main>

      <Footer />
    </>
  );
}
