import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Backpack } from 'lucide-react';

interface TourEquipmentProps {
  thingsNeeded?: string;
  /** Valori attesi da Strapi: "dinamico" | "intenso" | "sfida" (case-insensitive). */
  experienceLevel?: string;
}

type ExperienceInfo = {
  key: 'dinamico' | 'intenso' | 'sfida' | 'generic';
  label: string;
  short: string;
  bullets?: string[];
  metrics?: string; // es. "6–12 km · D+ 200–600 m · 4–7 h"
  // classi colore (Tailwind) per icona/titolo
  colorText: string;
  colorBg: string;
};

const EXPERIENCE_MAP: Record<string, ExperienceInfo> = {
  dinamico: {
    key: 'dinamico',
    label: 'Dinamico',
    short:
      'Si cammina con calma su percorsi facili. Ritmo rilassato, adatto a tutti.',
    bullets: [
      '1–2 sessioni al giorno (alba oppure tramonto).',
      'Spostamenti brevi, terreni semplici, zaino leggero.',
      'Perfetto come prima esperienza di viaggio fotografico.',
    ],
    metrics: '3–6 km · D+ 100–250 m · 2–4 h complessive',
    colorText: 'text-emerald-600 dark:text-emerald-400',
    colorBg: 'bg-emerald-600/10 dark:bg-emerald-400/15',
  },
  intenso: {
    key: 'intenso',
    label: 'Intenso',
    short:
      'Giornate piene: si cammina di più e possono esserci piccoli trekking. Ritmi serrati tra alba, tramonto e possibile notturna.',
    bullets: [
      '2–3 sessioni fotografiche al giorno.',
      'Qualche tratto ripido/breve, serve un minimo di allenamento.',
      'Sveglie presto e pause mirate per seguire la luce.',
    ],
    metrics: '6–12 km · D+ 200–600 m · 4–7 h complessive',
    colorText: 'text-orange-600 dark:text-orange-400',
    colorBg: 'bg-orange-600/10 dark:bg-orange-400/15',
  },
  sfida: {
    key: 'sfida',
    label: 'Sfida',
    short:
      'Avventura a 360°: trekking importanti, possibili notti in tenda e terreni tecnici per raggiungere spot remoti.',
    bullets: [
      'Trekking lunghi e dislivelli marcati, zaino più pesante.',
      'Sessioni a orari “estremi” e logistica essenziale.',
      'Richiesta buona forma fisica ed esperienza in montagna.',
    ],
    metrics: '12–20+ km · D+ 600–1200+ m · 6–10 h complessive',
    colorText: 'text-rose-600 dark:text-rose-400',
    colorBg: 'bg-rose-600/10 dark:bg-rose-400/15',
  },
  generic: {
    key: 'generic',
    label: 'Non specificato',
    short:
      'Il livello di esperienza verrà indicato nella scheda del singolo viaggio.',
    bullets: [],
    metrics: undefined,
    colorText: 'text-foreground',
    colorBg: 'bg-muted',
  },
};

const normalize = (s?: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const resolveExperience = (level?: string): ExperienceInfo => {
  const key = normalize(level);

  // Sinonimi/fallback possibili da Strapi
  const alias: Record<string, 'dinamico' | 'intenso' | 'sfida'> = {
    dynamic: 'dinamico',
    easy: 'dinamico',
    relaxed: 'dinamico',

    intense: 'intenso',
    intermediate: 'intenso',
    busy: 'intenso',

    challenge: 'sfida',
    hard: 'sfida',
    advanced: 'sfida',
    expert: 'sfida',
  };

  const mapped = (['dinamico', 'intenso', 'sfida'] as const).includes(
    key as any
  )
    ? (key as 'dinamico' | 'intenso' | 'sfida')
    : alias[key];

  if (mapped) return EXPERIENCE_MAP[mapped];
  return EXPERIENCE_MAP.generic;
};

const TourEquipment: React.FC<TourEquipmentProps> = ({
  thingsNeeded,
  experienceLevel,
}) => {
  if (!thingsNeeded && !experienceLevel) return null;

  const info = resolveExperience(experienceLevel);

  return (
    <section className="py-16 bg-background" id="equipment">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Attrezzatura e Preparazione
            </h2>
            <p className="text-lg text-muted-foreground">
              Tutto quello che devi sapere per prepararti al meglio
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Esperienza */}
            {experienceLevel && (
              <Card className="h-full bg-card text-card-foreground border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${info.colorBg}`}
                    >
                      <Camera className={`w-5 h-5 ${info.colorText}`} />
                    </div>
                    <span className="text-foreground">Tipo di Esperienza</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-lg font-semibold mb-2 ${info.colorText}`}>
                    {info.label}
                  </p>

                  <p className="text-muted-foreground mb-4">{info.short}</p>

                  {info.bullets && info.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {info.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {info.metrics && (
                    <div className="mt-4 inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
                      {info.metrics}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Dati orientativi: per maggiori dettagli sul viaggio fotografico contattaci.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attrezzatura */}
            {thingsNeeded && (
              <Card className="h-full bg-card text-card-foreground border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600/10 dark:bg-blue-400/15">
                      <Backpack className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-foreground">Attrezzatura Consigliata</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: thingsNeeded }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourEquipment;
