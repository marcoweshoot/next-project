'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle } from 'lucide-react';

interface ThingToKnow {
  id: string;
  title: string;
  description: string;
  icon?: {
    url: string;
    alternativeText?: string;
  };
}

interface TourThingsToKnowProps {
  experienceLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  things2know?: ThingToKnow[]; // 👈 uso il nome corretto come da GraphQL
}

const TourThingsToKnow: React.FC<TourThingsToKnowProps> = ({
  experienceLevel,
  difficulty,
  things2know = [], // 👈 default per evitare undefined
}) => {
  const getDifficultyInfo = (level?: string) => {
    switch (level) {
      case 'easy':
        return {
          label: 'Facile',
          desc: 'Adatto a tutti i livelli: per chi vuole imparare o ripassare le basi della fotografia di paesaggio o per chi vuole iniziare a fare un salto di qualità',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-100 dark:bg-green-400/20',
        };
      case 'medium':
        return {
          label: 'Medio',
          desc: 'Per chi ha pieno controllo della fotocamera e vuole lavorare su tecniche complesse: astro, focus stacking, panorami multi-riga, blending di esposizioni e workflow rigoroso.',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-100 dark:bg-yellow-400/20',
        };
      case 'hard':
        return {
          label: 'Difficile',
          desc: 'Per chi cerca una sfida vera e vuole spingersi oltre: creatività, precisione e spot non convenzionali lontano dalle rotte comuni.',
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-400/20',
        };
      default:
        return {
          label: 'Da valutare',
          desc: 'Contattaci per maggiori informazioni...',
          color: 'text-muted-foreground',
          bg: 'bg-muted',
        };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  return (
    <section id="things-to-know" className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Cose da Sapere</h2>
          <p className="text-lg text-muted-foreground">
            Informazioni importanti per il tuo viaggio fotografico
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Difficulty */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${difficultyInfo.bg} rounded-lg flex items-center justify-center`}
                >
                  <AlertTriangle className={`w-5 h-5 ${difficultyInfo.color}`} />
                </div>
                Livello di Difficoltà
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-semibold ${difficultyInfo.color} mb-2`}>
                {difficultyInfo.label}
              </div>
              <p className="text-muted-foreground">{difficultyInfo.desc}</p>
            </CardContent>
          </Card>

          {/* Consigli */}
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Consigli Generali
              </CardTitle>
            </CardHeader>
            <CardContent>
            {things2know.length > 0 ? (
                <ul className="space-y-6">
                  {things2know.map((item, index) => (
                    <li key={item.id || `thing-${index}`} className="flex items-start gap-3">
                      {item.icon?.url && (
                        <Image
                          src={item.icon.url}
                          alt={item.icon.alternativeText || item.title}
                          width={24}
                          height={24}
                          className="mt-1 object-contain"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {item.title}
                        </h4>
                        <div
                          className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nessun consiglio specifico disponibile.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TourThingsToKnow;
