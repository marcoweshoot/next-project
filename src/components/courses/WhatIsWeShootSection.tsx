// components/courses/WhatIsWeShootSection.tsx
import React from 'react';

const WHAT_IS_WESHOOT_PARAGRAPHS: string[] = [
  `Vuoi portare a casa lo scatto perfetto? Vuoi far fare Wow alle persone a cui mostri i tuoi scatti? Se la risposta a queste domande è SI, allora il metodo WeShoot è quello che stavi cercando.`,
  `WeShoot è il punto di riferimento Italiano per la fotografia di paesaggio. È quella community di persone che avremmo sempre voluto trovare al nostro fianco quando abbiamo imparato la fotografia più di 10 anni fa.`,
  `Se anche tu quando vedi quelle foto incredibili su Instagram dei paesaggi da urlo vuoi capire cosa succede dietro alle quinte per realizzarle, allora sei nel posto giusto.`,
  `WeShoot ha sviluppato negli ultimi 10 anni un metodo di insegnamento che abbiamo portato sul campo durante i viaggi fotografici, a lezione in aula e durante ogni webinar sul gruppo di Facebook.`,
];

const WhatIsWeShootSection: React.FC = () => {
  return (
    <section className="py-16 bg-background" aria-labelledby="what-is-weshoot-title">
      <div className="container">
        <div className="mb-12 text-center">
          <h2
            id="what-is-weshoot-title"
            className="mb-4 text-3xl font-bold text-foreground text-balance"
          >
            Cosa è WeShoot?
          </h2>
        </div>

        <div className="prose prose-lg max-w-4xl mx-auto dark:prose-invert">
          {WHAT_IS_WESHOOT_PARAGRAPHS.map((text, idx) => (
            <p key={idx} className="leading-relaxed">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(WhatIsWeShootSection);
