
import React from 'react';
import IconWithTextSection from './IconWithTextSection';
import { Compass, BookOpen, Globe, Coffee, Mountain, Sunset } from 'lucide-react';

const WhatIsWeShootSection: React.FC = () => {
  const whatsColumns = [
    {
      icon: Compass,
      title: "Avventura",
      subtitle: "Ogni viaggio è un'avventura unica che ti porterà alla scoperta di luoghi straordinari e momenti irripetibili"
    },
    {
      icon: BookOpen,
      title: "Apprendimento",
      subtitle: "Impara dai migliori fotografi professionali attraverso workshop pratici e sessioni di formazione personalizzate"
    },
    {
      icon: Globe,
      title: "Esplorazione",
      subtitle: "Esplora il mondo attraverso l'obiettivo della tua fotocamera, catturando l'essenza di ogni destinazione"
    },
    {
      icon: Coffee,
      title: "Comunità",
      subtitle: "Unisciti a una comunità di appassionati di fotografia e crea legami duraturi con persone che condividono la tua passione"
    },
    {
      icon: Mountain,
      title: "Natura",
      subtitle: "Immergiti nella natura più selvaggia e spettacolare, dai ghiacciai artici alle savane africane"
    },
    {
      icon: Sunset,
      title: "Emozioni",
      subtitle: "Vivi emozioni intense catturando l'alba perfetta, il tramonto dorato o l'aurora boreale danzante"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cosa è WeShoot?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Siamo molto più di un'agenzia viaggi: siamo i tuoi compagni di avventura fotografica
          </p>
        </div>
        
        <IconWithTextSection columns={whatsColumns} />
      </div>
    </section>
  );
};

export default WhatIsWeShootSection;
