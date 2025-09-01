"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import type { Coach } from "./CoachesList";

function normalizeInstagramUrl(raw?: string | null) {
  if (!raw) return undefined;
  let s = raw.trim();
  if (!s) return undefined;
  if (s.startsWith("@")) s = s.slice(1);
  if (/^[A-Za-z0-9._]+$/.test(s)) return `https://instagram.com/${s}`;
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

export default function CoachCard({ coach }: { coach: Coach }) {
  const name =
    [coach.firstName, coach.lastName].filter(Boolean).join(" ") ||
    coach.username;
  const initials =
    (coach.firstName?.[0] || coach.username?.[0] || "C").toUpperCase() +
    (coach.lastName?.[0] || "");

  const igUrl = normalizeInstagramUrl(coach.instagram);
  const href = coach.href || `/fotografi/${coach.slug || coach.username}`;

  return (
    <article className="flex flex-col items-center text-center rounded-3xl border bg-card text-card-foreground p-6 shadow-sm">
      {/* Avatar (cliccabile) */}
      <Link
        href={href}
        className="relative h-40 w-40 overflow-hidden rounded-full ring-4 ring-white dark:ring-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Apri la pagina di ${name}`}
      >
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
      </Link>

      {/* Nome (cliccabile) */}
      <h3 className="mt-6 text-xl font-bold leading-snug text-foreground">
        <Link
          href={href}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          {name}
        </Link>
      </h3>

      {/* Username */}
      {coach.username && (
        <p className="mt-1 text-sm text-muted-foreground">@{coach.username}</p>
      )}

      {/* Instagram (separato, niente nesting) */}
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
