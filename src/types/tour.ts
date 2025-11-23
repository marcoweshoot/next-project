// @/types/tour.ts

import type { Image } from './media';
import type { Coach } from './coach';
import type { Destination, State, Place } from './location';
import type { Collection } from './collection';

export interface Tour {
  id: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;

  cover?: {
    url: string;
    alt: string;
    alternativeText?: string;
    gallery?: Image[];
  };

  featured?: boolean;

  // Dati logistici
  startDate: string;
  endDate?: string;
  duration: number;
  price: number;
  deposit?: number;
  availableSpots?: number;
  maxParticipants?: number;
  status?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  experience_level?: string;
  
  // Payment routing for Stripe Connect
  payment_recipient?: 'weshoot' | 'agency';

  // Coach
  coach: {
    id: string;
    name: string;
    slug: string;
    avatar?: {
      url: string;
      alt?: string;
    };
  };
  coaches?: Coach[];

  // Relazioni
  destination?: Destination;
  collection?: Collection;
  places?: Place[];
  states?: State[];

  // Sessioni
  sessions?: TourSession[];

  // Itinerario
  itinerary?: ItineraryDay[];
  days?: ItineraryDay[]; // Alias per itinerary per compatibilità

  // Cosa è incluso / escluso
  includes?: TourBlock[];
  excludes?: TourBlock[];
  highlights?: TourBlock[];
}

export interface TourSession {
  id: string;
  sessionId?: string;
  start: string;
  end: string;
  price: number;
  deposit?: number;
  currency?: string;
  maxPax: number;
  status?: string;
  users?: SessionUser[];
}

export interface SessionUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: Image;
}

export interface ItineraryDay {
  id: string | number; // ID univoco da Strapi
  day: number;
  title: string;
  description: string;
  steps?: DayStep[];
  activities?: string[];
  accommodation?: string;
  meals?: string[];
  isGrouped?: boolean; // Indica se è un giorno accorpato
  groupSize?: number; // Numero di giorni nel gruppo
  originalDays?: ItineraryDay[]; // Giorni originali prima dell'accorpamento
}

export interface DayStep {
  id: string;
  title: string;
  description: string;
  locations?: DayLocation[];
}

export interface DayLocation {
  id: string;
  title: string;
  slug: string;
  description?: string;
  pictures?: Image[];
}

export interface TourBlock {
  id?: string;
  title: string;
  description?: string;
  icon?: Image;
}
