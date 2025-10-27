import { Suspense } from 'react';
import { GiftCardSuccessContent } from '@/components/gift-card/GiftCardSuccessContent';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function GiftCardSuccessPage() {
  return (
    <>
      <SEO
        title="Gift Card Acquistata con Successo | WeShoot"
        description="La tua gift card WeShoot è stata acquistata con successo. Scopri come utilizzarla per i tuoi viaggi fotografici."
        url="https://www.weshoot.it/gift-card/success"
      />
      <Header />
      
      <main className="min-h-screen bg-background">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <GiftCardSuccessContent />
        </Suspense>
      </main>
      
      <Footer />
    </>
  );
}
