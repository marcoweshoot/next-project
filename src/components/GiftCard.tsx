
import React from 'react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GiftCardHero from '@/components/gift-card/GiftCardHero';
import GiftCardGrid from '@/components/gift-card/GiftCardGrid';
import GiftCardInfo from '@/components/gift-card/GiftCardInfo';
import GiftCardFAQ from '@/components/gift-card/GiftCardFAQ';

const GiftCard: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  return (
    <>
      <SEO 
        title="Carte Regalo WeShoot | Regala un Viaggio Fotografico"
        description="Sorprendi i tuoi cari con una carta regalo WeShoot. Il viaggio del futuro comincia adesso con i nostri buoni regalo per viaggi fotografici."
        url="https://www.weshoot.it/gift-card"
      />
      <Header />
      
      <div className="min-h-screen">
        <GiftCardHero />
        <GiftCardGrid />
        <GiftCardInfo />
        <GiftCardFAQ />
      </div>
      
      <Footer />
    </>
  );
};

export default GiftCard;
