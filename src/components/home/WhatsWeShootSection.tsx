import React from "react";
import {
  Camera,
  BookOpen,
  Globe,
  Coffee,
  Mountain,
  Sunset,
} from "lucide-react";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const features: FeatureItem[] = [
  {
    icon: Camera,
    title: "Avventura",
    subtitle:
      "Ogni viaggio è un'avventura unica che ti porterà alla scoperta di luoghi straordinari e momenti irripetibili",
  },
  {
    icon: BookOpen,
    title: "Apprendimento",
    subtitle:
      "Impara dai migliori fotografi professionali attraverso workshop pratici e sessioni di formazione personalizzate",
  },
  {
    icon: Globe,
    title: "Esplorazione",
    subtitle:
      "Esplora il mondo attraverso l'obiettivo della tua fotocamera, catturando l'essenza di ogni destinazione",
  },
  {
    icon: Coffee,
    title: "Comunità",
    subtitle:
      "Unisciti a una community di appassionati di fotografia e crea legami duraturi con persone che condividono la tua passione",
  },
  {
    icon: Mountain,
    title: "Natura",
    subtitle:
      "Immergiti nella natura più selvaggia e spettacolare, dai ghiacciai artici alle savane africane",
  },
  {
    icon: Sunset,
    title: "Emozioni",
    subtitle:
      "Vivi emozioni intense catturando l'alba perfetta, il tramonto dorato o l'aurora boreale danzante",
  },
];

const WhatsWeShootSection: React.FC = () => (
  <section id="cosa-e-weshoot" className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Cosa è WeShoot?
        </h2>
        <h3 className="text-xl text-gray-600 max-w-3xl mx-auto">
          Siamo molto più di un'agenzia viaggi: siamo i tuoi compagni di
          avventura fotografica
        </h3>
      </header>

      <div
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {features.map(({ icon: Icon, title, subtitle }) => (
          <div
            key={title}
            role="listitem"
            className="text-center flex flex-col items-center px-4"
          >
            <div
              className="mb-4 rounded-full bg-red-100 p-4"
              aria-hidden="true"
            >
              <Icon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-base text-gray-600">{subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatsWeShootSection;
