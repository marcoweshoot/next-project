import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Users, ArrowRight } from "lucide-react";
import { getTourLink } from "@/components/tour-card/tourCardUtils";
import { getFullMediaUrl, DEFAULT_COACH_AVATAR } from "@/utils/TourDataUtilis";

interface TourSession {
  id: string;
  startDate: string;
  endDate: string;
  status:
    | "scheduled"
    | "confirmed"
    | "almostConfirmed"
    | "almostFull"
    | "waitingList"
    | "soldOut"
    | string;
  price: number;
  currency: string;
  availableSpots?: number;
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: number;
    difficulty?: string;
    experience_level?: string;
    places: { slug: string }[];
    states: { slug: string }[];
    coach: {
      id: string;
      name: string;
      avatar?: {
        url: string;
        alt?: string;
      };
    };
  };
}

interface CalendarSessionProps {
  session: TourSession;
  isLast: boolean;
}

/** Helpers fuso Europe/Rome (stabili tra SSR e client) */
const ROME_TZ = "Europe/Rome";

/** Estrae Y/M/D della data secondo il fuso Europe/Rome */
function getRomeYMD(date: Date) {
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);
  const d = Number(parts.find((p) => p.type === "day")!.value);
  return { y, m, d };
}

/** Ritorna il timestamp UTC della mezzanotte "Rome" di quella Y/M/D */
function romeYMDToUTCMidnight({ y, m, d }: { y: number; m: number; d: number }) {
  return Date.UTC(y, m - 1, d);
}

/** Converte ISO string in Date valida oppure null */
function safeDate(iso: string) {
  const x = new Date(iso);
  return isNaN(x.getTime()) ? null : x;
}

/** Calcola il numero di giorni inclusivo nel fuso Europe/Rome */
function inclusiveDaysRome(startISO: string, endISO: string) {
  const start = safeDate(startISO);
  const end = safeDate(endISO);
  if (!start || !end) return 1;

  const sKey = romeYMDToUTCMidnight(getRomeYMD(start));
  const eKey = romeYMDToUTCMidnight(getRomeYMD(end));

  let days = Math.round((eKey - sKey) / 86400000) + 1; // +1 inclusivo
  if (days < 1) days = 1;
  return days;
}

/** Ritorna true se la sessione è "nel futuro" rispetto alla mezzanotte di oggi (Rome) */
function isFutureByRomeMidnight(startISO: string) {
  const start = safeDate(startISO);
  if (!start) return false;

  const now = new Date();
  const todayRomeKey = romeYMDToUTCMidnight(getRomeYMD(now));
  const startRomeKey = romeYMDToUTCMidnight(getRomeYMD(start));

  return startRomeKey >= todayRomeKey;
}

/** Formattazione date (giorno e mese) nel fuso Europe/Rome */
function formatDateRome(dateString: string) {
  const date = safeDate(dateString);
  if (!date) {
    return { day: 1, month: "GEN", fullDate: "1 gen" };
  }

  const { d } = getRomeYMD(date);
  const monthShort = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TZ,
    month: "short",
  })
    .format(date)
    .toUpperCase();

  const fullDate = new Intl.DateTimeFormat("it-IT", {
    timeZone: ROME_TZ,
    day: "numeric",
    month: "short",
  }).format(date);

  return { day: d, month: monthShort, fullDate };
}

const CalendarSession: React.FC<CalendarSessionProps> = ({ session, isLast }) => {
  const startDateInfo = formatDateRome(session.startDate);
  const endDateInfo = formatDateRome(session.endDate);

  const isFutureSession = isFutureByRomeMidnight(session.startDate);

  const durationDays = inclusiveDaysRome(session.startDate, session.endDate);
  const durationLabel = `${durationDays} ${durationDays === 1 ? "giorno" : "giorni"}`;

  const tourLink = getTourLink(session.tour);

  const coachAvatarUrl = session.tour.coach?.avatar?.url
    ? getFullMediaUrl(session.tour.coach.avatar.url)
    : DEFAULT_COACH_AVATAR;
  const coachAlt = session.tour.coach?.avatar?.alt || session.tour.coach.name;

  const formattedPrice =
    session.price > 0
      ? new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: session.currency || "EUR",
          maximumFractionDigits: 0,
        }).format(session.price)
      : "Scopri";

  const norm = (s?: string) =>
    (s || "").toLowerCase().replace(/\s+/g, "").replace(/_/g, "");

  // Badge con colori leggibili anche in dark
  const getStatusBadge = (status: string, availableSpots?: number) => {
    const s = norm(status);
    switch (s) {
      case "confirmed":
      case "open":
      case "scheduled":
      case "planning":
        return (
          <Badge className="flex items-center gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            confermato
          </Badge>
        );
      case "almostfull":
      case "almostconfirmed":
        return (
          <Badge className="flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            quasi pieno
          </Badge>
        );
      case "waitinglist":
        return (
          <Badge className="flex items-center gap-1 bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30">
            <Users className="w-3 h-3" />
            lista d&apos;attesa
          </Badge>
        );
      case "soldout":
      case "closed":
        return (
          <Badge className="flex items-center gap-1 bg-neutral-500/15 text-neutral-700 dark:text-neutral-300 ring-1 ring-neutral-500/30">
            tutto pieno
          </Badge>
        );
      default:
        return availableSpots && availableSpots > 0 ? (
          <Badge className="flex items-center gap-1 bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30">
            <Users className="w-3 h-3" />
            Iscrizioni aperte
          </Badge>
        ) : (
          <Badge className="flex items-center gap-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30">
            <AlertCircle className="w-3 h-3" />
            quasi pieno
          </Badge>
        );
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
      case "facile":
        return "Facile";
      case "hard":
      case "difficile":
        return "Difficile";
      default:
        return "Intermedio";
    }
  };

  const getExperienceLabel = (experience?: string) => {
    switch ((experience || "").toLowerCase()) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzato";
      case "expert":
        return "Esperto";
      default:
        return "Tutti i livelli";
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center p-4 md:p-6 ${
        !isLast ? "border-b border-border" : ""
      } hover:bg-muted transition-colors`}
    >
      <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
        {/* Desktop */}
        <div className="hidden sm:block">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{startDateInfo.day}</div>
              <div className="text-xs font-medium text-muted-foreground">{startDateInfo.month}</div>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="w-4 h-4 text-red-600 mb-1" />
              <div className="text-xs font-medium text-red-600 whitespace-nowrap">
                {durationLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{endDateInfo.day}</div>
              <div className="text-xs font-medium text-muted-foreground">{endDateInfo.month}</div>
            </div>
          </div>
          <div className="text-center mt-2 text-sm text-muted-foreground">
            {getDifficultyLabel(session.tour.difficulty)} •{" "}
            {getExperienceLabel(session.tour.experience_level)}
          </div>
        </div>

        {/* Mobile */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between bg-muted rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{startDateInfo.day}</div>
                <div className="text-xs font-medium text-muted-foreground">{startDateInfo.month}</div>
              </div>
              <ArrowRight className="w-3 h-3 text-red-600" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{endDateInfo.day}</div>
                <div className="text-xs font-medium text-muted-foreground">{endDateInfo.month}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-red-600">{durationLabel}</div>
            </div>
          </div>
          <div className="text-center mt-1 text-xs text-muted-foreground">
            {getDifficultyLabel(session.tour.difficulty)} •{" "}
            {getExperienceLabel(session.tour.experience_level)}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 mb-4 md:mb-0">
        <h3 className="text-lg md:text-xl font-bold text-red-600 mb-2 hover:text-red-700 transition-colors">
          <Link href={tourLink}>{session.tour.title}</Link>
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <Image
              src={coachAvatarUrl}
              alt={coachAlt}
              width={24}
              height={24}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>{session.tour.coach.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(session.status, session.availableSpots)}
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start md:text-right md:ml-6">
        <div className="text-2xl md:text-3xl font-bold text-foreground mb-0 md:mb-2">
          {isFutureSession ? (
            formattedPrice
          ) : (
            <span className="text-lg md:text-xl text-orange-600 font-semibold">Coming Soon</span>
          )}
        </div>
        <Button
          asChild
          className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 text-sm md:text-base"
        >
          <Link href={tourLink}>SCOPRI VIAGGIO</Link>
        </Button>
      </div>
    </div>
  );
};

export default CalendarSession;
