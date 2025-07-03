
import React from 'react';
import IconWithTextSection from './IconWithTextSection';
import { Users, Star, MapPin, Camera, Heart, Award } from 'lucide-react';

const WhySection: React.FC = () => {
  const whyColumns = [
    {
      icon: Users,
      title: "Piccoli Gruppi",
      subtitle: "Massimo 10-12 partecipanti per garantire un'attenzione personalizzata e un'esperienza più intima"
    },
    {
      icon: Star,
      title: "Coach Esperti",
      subtitle: "Fotografi professionali certificati che ti guideranno in ogni scatto e tecnica fotografica"
    },
    {
      icon: MapPin,
      title: "Destinazioni Uniche",
      subtitle: "Luoghi selezionati per la loro bellezza e il potenziale fotografico straordinario"
    },
    {
      icon: Camera,
      title: "Attrezzatura Professionale",
      subtitle: "Supporto nell'uso di attrezzature professionali e consigli per migliorare la tua tecnica"
    },
    {
      icon: Heart,
      title: "Passione Condivisa",
      subtitle: "Un'esperienza che unisce la passione per la fotografia con l'amore per il viaggio"
    },
    {
      icon: Award,
      title: "Qualità Garantita",
      subtitle: "Oltre 15 anni di esperienza nell'organizzazione di viaggi fotografici di alta qualità"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Perché scegliere WeShoot?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La nostra esperienza e passione ti garantiscono un viaggio fotografico indimenticabile
          </p>
        </div>
        
        <IconWithTextSection columns={whyColumns} />
      </div>
    </section>
  );
};

export default WhySection;
