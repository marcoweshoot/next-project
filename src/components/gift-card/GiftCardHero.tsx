// components/gift-card/GiftCardHero.tsx
'use client'; // rimane client perché usa interattività minima (se non serve, puoi anche toglierlo)

import Image from 'next/image';
import React from 'react';

const BACKGROUND_URL =
  'https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/lovable-uploads/c831b7bb-854d-47ef-8419-36b5e63d7cff.png';

const GiftCardHero: React.FC = () => {
  return (
    <section className="relative py-20 text-white overflow-hidden">
      {/* Immagine di sfondo ottimizzata */}
      <Image
        src={BACKGROUND_URL}
        alt="Carte regalo WeShoot"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center brightness-50"
      />
      {/* Overlay scuro */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Carte regalo WeShoot
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Il viaggio del futuro comincia adesso con i nostri buoni regalo.
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Sorprendi chi ami con un'esperienza indimenticabile. I nostri buoni regalo sono
          perfetti per ogni occasione e permettono di scegliere tra tutti i nostri viaggi
          fotografici.
        </p>
      </div>
    </section>
  );
};

export default GiftCardHero;
