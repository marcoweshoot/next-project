"use client";

import Link from "next/link";
import React from "react";
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
} from "lucide-react";
import { getTourLink } from "@/components/tour-card/tourCardUtils";

interface SessionCardProps {
  session: {
    id: string;
    start: string;
    end: string;
    status: string; // GraphQL/Stripe status
    price: number;
    currency?: string;
    maxPax: number;
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
  ctaLabel?: string; // default: SCRIVICI ORA
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  tour,
  coach,
  isNext = false,
  ctaLabel = "SCRIVICI ORA",
}) => {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const month = startDate.toLocaleDateString("it-IT", { month: "long" });
    const year = startDate.getFullYear();

    return {
      dateRange: `${startDay} - ${endDay} ${month}`,
      year: year.toString(),
    };
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAvailableSpots = () => {
    const s = (session.status || "").toLowerCase();
    if (["soldout", "sold_out", "closed"].includes(s)) return 0;
    if (["waitinglist", "waiting_list"].includes(s)) return 0;
    return session.maxPax || 7;
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
  const { dateRange, year } = formatDateRange(session.start, session.end);

  const tourLink = getTourLink
    ? getTourLink({ slug: tour.slug, states: tour.states || [], places: tour.places || [] })
    : `/viaggi-fotografici/destinazioni/italia/italia/${tour.slug}`;

  const norm = (s?: string) => (s || "").toLowerCase();

  const getStatusBadge = (status: string) => {
    switch (norm(status)) {
      case "confirmed":
      case "open":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-primary/10 text-primary flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Iscrizioni aperte
          </Badge>
        );
      case "almostfull":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-destructive/10 text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Quasi pieno
          </Badge>
        );
      case "waitinglist":
      case "waiting_list":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-muted text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            Lista d'attesa
          </Badge>
        );
      case "soldout":
      case "sold_out":
      case "closed":
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-destructive/10 text-destructive">
            Tutto pieno
          </Badge>
        );
      default:
        return (
          <Badge className="rounded-full px-2.5 py-0.5 bg-secondary text-foreground">
            Iscrizioni aperte
          </Badge>
        );
    }
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm transition-all duration-300 hover:shadow-lg ${
        isNext ? "ring-2 ring-primary/50" : ""
      }`}
    >
      {/* gradient top bar */}
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
              <img
                src={
                  coach.avatar?.url ||
                  "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Coach-WeShoot.avif"
                }
                alt={coach.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm text-foreground font-medium">{coach.name}</span>
            </div>

            {/* Price and Actions */}
            <div className="pt-4 border-t border-border">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-foreground">
                  {new Intl.NumberFormat("it-IT", {
                    style: "currency",
                    currency: "EUR",
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
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-start md:justify-between md:gap-6">
            <div className="flex-1">
              {/* Date Range */}
              <div className="flex items-center gap-2 text-foreground mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {dateRange} {year}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration} giorni</span>
              </div>

              {/* Coach */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    coach.avatar?.url ||
                    "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Coach-WeShoot.avif"
                  }
                  alt={coach.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-foreground">{coach.name}</span>
              </div>

              {/* Available Spots Badge */}
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
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(price)}
              </div>
              <div className="mb-3 flex justify-end">{getStatusBadge(session.status)}</div>

              <div className="space-y-2">
                <Button onClick={openWhatsApp} className="w-full font-medium">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {ctaLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionCard;
