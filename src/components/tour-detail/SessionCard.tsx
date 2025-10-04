"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { getTourLink } from "@/components/tour-card/tourCardUtils";
import { getFullMediaUrl, DEFAULT_COACH_AVATAR } from "@/utils/TourDataUtilis";
import { SimpleCheckoutModal } from "@/components/payment/SimpleCheckoutModal";

interface SessionCardProps {
  session: {
    id: string;
    start: string;
    end: string;
    status: string; // GraphQL/Stripe status
    price: number;
    currency?: string;
    maxPax: number;
    deposit?: number;
    balance?: number;
    users?: Array<{
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      profilePicture?: {
        id: string;
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  tour: {
    id: string;
    title: string;
    slug: string;
    states?: { slug: string }[];
    places?: { slug: string }[];
  };
  coach: {
    id: string;
    name: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
  isNext?: boolean;
  ctaLabel?: string; // default: WHATSAPP
  /** Mostra/nasconde il bottone "PAGA ORA" (default: false = nascosto) */
  showPaymentButton?: boolean;
  user?: {
    id: string;
    email: string;
  } | null;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  tour,
  coach,
  isNext = false,
  ctaLabel = "WHATSAPP",
  showPaymentButton = false,
  user = null,
}) => {
  const [isQuickCheckoutOpen, setIsQuickCheckoutOpen] = useState(false);
  
  const safeParse = (d: string) => {
    const x = new Date(d);
    return isNaN(x.getTime()) ? null : x;
  };

  const formatDateRange = (start: string, end: string) => {
    const s = safeParse(start);
    const e = safeParse(end);
    if (!s || !e) return { dateRange: "Date TBC", year: "" };

    const year = s.getFullYear().toString();
    
    // Se è lo stesso giorno (workshop di 1 giorno), mostra solo una data
    const sameDay = s.getDate() === e.getDate() && 
                   s.getMonth() === e.getMonth() && 
                   s.getFullYear() === e.getFullYear();
    
    if (sameDay) {
      const day = s.getDate();
      const month = s.toLocaleDateString("it-IT", { month: "long" });
      const dateRange = `${day} ${month}`;
      return { dateRange, year };
    }

    // Se sono giorni diversi, mostra il range
    const sameMonth = s.getMonth() === e.getMonth();
    const startDay = s.getDate();
    const endDay = e.getDate();
    const startMonth = s.toLocaleDateString("it-IT", { month: "long" });
    const endMonth = e.toLocaleDateString("it-IT", { month: "long" });

    const dateRange = sameMonth
      ? `${startDay} - ${endDay} ${startMonth}`
      : `${startDay} ${startMonth} - ${endDay} ${endMonth}`;

    return { dateRange, year };
  };

  const getDuration = (start: string, end: string) => {
    const s = safeParse(start);
    const e = safeParse(end);
    if (!s || !e) return 0;
    const diffTime = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const norm = (s?: string) => (s || "").toLowerCase();

  const getAvailableSpots = () => {
    const s = norm(session.status);
    if (["soldout", "sold_out", "closed"].includes(s)) return 0;
    if (["waitinglist", "waiting_list", "waitinglist_open"].includes(s)) return 0;

    const max = session.maxPax ?? 0;
    const registered = session.users?.length ?? 0;
    return Math.max(0, max - registered);
  };

  const openWhatsApp = () => {
    const { dateRange } = formatDateRange(session.start, session.end);
    const message = encodeURIComponent(
      `Ciao! Sono interessato al viaggio "${tour.title}" in partenza il ${dateRange}. Potresti darmi maggiori informazioni?`
    );
    window.open(`https://wa.me/393495269093?text=${message}`, "_blank");
  };

  const availableSpots = getAvailableSpots();
  const duration = getDuration(session.start, session.end);
  const price = session.price || 0;
  const currency = session.currency || "EUR";
  const { dateRange, year } = formatDateRange(session.start, session.end);

  const tourLink = getTourLink
    ? getTourLink({ slug: tour.slug, states: tour.states || [], places: tour.places || [] })
    : `/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`;

  const coachAvatarUrl = coach?.avatar?.url
    ? getFullMediaUrl(coach.avatar.url)
    : DEFAULT_COACH_AVATAR;
  const coachAlt = coach?.avatar?.alt || coach?.name || "Coach WeShoot";
  const coachName = coach?.name || "Coach WeShoot";

  const getStatusBadge = (status: string) => {
    switch (norm(status)) {
      case "scheduled":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-gray-500/15 text-gray-700 dark:text-gray-300 ring-1 ring-gray-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Iscrizioni aperte
          </Badge>
        );
      case "almostconfirmed":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Quasi confermato
          </Badge>
        );
      case "confirmed":
      case "open":
      case "planning":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Confermato
          </Badge>
        );
      case "almostfull":
      case "almost_full":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Quasi pieno
          </Badge>
        );
      case "waitinglist":
      case "waiting_list":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-white/15 text-gray-700 dark:text-gray-300 ring-1 ring-gray-500/30 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Lista d&apos;attesa
          </Badge>
        );
      case "soldout":
      case "sold_out":
      case "closed":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Tutto pieno
          </Badge>
        );
      default:
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-gray-500/15 text-gray-700 dark:text-gray-300 ring-1 ring-gray-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Iscrizioni aperte
          </Badge>
        );
    }
  };

  return (
    <>
    <Card
      className={`group relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm transition-all duration-300 hover:shadow-lg ${
        isNext ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <CardContent className="p-0">
        {isNext && (
          <div className="bg-primary text-primary-foreground text-center py-2 px-4">
            <span className="text-sm font-medium">Prossima partenza</span>
          </div>
        )}

        <div className="p-4 md:p-6">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-4">
            {/* Date Header */}
            <div className="text-center border-b border-border pb-4">
              <div className="text-2xl font-bold text-foreground mb-1">{dateRange}</div>
              <div className="text-sm text-muted-foreground">{year}</div>
            </div>

            {/* Duration and Spots */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration} giorni</span>
              </div>

              <Badge
                className={`rounded-full px-2.5 py-0.5 flex items-center gap-1 ${
                  availableSpots <= 3
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                <Users className="w-3 h-3" />
                {availableSpots > 0 ? `${availableSpots} posti` : "Tutto pieno"}
              </Badge>
            </div>

            {/* Coach */}
            <div className="flex items-center gap-3">
              <Image
                src={coachAvatarUrl}
                alt={coachAlt}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm text-foreground font-medium">{coachName}</span>
            </div>

            {/* Price and Actions */}
            <div className="pt-4 border-t border-border">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-foreground">
                  {new Intl.NumberFormat("it-IT", {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                  }).format(price)}
                </div>
                <div className="text-sm text-muted-foreground">per persona</div>
              </div>

              <div className="space-y-3">
                <Button onClick={openWhatsApp} className="w-full font-medium py-3" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {ctaLabel}
                </Button>

                {/* PAGA ORA - nuovo bottone di pagamento */}
                {showPaymentButton && (
                  <Button 
                    onClick={() => setIsQuickCheckoutOpen(true)}
                    className="w-full font-medium py-3 bg-green-600 hover:bg-green-700 text-white" 
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    PAGA ORA
                  </Button>
                )}

              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-start md:justify-between md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {dateRange} {year}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration} giorni</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={coachAvatarUrl}
                  alt={coachAlt}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-foreground">{coachName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={`rounded-full px-2.5 py-0.5 flex items-center gap-1 ${
                    availableSpots <= 3
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  {availableSpots > 0 ? `${availableSpots} posti` : "Tutto pieno"}
                </Badge>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="text-right ml-6">
              <div className="text-3xl font-bold text-foreground mb-4">
                {new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency,
                  maximumFractionDigits: 0,
                }).format(price)}
              </div>
              <div className="mb-3 flex justify-end">{getStatusBadge(session.status)}</div>

              <div className="space-y-2">
                <Button onClick={openWhatsApp} className="w-full font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {ctaLabel}
                </Button>

                {/* PAGA ORA - nuovo bottone di pagamento */}
                {showPaymentButton && !["soldout", "sold_out", "closed", "waitinglist", "waiting_list"].includes(norm(session.status)) && (
                  <Button 
                    onClick={() => setIsQuickCheckoutOpen(true)}
                    className="w-full font-medium bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    PAGA ORA
                  </Button>
                )}

              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Quick Checkout Modal */}
        <SimpleCheckoutModal
      isOpen={isQuickCheckoutOpen}
      onClose={() => setIsQuickCheckoutOpen(false)}
      session={{
        id: session.id,
        date: session.start,
        price: price,
        deposit: session.deposit || Math.round(price * 0.3), // 30% se non specificato - questo è per persona
        currency: currency.toLowerCase(),
        availableSpots: session.maxPax,
      }}
      tour={{
        id: tour.id,
        title: tour.title,
        startDate: session.start,
        endDate: session.end,
        coach: coach.name,
      }}
      user={user}
    />
  </>
  );
};

export default SessionCard;
