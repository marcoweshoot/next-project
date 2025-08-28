import React from "react";
import { Camera, BookOpen, Globe, Coffee, Mountain, Sunset } from "lucide-react";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

const features: FeatureItem[] = [
  { icon: Camera,  title: "Avventura",     subtitle: "Ogni viaggio è un'avventura unica che ti porterà alla scoperta di luoghi straordinari e momenti irripetibili" },
  { icon: BookOpen, title: "Apprendimento", subtitle: "Impara dai migliori fotografi professionali attraverso workshop pratici e sessioni di formazione personalizzate" },
  { icon: Globe,    title: "Esplorazione",  subtitle: "Esplora il mondo attraverso l'obiettivo della tua fotocamera, catturando l'essenza di ogni destinazione" },
  { icon: Coffee,   title: "Comunità",      subtitle: "Unisciti a una community di appassionati di fotografia e crea legami duraturi con persone che condividono la tua passione" },
  { icon: Mountain, title: "Natura",        subtitle: "Immergiti nella natura più selvaggia e spettacolare, dai ghiacciai artici alle savane africane" },
  { icon: Sunset,   title: "Emozioni",      subtitle: "Vivi emozioni intense catturando l'alba perfetta, il tramonto dorato o l'aurora boreale danzante" },
];

const WhatsWeShootSection: React.FC = () => (
  <section id="cosa-e-weshoot" className="py-16 bg-muted" aria-labelledby="weshoot-title">
    <div className="container">
      <header className="mb-12 text-center">
        <h2 id="weshoot-title" className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
          Cosa è WeShoot?
        </h2>
        <h3 className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Siamo molto più di un'agenzia viaggi: siamo i tuoi compagni di
          avventura fotografica
        </h3>
      </header>

      <div role="list" className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} role="listitem" className="flex flex-col items-center px-4 text-center">
            <div
              aria-hidden="true"
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20"
            >
              <Icon className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-base text-muted-foreground">{subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhatsWeShootSection;
