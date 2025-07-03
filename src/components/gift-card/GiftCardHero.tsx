
import React from 'react';

const GiftCardHero: React.FC = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      {/* Background overlay with travel images */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="absolute inset-0 bg-[url('/lovable-uploads/c831b7bb-854d-47ef-8419-36b5e63d7cff.png')] bg-cover bg-center opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Carte regalo WeShoot
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Il viaggio del futuro comincia adesso con i nostri buoni regalo.
        </p>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Sorprendi chi ami con un'esperienza indimenticabile. I nostri buoni regalo sono perfetti per ogni occasione e permettono di scegliere tra tutti i nostri viaggi fotografici.
        </p>
      </div>
    </section>
  );
};

export default GiftCardHero;
