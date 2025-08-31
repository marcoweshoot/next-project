// components/courses/CoursesFeatures.tsx
import React from 'react';
import IconWithTextSection from '@/components/IconWithTextSection';
import { BookOpen, Users, Trophy } from 'lucide-react';

const iconColumns = [
  {
    icon: BookOpen,
    title: 'Contenuti di Qualità',
    subtitle:
      'Impara con videocorsi professionali e materiali didattici curati nei minimi dettagli.',
  },
  {
    icon: Users,
    title: 'Community Esclusiva',
    subtitle:
      'Entra a far parte della community WeShoot e condividi la tua passione con altri fotografi.',
  },
  {
    icon: Trophy,
    title: 'Certificazione',
    subtitle:
      'Ottieni certificati riconosciuti che attestano le tue competenze fotografiche.',
  },
];

const CoursesFeatures: React.FC = () => {
  return (
    <section className="py-16 bg-muted transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Perché Scegliere i Nostri Corsi
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            L'Accademia WeShoot offre un percorso completo per diventare un fotografo professionista
          </p>
        </div>
        <IconWithTextSection columns={iconColumns} />
      </div>
    </section>
  );
};

export default React.memo(CoursesFeatures);
