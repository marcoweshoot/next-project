// src/components/coaches/CoachCard.tsx
import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import type { Coach } from './CoachesList'; // o aggiorna il path dell'interfaccia se diverso

function normalizeInstagramUrl(raw?: string) {
  if (!raw) return undefined;
  let s = raw.trim();
  if (!s) return undefined;
  if (s.startsWith('@')) s = s.slice(1);
  if (/^[A-Za-z0-9._]+$/.test(s)) return `https://instagram.com/${s}`;
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

export default function CoachCard({ coach }: { coach: Coach }) {
  const name = [coach.firstName, coach.lastName].filter(Boolean).join(' ') || coach.username;
  const initials =
    (coach.firstName?.[0] || coach.username?.[0] || 'C').toUpperCase() +
    (coach.lastName?.[0] || '');

  const igUrl = normalizeInstagramUrl(coach.instagram);

  return (
    <article className="flex flex-col items-center text-center rounded-3xl border bg-card text-card-foreground p-6 shadow-sm">
      {/* Avatar */}
      <div className="relative h-40 w-40 overflow-hidden rounded-full ring-4 ring-white dark:ring-white/80">
        {coach.profilePicture?.url ? (
          <Image
            src={coach.profilePicture.url}
            alt={coach.profilePicture.alternativeText || name}
            fill
            sizes="160px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-2xl font-bold text-primary">
            {initials}
          </div>
        )}
      </div>

      {/* Nome */}
      <h3 className="mt-6 text-xl font-bold leading-snug text-foreground">{name}</h3>

      {/* Username (se utile) */}
      {coach.username && (
        <p className="mt-1 text-sm text-muted-foreground">@{coach.username}</p>
      )}

      {/* Instagram */}
      {igUrl && (
        <a
          href={igUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Apri Instagram di ${name}`}
          title={`Segui ${name} su Instagram`}
        >
          <Instagram className="h-5 w-5" />
        </a>
      )}
    </article>
  );
}
