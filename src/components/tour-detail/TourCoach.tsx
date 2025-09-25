'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Instagram } from 'lucide-react';

/**
 * NOTE PRINCIPALI DEL REFACOTOR
 * 1) Tailwind: niente classi dinamiche nel template (purge le perderebbe). Ora usiamo stringhe letterali
 *    predefinite per le grid-cols in base al numero di coach.
 * 2) Fallback avatar: supporto opzionale a un'immagine di fallback (es. TEACHER_AVATAR) via prop
 *    `fallbackAvatarSrc` + onError per ripiegare sempre su quella.
 * 3) Accessibilità e UX: link Instagram come <a> dentro <Button asChild>, target _blank con rel
 *    noopener noreferrer, aria-label. Alt testuale più robusto.
 * 4) Chiavi stabili: preferiamo instagram o nome completo invece dell'indice.
 */

interface Coach {
  firstName?: string;
  lastName?: string;
  bio?: string; // HTML già sanificato lato CMS
  profilePicture?: {
    url?: string;
    alternativeText?: string;
  };
  instagram?: string; // handle (es. @nome) o URL completo (https://...)
  role?: string | { name?: string }; // 'coach', 'user', etc. o oggetto con name
  isCoach?: boolean; // flag per identificare i coach
  username?: string; // username per identificazione
  email?: string; // email per identificazione
}

interface TourCoachProps {
  coaches: Coach[];
  isFallbackPast?: boolean;
  children?: React.ReactNode;
  /**
   * Immagine di fallback da usare se un coach non ha `profilePicture` o se l'immagine fallisce il caricamento.
   * Esempio: import { TEACHER_AVATAR } from '@/constants/assets'
   */
  fallbackAvatarSrc?: string;
}

const getCoachDisplayName = (coach: Coach) => {
  const first = coach.firstName?.trim() || '';
  const last = coach.lastName?.trim() || '';
  if (first || last) return `${first} ${last}`.trim();
  return 'Coach';
};

const getCoachInitial = (coach: Coach) => {
  return (coach.firstName?.[0] || coach.lastName?.[0] || 'C').toUpperCase();
};

// Funzione per determinare se un utente è realmente un coach
const isRealCoach = (coach: Coach) => {
  // Controlla se role è un oggetto o una stringa
  const roleName = typeof coach.role === 'object' ? coach.role?.name : coach.role;
  
  return roleName === 'coach' || 
         coach.isCoach === true || 
         (coach.firstName && coach.firstName.toLowerCase() === 'lorenzo') ||
         (coach.username && coach.username.toLowerCase().includes('coach')) ||
         (coach.email && coach.email.includes('weshoot'));
};

const pickGridCols = (count: number) => {
  // Classi letterali per evitare il purge di Tailwind
  if (count <= 1) return 'md:grid-cols-1';
  if (count === 2) return 'md:grid-cols-2';
  // 3 o più
  return 'md:grid-cols-2 lg:grid-cols-3';
};

// Normalizza l'input IG: accetta url completi, handle con o senza '@', o domini senza protocollo
const normalizeInstagramUrl = (raw?: string) => {
  if (!raw) return undefined;
  let s = raw.trim();
  if (!s) return undefined;
  if (s.startsWith('@')) s = s.slice(1);
  // Se è un semplice handle (lettere, numeri, underscore e punti), crea l'URL canonico
  if (/^[A-Za-z0-9._]+$/.test(s)) return `https://instagram.com/${s}`;
  // Se non c'è protocollo, aggiungilo
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
};

const TourCoach: React.FC<TourCoachProps> = ({
  coaches,
  isFallbackPast = false,
  children,
  fallbackAvatarSrc,
}) => {
  if (!coaches || coaches.length === 0) {
    return (
      <section id="coach" className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">I nostri Coaches</h2>
          <p className="text-lg text-muted-foreground mb-4">
            {isFallbackPast
              ? 'Non ci sono coach attivi nelle prossime sessioni, questi sono coach delle sessioni passate.'
              : 'Coach non ancora assegnati per le prossime sessioni.'}
          </p>
          {children}
        </div>
      </section>
    );
  }

  const single = coaches.length === 1;
  const title = single ? 'Il tuo Coach' : 'I nostri Coaches';
  const subtitle = single
    ? 'Scopri chi ti accompagnerà in questa avventura fotografica'
    : 'Scopri il coach che ti accompagnerà in questa avventura';

  const gridCols = pickGridCols(coaches.length);

  const renderCard = (coach: Coach, idx: number) => {
    const coachName = getCoachDisplayName(coach);
    const alt = coach.profilePicture?.alternativeText?.trim() || `Ritratto di ${coachName}`;
    const key = coach.instagram || `${coach.firstName || ''}-${coach.lastName || ''}` || String(idx);

    // Se esiste un'immagine usala; altrimenti prova il fallback esterno
    const imgSrc = coach.profilePicture?.url || fallbackAvatarSrc;

    return (
      <Card key={key} className="h-full bg-card text-card-foreground border border-border">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-4">
            {imgSrc ? (
              <AvatarImage
                src={imgSrc}
                alt={alt}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={80}
                height={80}
                sizes="80px"
                onError={(e) => {
                  // Se l'immagine specifica fallisce, ripiega sul fallback globale (se presente)
                  if (fallbackAvatarSrc && (e.currentTarget as HTMLImageElement).src !== fallbackAvatarSrc) {
                    (e.currentTarget as HTMLImageElement).src = fallbackAvatarSrc;
                  }
                }}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-lg font-bold">
                {getCoachInitial(coach)}
              </AvatarFallback>
            )}
          </Avatar>

          <h3 className="text-lg font-bold mb-2 text-foreground">{coachName}</h3>

          {/* Mostra il badge "Fotografo Certificato" solo per i coach reali */}
          {isRealCoach(coach) && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <Badge variant="secondary" className="text-xs">Fotografo Certificato</Badge>
            </div>
          )}

          {coach.bio && (
            <div
              className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 text-center"
              // Assicurati che la bio sia sanificata lato CMS (es. con DOMPurify) se contiene HTML
              dangerouslySetInnerHTML={{ __html: coach.bio }}
            />
          )}

          {(() => {
            const igUrl = normalizeInstagramUrl(coach.instagram);
            if (!igUrl) return null;
            return (
              <a
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background mt-auto"
                aria-label={`Apri Instagram di ${coachName}`}
                title={`Segui ${coachName} su Instagram`}
              >
                <Instagram className="h-5 w-5" aria-hidden="true" />
              </a>
            );
          })()}
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="coach" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
          {isFallbackPast && (
            <p className="text-sm text-muted-foreground mt-1">
              Questi coach fanno parte di sessioni passate perché non ce ne sono di future al momento.
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <div className={`grid grid-cols-1 ${gridCols} gap-6 max-w-4xl w-full`}>
            {coaches.map(renderCard)}
          </div>
        </div>

        {children}
      </div>
    </section>
  );
};

export default TourCoach;
